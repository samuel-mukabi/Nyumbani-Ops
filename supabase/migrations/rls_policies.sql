-- Enable Row Level Security (RLS) on all tables in public schema
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 1. Policies for 'users'
-- Hosts can see and manage their own profile and members in their organization
CREATE POLICY "Users within organization isolation" 
ON public.users 
FOR ALL 
TO authenticated 
USING (organization_id = (auth.jwt() ->> 'org_id')::text);

-- 2. Policies for 'properties'
-- Hosts can manage properties in their organization
CREATE POLICY "Properties within organization isolation" 
ON public.properties 
FOR ALL 
TO authenticated 
USING (organization_id = (auth.jwt() ->> 'org_id')::text);

-- Guests can view a single property during their booking (usingslug or ID)
-- (This will be specifically granted via a secure route in our Next.js app)

-- 3. Policies for 'bookings'
-- Hosts can see and manage bookings for their properties
CREATE POLICY "Bookings within organization isolation" 
ON public.bookings 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = bookings.property_id 
    AND properties.organization_id = (auth.jwt() ->> 'org_id')::text
  )
);

-- 4. Policies for 'tasks'
-- Hosts can see and manage all tasks in their organization
CREATE POLICY "Tasks within organization isolation" 
ON public.tasks 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.properties 
    WHERE properties.id = tasks.property_id 
    AND properties.organization_id = (auth.jwt() ->> 'org_id')::text
  )
);
