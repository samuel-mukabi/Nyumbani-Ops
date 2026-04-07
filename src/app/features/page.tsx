'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CTA from '@/components/landing/CTA';
import { FadeIn } from '@/components/landing/FadeIn';
import { ArrowRight } from 'lucide-react';

const FeaturesHub = () => {
    const sections = [
        {
            title: "Utility",
            highlight: "Assurance.",
            description: "We orchestrate the lifeblood of your property. Intelligent monitoring of KPLC tokens and water billing reconciliation ensures your operations never skip a beat. Automation that stays ahead of the meter.",
            href: "/features/kplc-integration",
            align: "left"
        },
        {
            title: "Dynamic",
            highlight: "Access.",
            description: "The threshold of hospitality, digitized. Enterprise-grade TTLock automation that generates and rotates access codes based on real-time booking schedules. Security that feels like a welcome mat.",
            href: "/features/ttlock-automation",
            align: "right"
        },
        {
            title: "Financial",
            highlight: "Ecosystem.",
            description: "Compliance is no longer a burden, but a byproduct. Direct eTIMS and M-PESA integration abstracts away the complexity of tax reconciliation and automated invoice generation. Fiscal precision on autopilot.",
            href: "/features/etims-compliance",
            align: "left"
        },
        {
            title: "Staff",
            highlight: "Orchestration.",
            description: "Human effort, synchronized by intelligence. Connect your cleaning and maintenance crews to booking cycles with real-time task dispatching. The invisible hand that keeps every room pristine.",
            href: "/features/staff-orchestration",
            align: "right"
        }
    ];

    return (
        <main className="min-h-screen bg-background flex flex-col selection:bg-primary/10">
            <Navbar />
            
            {/* Story Hero */}
            <section className="pt-32 pb-24 lg:pt-52 lg:pb-40 px-6 overflow-hidden">
                <div className="container mx-auto">
                    <FadeIn>
                        <h1 className="text-6xl lg:text-[12rem] font-black text-foreground leading-[0.8] tracking-tighter mb-16">
                            Features <br/>
                            <span className="text-primary italic font-serif">Redefined.</span>
                        </h1>
                    </FadeIn>
                    <div className="max-w-2xl">
                        <FadeIn delay={200}>
                            <p className="text-2xl lg:text-3xl text-on-surface-variant leading-relaxed font-light italic">
                                We believe hospitality is a story told through details. Nyumbani-Ops provides the canvas for your daily operations.
                            </p>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Narrative Sections */}
            <section className="pb-40 space-y-40 lg:space-y-64 px-6">
                {sections.map((section, index) => (
                    <div key={index} className="container mx-auto">
                        <div className={`flex flex-col lg:flex-row gap-12 lg:gap-24 items-start ${section.align === 'right' ? 'lg:flex-row-reverse' : ''}`}>
                            
                            {/* Massive Title Block */}
                            <div className="flex-1">
                                <FadeIn direction={section.align === 'left' ? 'right' : 'left'}>
                                    <h2 className="text-5xl lg:text-9xl font-bold tracking-tighter text-foreground leading-none">
                                        {section.title} <br/>
                                        <span className="text-primary italic font-serif">{section.highlight}</span>
                                    </h2>
                                </FadeIn>
                            </div>

                            {/* Alternating Paragraph Block */}
                            <div className="flex-1 lg:pt-12">
                                <FadeIn delay={200} direction="up">
                                    <div className="max-w-md space-y-10">
                                        <p className="text-xl lg:text-2xl text-on-surface-variant leading-relaxed">
                                            {section.description}
                                        </p>
                                        <Link 
                                            href={section.href}
                                            className="inline-flex items-center gap-4 text-primary font-bold text-lg group"
                                        >
                                            <span className="relative">
                                                Discover the details
                                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                                            </span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                        </Link>
                                    </div>
                                </FadeIn>
                            </div>

                        </div>
                    </div>
                ))}
            </section>

            <CTA />
            <Footer />
        </main>
    );
};

export default FeaturesHub;
