'use client';

import React, { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CTA from '@/components/landing/CTA';
import { FadeIn } from '@/components/landing/FadeIn';
import { Check, Info, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Pricing = () => {
    const [isAnnual, setIsAnnual] = useState(true);

    const plans = [
        {
            name: "Essential",
            price: isAnnual ? "4,900" : "5,900",
            description: "Perfect for secondary property hosts managing a few units with basic automation needs.",
            features: [
                "Up to 3 properties",
                "WhatsApp Gateway Integration",
                "Basic eTIMS Automation",
                "Standard Scheduling Sync",
                "Email Support"
            ],
            cta: "Start Free",
            highlight: false
        },
        {
            name: "Concierge",
            price: isAnnual ? "12,500" : "14,900",
            description: "The sweet spot for growing property management teams requiring deep intelligence and scaling.",
            features: [
                "Unlimited properties",
                "AI Agent (Digital Concierge)",
                "Full eTIMS Compliance Suite",
                "Advanced Revenue Analytics",
                "Priority 24/7 Support",
                "Custom Integration API"
            ],
            cta: "Get Started",
            highlight: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "Tailored infrastructure for large scale hospitality organizations and real estate firms.",
            features: [
                "Custom AI Training",
                "Dedicated Account Manager",
                "SLA Guarantees",
                "On-premise deployment options",
                "White-label possibilities",
                "Audit Logs & Security Suite"
            ],
            cta: "Talk to Sales",
            highlight: false
        }
    ];

    return (
        <main className="min-h-screen bg-background flex flex-col selection:bg-primary/10">
            <Navbar />
            
            {/* Hero Section */}
            <section className="pt-32 pb-16 lg:pt-52 lg:pb-32 px-6 overflow-hidden">
                <div className="container mx-auto">
                    <FadeIn>
                        <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs mb-8 block">Investment Architecture</span>
                        <h1 className="text-6xl lg:text-[10rem] font-black text-foreground leading-[0.8] tracking-tighter mb-16">
                            Value, <br/>
                            <span className="text-primary italic font-serif">Simplified.</span>
                        </h1>
                    </FadeIn>
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                        <FadeIn delay={200} className="max-w-2xl">
                            <p className="text-2xl lg:text-3xl text-on-surface-variant leading-relaxed font-light italic">
                                Transparent tiers designed to grow with your organization. No hidden containers, just pure operational freedom.
                            </p>
                        </FadeIn>
                        
                        {/* Annual/Monthly Toggle - De-carded */}
                        <FadeIn delay={400}>
                            <div className="flex items-center gap-6 bg-surface-container py-3 px-6 rounded-full border border-surface-dim">
                                <button 
                                    onClick={() => setIsAnnual(false)}
                                    className={`text-sm font-bold tracking-widest uppercase transition-colors ${!isAnnual ? 'text-primary' : 'text-on-surface-variant'}`}
                                >
                                    Monthly
                                </button>
                                <div className="w-px h-4 bg-surface-dim" />
                                <button 
                                    onClick={() => setIsAnnual(true)}
                                    className={`text-sm font-bold tracking-widest uppercase transition-colors flex items-center gap-2 ${isAnnual ? 'text-primary' : 'text-on-surface-variant'}`}
                                >
                                    Yearly <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">-20%</span>
                                </button>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Pricing Section - Zero Cards Vertical List */}
            <section className="pb-40 px-6">
                <div className="container mx-auto">
                    <div className="space-y-0">
                        {plans.map((plan, index) => (
                            <FadeIn key={index} delay={index * 100} direction="up">
                                <div className={`group py-20 lg:py-32 border-t border-surface-dim first:border-t-0 relative ${plan.highlight ? 'z-10' : ''}`}>
                                    {plan.highlight && (
                                        <div className="absolute top-0 left-0 -translate-y-1/2 flex items-center gap-2 px-4 py-1.5 bg-primary text-on-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
                                            <Sparkles className="w-3 h-3" />
                                            Most Popular Selection
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
                                        
                                        {/* Tier Info */}
                                        <div className="lg:col-span-4 space-y-6">
                                            <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase">{plan.name} Tier</span>
                                            <h3 className="text-4xl lg:text-6xl font-bold text-foreground tracking-tighter">
                                                {plan.name}
                                            </h3>
                                            <p className="text-xl text-on-surface-variant font-light leading-relaxed italic">
                                                {plan.description}
                                            </p>
                                        </div>

                                        {/* Pricing Info */}
                                        <div className="lg:col-span-3">
                                            <div className="flex flex-col">
                                                <div className="flex items-baseline gap-2">
                                                    {plan.price !== "Custom" && <span className="text-2xl font-serif italic text-primary">KES</span>}
                                                    <span className="text-6xl lg:text-8xl font-black text-foreground tracking-tighter leading-none">
                                                        {plan.price}
                                                    </span>
                                                </div>
                                                {plan.price !== "Custom" && (
                                                    <span className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mt-4">
                                                        Per Month / {isAnnual ? 'Billed Yearly' : 'Billed Monthly'}
                                                    </span>
                                                )}
                                                <div className="mt-12">
                                                    <Button 
                                                        variant={plan.highlight ? 'default' : 'outline'} 
                                                        size="lg" 
                                                        className={`w-full lg:w-auto h-16 px-10 rounded-xl font-bold text-lg transition-all duration-500 ${!plan.highlight && 'border-surface-dim hover:bg-surface-container'}`}
                                                    >
                                                        {plan.cta}
                                                        <ArrowRight className="w-5 h-5 ml-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Features List */}
                                        <div className="lg:col-span-5">
                                            <div className="space-y-6">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-8">Service Parameters</span>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                                                    {plan.features.map((feature, fIndex) => (
                                                        <div key={fIndex} className="flex items-start gap-4 text-lg text-on-surface group/item">
                                                            <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0 mt-1">
                                                                <Check className="w-3 h-3 text-primary" />
                                                            </div>
                                                            <span className="font-light leading-snug group-hover/item:text-primary transition-colors cursor-default">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Subtle Hover Reveal */}
                                    <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />
                                </div>
                            </FadeIn>
                        ))}
                        {/* Bottom Rule */}
                        <div className="border-t border-surface-dim" />
                    </div>
                </div>
            </section>

            {/* FAQ section - De-Carded */}
            <section className="py-40 bg-surface-container-low/30 border-y border-surface-dim">
                <div className="container mx-auto px-6">
                    <FadeIn>
                        <h2 className="text-4xl lg:text-7xl font-bold mb-24 tracking-tighter text-center">
                            Questions <br/>
                            <span className="text-primary italic font-serif">Answered.</span>
                        </h2>
                    </FadeIn>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-20 max-w-6xl mx-auto">
                        <FadeIn direction="up">
                            <div className="space-y-4">
                                <h4 className="text-2xl font-bold flex items-center gap-4 text-foreground">
                                    <span className="text-primary italic font-serif text-3xl">Q.</span>
                                    Can I upgrade later?
                                </h4>
                                <p className="text-xl text-on-surface-variant font-light leading-relaxed pl-12">
                                    Yes, you can upgrade your plan at any time. The difference will be automatically prorated on your next billing cycle.
                                </p>
                            </div>
                        </FadeIn>
                        <FadeIn delay={100} direction="up">
                            <div className="space-y-4">
                                <h4 className="text-2xl font-bold flex items-center gap-4 text-foreground">
                                    <span className="text-primary italic font-serif text-3xl">Q.</span>
                                    Is eTIMS included?
                                </h4>
                                <p className="text-xl text-on-surface-variant font-light leading-relaxed pl-12">
                                    Automated eTIMS generation is natively supported in the Concierge and Enterprise tiers for all Kenyan-based businesses.
                                </p>
                            </div>
                        </FadeIn>
                        <FadeIn delay={200} direction="up">
                            <div className="space-y-4">
                                <h4 className="text-2xl font-bold flex items-center gap-4 text-foreground">
                                    <span className="text-primary italic font-serif text-3xl">Q.</span>
                                    Do you offer support?
                                </h4>
                                <p className="text-xl text-on-surface-variant font-light leading-relaxed pl-12">
                                    Email support is standard. Concierge users enjoy priority 24/7 access to our specialized team of digital concierges.
                                </p>
                            </div>
                        </FadeIn>
                        <FadeIn delay={300} direction="up">
                            <div className="space-y-4">
                                <h4 className="text-2xl font-bold flex items-center gap-4 text-foreground">
                                    <span className="text-primary italic font-serif text-3xl">Q.</span>
                                    Is there a setup fee?
                                </h4>
                                <p className="text-xl text-on-surface-variant font-light leading-relaxed pl-12">
                                    No. Transparency is core to our service. There are zero setup fees for Essential and Concierge implementations.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Background Watermark */}
            <div className="fixed top-1/2 right-10 -translate-y-1/2 -rotate-90 text-[10vw] font-black text-primary/5 select-none pointer-events-none whitespace-nowrap z-0">
                NYUMBANI_PRICING_DEPT
            </div>

            <CTA />
            <Footer />
        </main>
    );
};

export default Pricing;
