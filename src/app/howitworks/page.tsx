'use client';

import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CTA from '@/components/landing/CTA';
import { FadeIn } from '@/components/landing/FadeIn';
import { MousePointerClick, Zap, LayoutDashboard, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
    const steps = [
        {
            icon: <MousePointerClick className="w-8 h-8 text-primary" />,
            title: "Connect",
            subtitle: "Seamless Onboarding",
            description: "Link your WhatsApp, email, and booking channels in minutes. Nyumbani-Ops acts as the central nervous system for your property operations, gathering every guest interaction and operational signal into one workspace.",
            overlay: "Zero-friction setup designed for modern hosts.",
            direction: "left"
        },
        {
            icon: <Zap className="w-8 h-8 text-secondary" />,
            title: "Automate",
            subtitle: "Intelligent Workflows",
            description: "Deploy our digital concierge to handle repetitive tasks—from guest inquiries and booking confirmations to eTIMS tax compliance. Our AI doesn't just respond; it understands context and executes hospitality-grade service.",
            overlay: "Automation that feels like true hospitality.",
            direction: "right"
        },
        {
            icon: <LayoutDashboard className="w-8 h-8 text-tertiary" />,
            title: "Optimize",
            subtitle: "Data-Driven Decisions",
            description: "Gain clarity with a unified view of your organization. Track performance, manage resources, and scale your operations with analytics that show you exactly where to focus for maximum efficiency and growth.",
            overlay: "Turn operational noise into strategic growth.",
            direction: "left"
        }
    ];

    return (
        <main className="min-h-screen bg-background flex flex-col selection:bg-primary/10">
            <Navbar />
            
            {/* Hero Section */}
            <section className="pt-32 pb-24 lg:pt-52 lg:pb-40 px-6 overflow-hidden">
                <div className="container mx-auto">
                    <FadeIn>
                        <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs mb-8 block">The Methodology</span>
                        <h1 className="text-6xl lg:text-[10rem] font-black text-foreground leading-[0.8] tracking-tighter mb-16">
                            Operations, <br/>
                            <span className="text-primary italic font-serif">Refined.</span>
                        </h1>
                    </FadeIn>
                    <div className="max-w-2xl">
                        <FadeIn delay={200}>
                            <p className="text-2xl lg:text-3xl text-on-surface-variant leading-relaxed font-light italic">
                                We transform operational complexity into a seamless digital concierge experience via a three-phase evolution.
                            </p>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Steps Section - Zero Card Vertical Narrative */}
            <section className="pb-40 space-y-40 lg:space-y-64 px-6">
                {steps.map((step, index) => (
                    <div key={index} className="container mx-auto">
                        <div className={`flex flex-col lg:flex-row gap-16 lg:gap-32 items-center ${step.direction === 'right' ? 'lg:flex-row-reverse' : ''}`}>
                            
                            {/* Massive Step Number */}
                            <div className="flex-1 text-center lg:text-left">
                                <FadeIn direction={step.direction === 'left' ? 'right' : 'left'}>
                                    <div className="relative inline-block">
                                        <span className="text-[12rem] lg:text-[20rem] font-black text-primary/5 select-none leading-none tracking-tighter font-serif italic">
                                            0{index + 1}
                                        </span>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-surface-container flex items-center justify-center text-primary shadow-2xl">
                                            {step.icon}
                                        </div>
                                    </div>
                                </FadeIn>
                            </div>

                            {/* Content Block */}
                            <div className="flex-1 space-y-8">
                                <FadeIn delay={200} direction="up">
                                    <span className="text-xs font-bold text-primary uppercase tracking-[0.3em]">{step.subtitle}</span>
                                    <h2 className="text-5xl lg:text-8xl font-bold text-foreground tracking-tighter leading-none">
                                        {step.title}
                                    </h2>
                                    <p className="text-xl lg:text-2xl text-on-surface-variant leading-relaxed font-light">
                                        {step.description}
                                    </p>
                                    <div className="pt-8 border-t border-surface-dim flex items-center gap-4 text-primary font-bold">
                                        <ArrowRight className="w-5 h-5" />
                                        <span className="italic font-serif text-xl">{step.overlay}</span>
                                    </div>
                                </FadeIn>
                            </div>

                        </div>
                    </div>
                ))}
            </section>

            {/* Details Section - De-Carded */}
            <section className="py-40 bg-surface-container-low/30 border-y border-surface-dim">
                <div className="container mx-auto px-6">
                    <FadeIn>
                        <h2 className="text-4xl lg:text-7xl font-bold mb-20 tracking-tighter text-center">
                            Built for the <br/>
                            <span className="text-primary italic font-serif">Modern Enterprise.</span>
                        </h2>
                    </FadeIn>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
                        <FadeIn delay={100} direction="up">
                            <div className="space-y-6">
                                <h4 className="text-2xl font-bold text-on-surface">Effortless Compliance</h4>
                                <p className="text-xl text-on-surface-variant font-light leading-relaxed">
                                    Automatically generate eTIMS invoices and maintain high-fidelity tax compliance without a single second of manual data entry.
                                </p>
                            </div>
                        </FadeIn>
                        <FadeIn delay={200} direction="up">
                            <div className="space-y-6">
                                <h4 className="text-2xl font-bold text-on-surface">Multi-Channel Sync</h4>
                                <p className="text-xl text-on-surface-variant font-light leading-relaxed">
                                    Sync bookings and conversations across WhatsApp, Airbnb, and your direct portal. Harmony across every touchpoint.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Background Watermark */}
            <div className="fixed top-1/2 left-10 -translate-y-1/2 -rotate-90 text-[15rem] font-black text-primary/2 select-none pointer-events-none whitespace-nowrap z-0 uppercase">
                Methodology
            </div>

            <CTA />
            <Footer />
        </main>
    );
};

export default HowItWorks;
