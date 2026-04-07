'use client';

import { useState } from "react";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { submitOnboardingAction } from "@/lib/actions/onboarding";
import { useFormStatus } from "react-dom";
import { FadeIn } from "@/components/landing/FadeIn";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="h-14 w-full rounded-xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/10 transition-all"
    >
      {pending ? "Setting up..." : "Complete Setup"}
      {!pending && <ArrowRight className="w-4 h-4" />}
    </Button>
  );
}

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [orgName, setOrgName] = useState("");

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background selection:bg-primary/20">
      
      {/* Editorial Narrative Side (Matching Login Style) */}
      <section className="hidden lg:flex flex-col justify-between p-16 bg-surface-container-low border-r border-surface-dim relative overflow-hidden">
        
        {/* Logo / Branding */}
        <Link href="/" className="text-primary font-bold text-2xl z-10 hover:text-primary/80 transition-colors">
            Nyumbani-Ops
        </Link>

        {/* Massive Typography */}
        <div className="relative z-10 w-full">
            <FadeIn direction="right">
                <h1 className="text-8xl lg:text-[10rem] font-black text-foreground leading-[0.85] tracking-tighter mb-12">
                    {step === 1 ? (
                      <>Setup <br/>Organization.</>
                    ) : (
                      <>Add <br/><span className="text-primary italic font-serif">Property.</span></>
                    )}
                </h1>
                <p className="text-2xl text-on-surface-variant max-w-md leading-relaxed font-light italic">
                    {step === 1 
                      ? "Nyumbani-Ops requires you to create an organization to manage your team and properties." 
                      : "Let's add your first property to get started with the dashboard."}
                </p>
            </FadeIn>
        </div>

        {/* Footer info */}
        <div className="z-10 text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant/40 flex items-center gap-4">
            NYUMBANI_OPS • SETUP
            <div className="flex gap-1.5 ml-4">
                <div className={`w-8 h-1 rounded-full transition-colors ${step === 1 ? 'bg-primary' : 'bg-outline-variant/20'}`} />
                <div className={`w-8 h-1 rounded-full transition-colors ${step === 2 ? 'bg-primary' : 'bg-outline-variant/20'}`} />
            </div>
        </div>

        {/* Decorative Watermark */}
        <div className="absolute bottom-0 right-0 text-[20vw] font-black text-primary/5 select-none pointer-events-none whitespace-nowrap leading-none tracking-tighter italic font-serif translate-y-1/4 translate-x-1/4">
            {step === 1 ? "ORG" : "PROPERTY"}
        </div>
      </section>

      {/* Setup Interaction Side */}
      <section className="flex items-center justify-center p-8 bg-background overflow-y-auto">
        <FadeIn delay={200} className="w-full flex-col flex items-center max-w-[400px]">
            <div className="text-center mb-12 w-full">
                <span className="text-[10px] font-bold tracking-widest text-secondary uppercase block mb-3">
                   Setup • Step {step} of 2
                </span>
                <h2 className="text-3xl font-bold text-foreground mb-3">
                   {step === 1 ? "Setup Organization" : "Add First Property"}
                </h2>
                <p className="text-on-surface-variant">
                   {step === 1 
                     ? "Create your organization to manage your team." 
                     : "Add the details for your first property."}
                </p>
            </div>

            <form action={submitOnboardingAction} className="w-full relative min-h-[320px]">
                {/* Step 1: Organization */}
                <div className={`absolute top-0 left-0 w-full space-y-6 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${step === 1 ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-12 pointer-events-none z-0'}`}>
                    <div className="space-y-2 text-left">
                        <Label htmlFor="organizationName" className="text-foreground">Organization Name</Label>
                        <Input 
                            id="organizationName"
                            name="organizationName"
                            type="text" 
                            placeholder="e.g. Nyumbani Elite Properties"
                            required={step === 1}
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (orgName.trim().length > 0) setStep(2);
                                }
                            }}
                            className="h-14 rounded-xl bg-transparent border-surface-dim focus-visible:ring-primary"
                        />
                    </div>
                    <Button 
                        type="button" 
                        onClick={() => {
                          if (orgName.trim().length > 0) setStep(2);
                        }}
                        className="h-14 w-full rounded-xl font-bold flex gap-3 shadow-xl shadow-primary/10"
                    >
                        Continue to Unit Setup
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Step 2: Property */}
                <div className={`absolute top-0 left-0 w-full space-y-6 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${step === 2 ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-12 pointer-events-none z-0'}`}>
                    <div className="space-y-4">
                        <div className="space-y-2 text-left">
                            <Label htmlFor="propertyName" className="text-foreground">Property Name</Label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                                <Input 
                                    id="propertyName"
                                    name="propertyName"
                                    type="text" 
                                    placeholder="e.g. The Sapphire Penthouse"
                                    required={step === 2}
                                    className="h-14 rounded-xl bg-transparent border-surface-dim pl-11 focus-visible:ring-primary"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 text-left">
                            <Label htmlFor="propertyAddress" className="text-foreground">Location</Label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                                <Input 
                                    id="propertyAddress"
                                    name="propertyAddress"
                                    type="text" 
                                    placeholder="e.g. Westlands, Nairobi"
                                    required={step === 2}
                                    className="h-14 rounded-xl bg-transparent border-surface-dim pl-11 focus-visible:ring-primary"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-2 flex gap-3">
                        <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setStep(1)}
                            className="h-14 px-6 rounded-xl font-bold border-surface-dim hover:bg-surface-container-low transition-colors text-on-surface-variant bg-transparent"
                        >
                            Back
                        </Button>
                        <div className="flex-1">
                            <SubmitButton />
                        </div>
                    </div>
                </div>
            </form>

            {/* Support/Info info footer */}
            <div className="mt-12 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/30 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-current" />
                Your data is stored securely.
            </div>
        </FadeIn>
      </section>

    </main>
  );
}
