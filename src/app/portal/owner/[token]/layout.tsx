import { db } from "@/db";
import { owners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

export default async function OwnerPortalLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { token: string };
}) {
  const token = params.token;
  
  // Validate token
  const ownerResult = await db.select().from(owners).where(eq(owners.secureToken, token));
  const owner = ownerResult[0];

  if (!owner) {
    notFound(); 
  }

  // Token expiration logic
  if (owner.tokenExpiresAt && new Date() > owner.tokenExpiresAt) {
    return (
      <div className="min-h-screen flex text-center items-center justify-center bg-gray-50 text-gray-500">
        <div>
           <h1 className="text-xl font-medium text-black">Link Expired</h1>
           <p className="mt-2">Please request a new secure link from your property manager.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <nav className="border-b border-gray-100 flex items-center justify-between px-6 py-4">
         <div className="font-heading italic tracking-tight font-medium">NyumbaniOps <span className="opacity-40">Portal</span></div>
         <div className="text-sm border border-gray-100 rounded-full px-4 py-1.5 shadow-sm text-gray-600">
           {owner.fullName}
         </div>
      </nav>
      {children}
    </div>
  );
}
