ALTER TABLE "unit_contracts"
ADD CONSTRAINT "unit_contracts_model_fields_check"
CHECK (
	("model" = 'commission' AND "commission_percent" IS NOT NULL AND "monthly_rent" IS NULL)
	OR
	("model" = 'arbitrage' AND "monthly_rent" IS NOT NULL AND "commission_percent" IS NULL)
);--> statement-breakpoint
ALTER TABLE "unit_contracts"
ADD CONSTRAINT "unit_contracts_commission_percent_range_check"
CHECK ("commission_percent" IS NULL OR ("commission_percent" >= 0 AND "commission_percent" <= 100));--> statement-breakpoint
ALTER TABLE "unit_contracts"
ADD CONSTRAINT "unit_contracts_monthly_rent_nonnegative_check"
CHECK ("monthly_rent" IS NULL OR "monthly_rent" >= 0);--> statement-breakpoint
CREATE OR REPLACE FUNCTION "public"."generate_owner_statement"(
	"p_organization_id" integer,
	"p_owner_id" integer,
	"p_statement_month" date
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
	v_month_start date;
	v_month_end date;
	v_statement_id integer;
	v_gross_revenue integer;
	v_platform_fees integer;
	v_cleaning_fees integer;
	v_maintenance_costs integer;
	v_utility_costs integer;
	v_transaction_fees integer;
	v_agency_commission integer;
	v_net_owner_payout integer;
BEGIN
	v_month_start := date_trunc('month', p_statement_month)::date;
	v_month_end := (v_month_start + interval '1 month')::date;

	SELECT os.id
	INTO v_statement_id
	FROM owner_statements os
	WHERE os.organization_id = p_organization_id
	  AND os.owner_id = p_owner_id
	  AND os.statement_month = v_month_start
	LIMIT 1;

	IF v_statement_id IS NOT NULL THEN
		DELETE FROM owner_statement_lines WHERE statement_id = v_statement_id;
	ELSE
		INSERT INTO owner_statements (
			organization_id,
			owner_id,
			statement_month,
			status
		)
		VALUES (
			p_organization_id,
			p_owner_id,
			v_month_start,
			'draft'
		)
		RETURNING id INTO v_statement_id;
	END IF;

	WITH owner_units AS (
		SELECT u.id AS unit_id
		FROM units u
		WHERE u.organization_id = p_organization_id
		  AND u.owner_id = p_owner_id
	),
	booking_rows AS (
		SELECT
			b.id AS booking_id,
			b.unit_id,
			COALESCE(b.gross_amount, b.total_amount, 0) AS gross_amount,
			COALESCE(b.platform_fee_amount, 0) AS platform_fee_amount,
			b.check_in_date AS occurred_at
		FROM bookings b
		JOIN owner_units ou ON ou.unit_id = b.unit_id
		WHERE b.organization_id = p_organization_id
		  AND b.check_in_date >= v_month_start
		  AND b.check_in_date < v_month_end
		  AND COALESCE(b.status, '') <> 'cancelled'
	),
	cleaning_rows AS (
		SELECT
			cj.id AS cleaning_job_id,
			cj.unit_id,
			cj.booking_id,
			COALESCE(cj.fee, 0) AS fee,
			COALESCE(cj.completed_at, cj.created_at) AS occurred_at
		FROM cleaning_jobs cj
		JOIN owner_units ou ON ou.unit_id = cj.unit_id
		WHERE cj.organization_id = p_organization_id
		  AND COALESCE(cj.completed_at, cj.created_at) >= v_month_start
		  AND COALESCE(cj.completed_at, cj.created_at) < v_month_end
		  AND cj.status <> 'cancelled'
	),
	maintenance_rows AS (
		SELECT
			mt.id AS maintenance_ticket_id,
			mt.unit_id,
			COALESCE(mt.cost, 0) AS cost,
			COALESCE(mt.resolved_at, mt.opened_at) AS occurred_at
		FROM maintenance_tickets mt
		JOIN owner_units ou ON ou.unit_id = mt.unit_id
		WHERE mt.organization_id = p_organization_id
		  AND COALESCE(mt.resolved_at, mt.opened_at) >= v_month_start
		  AND COALESCE(mt.resolved_at, mt.opened_at) < v_month_end
		  AND mt.owner_chargeable = true
	),
	utility_rows AS (
		SELECT
			ue.id AS utility_event_id,
			ue.unit_id,
			COALESCE(ue.amount, 0) AS amount,
			ue.occurred_at
		FROM utility_events ue
		JOIN owner_units ou ON ou.unit_id = ue.unit_id
		WHERE ue.organization_id = p_organization_id
		  AND ue.occurred_at >= v_month_start
		  AND ue.occurred_at < v_month_end
	),
	commission_rows AS (
		SELECT
			br.booking_id,
			br.unit_id,
			ROUND(br.gross_amount * (uc.commission_percent / 100.0))::integer AS commission_amount,
			br.occurred_at
		FROM booking_rows br
		JOIN unit_contracts uc ON uc.unit_id = br.unit_id
		WHERE uc.organization_id = p_organization_id
		  AND uc.model = 'commission'
		  AND uc.active_from <= br.occurred_at::date
		  AND (uc.active_to IS NULL OR uc.active_to >= br.occurred_at::date)
	)
	SELECT
		COALESCE((SELECT SUM(gross_amount) FROM booking_rows), 0),
		COALESCE((SELECT SUM(platform_fee_amount) FROM booking_rows), 0),
		COALESCE((SELECT SUM(fee) FROM cleaning_rows), 0),
		COALESCE((SELECT SUM(cost) FROM maintenance_rows), 0),
		COALESCE((SELECT SUM(amount) FROM utility_rows), 0),
		0,
		COALESCE((SELECT SUM(commission_amount) FROM commission_rows), 0)
	INTO
		v_gross_revenue,
		v_platform_fees,
		v_cleaning_fees,
		v_maintenance_costs,
		v_utility_costs,
		v_transaction_fees,
		v_agency_commission;

	v_net_owner_payout := v_gross_revenue
		- v_platform_fees
		- v_cleaning_fees
		- v_maintenance_costs
		- v_utility_costs
		- v_transaction_fees
		- v_agency_commission;

	UPDATE owner_statements
	SET
		gross_revenue = v_gross_revenue,
		platform_fees = v_platform_fees,
		cleaning_fees = v_cleaning_fees,
		maintenance_costs = v_maintenance_costs,
		utility_costs = v_utility_costs,
		transaction_fees = v_transaction_fees,
		agency_commission = v_agency_commission,
		net_owner_payout = v_net_owner_payout,
		status = 'draft',
		generated_at = now(),
		updated_at = now()
	WHERE id = v_statement_id;

	INSERT INTO owner_statement_lines (
		organization_id,
		statement_id,
		owner_id,
		unit_id,
		booking_id,
		line_type,
		description,
		amount,
		occurred_at,
		reference_type,
		reference_id
	)
	SELECT
		p_organization_id,
		v_statement_id,
		p_owner_id,
		br.unit_id,
		br.booking_id,
		'booking_revenue',
		'Booking revenue',
		br.gross_amount,
		br.occurred_at,
		'booking',
		br.booking_id
	FROM (
		SELECT
			b.id AS booking_id,
			b.unit_id,
			COALESCE(b.gross_amount, b.total_amount, 0) AS gross_amount,
			b.check_in_date AS occurred_at
		FROM bookings b
		JOIN units u ON u.id = b.unit_id
		WHERE b.organization_id = p_organization_id
		  AND u.owner_id = p_owner_id
		  AND b.check_in_date >= v_month_start
		  AND b.check_in_date < v_month_end
		  AND COALESCE(b.status, '') <> 'cancelled'
	) br;

	INSERT INTO owner_statement_lines (
		organization_id,
		statement_id,
		owner_id,
		unit_id,
		booking_id,
		line_type,
		description,
		amount,
		occurred_at,
		reference_type,
		reference_id
	)
	SELECT
		p_organization_id,
		v_statement_id,
		p_owner_id,
		br.unit_id,
		br.booking_id,
		'platform_fee',
		'Platform fee',
		-COALESCE(br.platform_fee_amount, 0),
		br.check_in_date,
		'booking',
		br.booking_id
	FROM bookings br
	JOIN units u ON u.id = br.unit_id
	WHERE br.organization_id = p_organization_id
	  AND u.owner_id = p_owner_id
	  AND br.check_in_date >= v_month_start
	  AND br.check_in_date < v_month_end
	  AND COALESCE(br.platform_fee_amount, 0) > 0
	  AND COALESCE(br.status, '') <> 'cancelled';

	INSERT INTO owner_statement_lines (
		organization_id,
		statement_id,
		owner_id,
		unit_id,
		booking_id,
		line_type,
		description,
		amount,
		occurred_at,
		reference_type,
		reference_id
	)
	SELECT
		p_organization_id,
		v_statement_id,
		p_owner_id,
		cj.unit_id,
		cj.booking_id,
		'cleaning_fee',
		'Cleaning fee',
		-COALESCE(cj.fee, 0),
		COALESCE(cj.completed_at, cj.created_at),
		'cleaning_job',
		cj.id
	FROM cleaning_jobs cj
	JOIN units u ON u.id = cj.unit_id
	WHERE cj.organization_id = p_organization_id
	  AND u.owner_id = p_owner_id
	  AND COALESCE(cj.completed_at, cj.created_at) >= v_month_start
	  AND COALESCE(cj.completed_at, cj.created_at) < v_month_end
	  AND cj.status <> 'cancelled'
	  AND COALESCE(cj.fee, 0) > 0;

	INSERT INTO owner_statement_lines (
		organization_id,
		statement_id,
		owner_id,
		unit_id,
		line_type,
		description,
		amount,
		occurred_at,
		reference_type,
		reference_id
	)
	SELECT
		p_organization_id,
		v_statement_id,
		p_owner_id,
		mt.unit_id,
		'maintenance_cost',
		'Maintenance cost',
		-COALESCE(mt.cost, 0),
		COALESCE(mt.resolved_at, mt.opened_at),
		'maintenance_ticket',
		mt.id
	FROM maintenance_tickets mt
	JOIN units u ON u.id = mt.unit_id
	WHERE mt.organization_id = p_organization_id
	  AND u.owner_id = p_owner_id
	  AND COALESCE(mt.resolved_at, mt.opened_at) >= v_month_start
	  AND COALESCE(mt.resolved_at, mt.opened_at) < v_month_end
	  AND mt.owner_chargeable = true
	  AND COALESCE(mt.cost, 0) > 0;

	INSERT INTO owner_statement_lines (
		organization_id,
		statement_id,
		owner_id,
		unit_id,
		line_type,
		description,
		amount,
		occurred_at,
		reference_type,
		reference_id
	)
	SELECT
		p_organization_id,
		v_statement_id,
		p_owner_id,
		ue.unit_id,
		'utility_cost',
		'Utility cost (' || ue.type || ')',
		-COALESCE(ue.amount, 0),
		ue.occurred_at,
		'utility_event',
		ue.id
	FROM utility_events ue
	JOIN units u ON u.id = ue.unit_id
	WHERE ue.organization_id = p_organization_id
	  AND u.owner_id = p_owner_id
	  AND ue.occurred_at >= v_month_start
	  AND ue.occurred_at < v_month_end
	  AND COALESCE(ue.amount, 0) > 0;

	INSERT INTO owner_statement_lines (
		organization_id,
		statement_id,
		owner_id,
		unit_id,
		booking_id,
		line_type,
		description,
		amount,
		occurred_at,
		reference_type,
		reference_id
	)
	SELECT
		p_organization_id,
		v_statement_id,
		p_owner_id,
		b.unit_id,
		b.id,
		'agency_commission',
		'Agency commission',
		-ROUND(COALESCE(b.gross_amount, b.total_amount, 0) * (uc.commission_percent / 100.0))::integer,
		b.check_in_date,
		'booking',
		b.id
	FROM bookings b
	JOIN units u ON u.id = b.unit_id
	JOIN unit_contracts uc ON uc.unit_id = b.unit_id
	WHERE b.organization_id = p_organization_id
	  AND uc.organization_id = p_organization_id
	  AND u.owner_id = p_owner_id
	  AND uc.model = 'commission'
	  AND b.check_in_date >= v_month_start
	  AND b.check_in_date < v_month_end
	  AND uc.active_from <= b.check_in_date::date
	  AND (uc.active_to IS NULL OR uc.active_to >= b.check_in_date::date)
	  AND COALESCE(b.status, '') <> 'cancelled'
	  AND COALESCE(b.gross_amount, b.total_amount, 0) > 0;

	RETURN v_statement_id;
END;
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION "public"."generate_owner_statement"(integer, integer, date) FROM PUBLIC;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "public"."generate_owner_statement"(integer, integer, date) TO authenticated;
