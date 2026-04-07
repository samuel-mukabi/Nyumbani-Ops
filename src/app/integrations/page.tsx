'use client';

import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CTA from '@/components/landing/CTA';
import { FadeIn } from '@/components/landing/FadeIn';
import { 
    MessageCircle, 
    FileText, 
    Calendar, 
    CreditCard, 
    Globe, 
    Smartphone,
    ArrowUpRight,
    ArrowRight,
    Search
} from 'lucide-react';

const Integrations = () => {
    const integrations = [
        {
            name: "WhatsApp",
            category: "Communication",
            icon: <MessageCircle className="w-8 h-8 text-[#25D366]" />,
            description: "Direct guest communication with automated AI-powered responses and booking handling.",
            status: "Native Support"
        },
        {
            name: "eTIMS",
            category: "Compliance",
            icon: <FileText className="w-8 h-8 text-primary" />,
            description: "Seamless integration with KRA's electronic tax invoice management system for Kenya-based ops.",
            status: "Automated"
        },
        {
            name: "Google Calendar",
            category: "Scheduling",
            icon: <Calendar className="w-8 h-8 text-[#4285F4]" />,
            description: "Synchronize your bookings and cleaning schedules across all team calendars in real-time.",
            status: "Sync Enabled"
        },
        {
            name: "Stripe",
            category: "Payments",
            icon: <CreditCard className="w-8 h-8 text-[#635BFF]" />,
            description: "Process international credit card payments securely with automated deposit tracking.",
            status: "Direct Connect"
        },
        {
            name: "MPESA",
            category: "Payments",
            icon: <Smartphone className="w-8 h-8 text-[#4FBB31]" />,
            description: "The gold standard for Kenyan payments. Handle Lipa na M-PESA reconciliations automatically.",
            status: "Local API"
        },
        {
            name: "Airbnb",
            category: "OTA",
            icon: <Globe className="w-8 h-8 text-[#FF5A5F]" />,
            description: "Connect your listings to sync availability, guest messaging, and payment reports.",
            status: "Channel Manager"
        }
    ];

    return (
        <main className="min-h-screen bg-background flex flex-col selection:bg-primary/10">
            <Navbar />
            
            {/* Hero Section */}
            <section className="pt-32 pb-16 lg:pt-52 lg:pb-32 px-6 overflow-hidden">
                <div className="container mx-auto">
                    <FadeIn>
                        <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs mb-8 block">Global Connectivity</span>
                        <h1 className="text-6xl lg:text-[10rem] font-black text-foreground leading-[0.8] tracking-tighter mb-16">
                            Workflow, <br/>
                            <span className="text-primary italic font-serif">Unbound.</span>
                        </h1>
                    </FadeIn>
                    <div className="max-w-2xl">
                        <FadeIn delay={200}>
                            <p className="text-2xl lg:text-3xl text-on-surface-variant leading-relaxed font-light italic">
                                Discard the walled gardens. Nyumbani-Ops integrates seamlessly with the tools you already rely on.
                            </p>
                        </FadeIn>
                        
                        {/* Minimal Search/Filter Bar - De-carded */}
                        <FadeIn delay={400} className="mt-12">
                            <div className="relative group max-w-md">
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-variant group-focus-within:text-primary transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Search the ecosystem..." 
                                    className="w-full pl-8 pr-4 py-4 bg-transparent border-b border-surface-dim text-foreground focus:outline-none focus:border-primary transition-all text-xl font-light"
                                />
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Integrations Grid - Redesigned as an Elegant Directory (Zero Cards) */}
            <section className="pb-40 px-6">
                <div className="container mx-auto">
                    <div className="space-y-0">
                        {integrations.map((item, index) => (
                            <FadeIn key={index} delay={index * 50} direction="up">
                                <div className="group py-12 lg:py-16 border-t border-surface-dim first:border-t-0 flex flex-col lg:flex-row gap-12 lg:items-center relative">
                                    
                                    {/* Icon & Category */}
                                    <div className="lg:w-1/4 flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                                            {item.icon}
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">{item.category}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-widest">{item.status}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Name & Description */}
                                    <div className="flex-1 max-w-2xl">
                                        <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                                            {item.name}
                                        </h3>
                                        <p className="text-xl text-on-surface-variant leading-relaxed font-light">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* Action */}
                                    <div className="lg:w-1/4 flex lg:justify-end">
                                        <button className="flex items-center gap-2 text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            Details <ArrowUpRight className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Subtle Hover Reveal */}
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />
                                </div>
                            </FadeIn>
                        ))}
                        {/* Bottom Rule */}
                        <div className="border-t border-surface-dim" />
                    </div>

                    {/* Request Section - V3 structure but DE-CARDED (no box/border) */}
                    <FadeIn delay={400} className="mt-40 mb-20 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
                            
                            {/* Visual Side - Integration Map (Floating Nodes) */}
                            <div className="relative h-64 lg:h-[400px] flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-primary" />
                                    <div className="absolute top-1/2 left-3/4 w-3 h-3 rounded-full bg-secondary" />
                                    <div className="absolute top-3/4 left-1/2 w-3 h-3 rounded-full bg-tertiary" />
                                    <svg className="absolute inset-0 w-full h-full text-surface-variant/40" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <path d="M25 25 L75 50 M75 50 L50 75 M50 75 L25 25" stroke="currentColor" strokeWidth="0.5" fill="none" />
                                    </svg>
                                </div>
                                <div className="relative z-10 text-center">
                                    <div className="text-xl font-bold tracking-[0.5em] uppercase text-surface-variant/40 mb-4 select-none">Architectural</div>
                                    <div className="text-xs text-primary font-mono bg-surface-container py-2 px-6 rounded-full border border-surface-dim uppercase tracking-widest">Manual_Bridge_Protocol</div>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="relative">
                                <FadeIn direction="left">
                                    <span className="text-xs font-bold tracking-widest text-primary uppercase mb-8 block">Custom Engineering</span>
                                    <h3 className="text-4xl lg:text-7xl font-bold text-foreground mb-8 tracking-tighter leading-[0.9]">
                                        Don't see your favorite tool? <br/>
                                        <span className="text-primary italic font-serif">We'll engineer it.</span>
                                    </h3>
                                    <p className="text-xl lg:text-2xl text-on-surface-variant mb-12 leading-relaxed font-light italic">
                                        Our digital concierge service extends beyond the screen. Our engineers are ready to build the custom bridges your organization unique needs.
                                    </p>
                                    <button className="group inline-flex items-center gap-6 text-primary font-bold text-2xl">
                                        <span className="relative">
                                            Request a Custom Build
                                            <span className="absolute -bottom-1 left-0 w-0 h-1 bg-primary transition-all duration-300 group-hover:w-full" />
                                        </span>
                                        <ArrowRight className="w-8 h-8 group-hover:translate-x-4 transition-transform" />
                                    </button>
                                </FadeIn>
                            </div>

                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* Background Watermark */}
            <div className="fixed bottom-10 right-10 text-[10vw] font-black text-primary/5 select-none pointer-events-none whitespace-nowrap z-0 uppercase tracking-tighter">
                Connectivity
            </div>

            <CTA />
            <Footer />
        </main>
    );
};

export default Integrations;
