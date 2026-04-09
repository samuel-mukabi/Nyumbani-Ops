import { db } from "@/db";
import { owners, ownerStatements, units } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function OwnerPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  // Fetch owner via token
  const ownerResult = await db.select().from(owners).where(eq(owners.secureToken, token));
  const owner = ownerResult[0];

  // Fetch statements and units
  const statements = await db.select().from(ownerStatements).where(eq(ownerStatements.ownerId, owner.id));
  const ownerUnits = await db.select().from(units).where(eq(units.ownerId, owner.id));

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
      <header className="space-y-4">
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">Landlord Dashboard</p>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight">Portfolio Summary</h1>
      </header>
      
      <div className="grid md:grid-cols-2 gap-8">
         <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
           <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-6">Financial Overview</h3>
           <div className="space-y-6">
              <div>
                 <p className="text-xs text-gray-400 uppercase">Recent Payout</p>
                 <p className="text-3xl font-light">KES {statements[0]?.netOwnerPayout || 0}</p>
                 <p className="text-sm mt-1 text-green-600">Successfully disbursed to {owner.payoutMethod}</p>
              </div>
           </div>
           {/* Here we would mount <FinancialChart /> */}
           <div className="mt-8 h-32 w-full bg-white border border-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-300">
             [Financial Chart Component]
           </div>
         </div>

         <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
           <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-6">Live Unit Health</h3>
           <div className="space-y-4">
             {ownerUnits.map(unit => (
               <div key={unit.id} className="bg-white border border-gray-100 p-4 rounded-xl flex items-center justify-between">
                 <div>
                   <p className="font-medium text-black">{unit.name}</p>
                   <p className="text-xs text-gray-400">Code: {unit.unitCode}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-xs text-gray-400">KPLC Token Balance</p>
                   <p className="font-semibold text-green-600">Good</p>
                 </div>
               </div>
             ))}
             {ownerUnits.length === 0 && <p className="text-sm text-gray-400">No units attached to this portfolio.</p>}
           </div>
         </div>
      </div>
    </main>
  );
}
