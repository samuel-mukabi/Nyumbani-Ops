import { OrganizationList } from "@clerk/nextjs";

export default function SelectOrgPage() {
  return (
    <div className="min-h-screen bg-surface flex font-sans">
      
      {/* Asymmetrical Layout: 40% Text Panel, 60% Form Panel */}
      <div className="grid lg:grid-cols-[0.8fr_1.2fr] w-full max-w-[1440px] mx-auto min-h-screen items-center">
         
         {/* Left Info Panel */}
         <div className="p-12 lg:p-24 flex flex-col justify-center h-full relative z-10">
            <div className="mb-4">
              <span className="text-[10px] font-bold tracking-widest text-secondary uppercase block mb-4">
                 Initialization
              </span>
              <h1 className="font-heading text-5xl text-on-surface mb-8 tracking-tight font-light">
                 Configure <br/>Workspace.
              </h1>
            </div>
            
            <p className="text-on-surface-variant font-medium text-lg leading-[1.6]">
              Nyumbani-Ops operates strictly on a team-management architecture. 
            </p>
            <p className="text-on-surface-variant font-light text-base mt-2 leading-[1.6]">
              To properly assign KPLC webhooks and TTLock codes, you must bind your user account to a management entity. 
            </p>

            <div className="mt-16 w-full h-[1px] bg-outline-variant/30" />
            
            <div className="mt-12 flex items-center gap-4">
               <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center">
                  <span className="font-heading font-medium text-on-surface leading-none text-sm">N</span>
               </div>
               <span className="font-heading font-medium tracking-tight text-on-surface">Nyumbani<span className="opacity-40">Ops</span></span>
            </div>
         </div>

         {/* Right Action Panel */}
         <div className="relative w-full h-full p-6 lg:p-12 flex items-center justify-center">
            {/* The Asymmetrical Form Canvas */}
            <div className="absolute inset-0 bg-surface-container-low rounded-tl-[80px] rounded-bl-[20px] overflow-hidden">
               {/* Organic texture/blur */}
               <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-md shadow-[0_32px_64px_rgba(28,28,24,0.04)] rounded-3xl overflow-hidden border border-outline-variant/10 bg-surface-container-lowest">
               <div className="py-6 px-8 bg-surface-container-lowest border-b border-surface-container-low">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Active Directories</p>
               </div>
               <OrganizationList 
                 hidePersonal={true}
                 afterSelectOrganizationUrl="/dashboard"
                 afterCreateOrganizationUrl="/dashboard"
                 appearance={{
                   elements: {
                     rootBox: "w-full",
                     cardBox: "w-full shadow-none border-none rounded-none m-0 bg-transparent",
                     organizationListPreviewButton: "border-b border-surface-container rounded-none hover:bg-surface-container-low transition-colors py-6 pl-8",
                     headerTitle: "hidden", // We built our own header above
                     headerSubtitle: "hidden",
                     organizationListPreviewMainIdentifier: "text-on-surface font-semibold text-lg",
                     organizationListPreviewSecondaryIdentifier: "text-on-surface-variant font-medium",
                   }
                 }}
               />
            </div>
         </div>

      </div>
    </div>
  );
}
