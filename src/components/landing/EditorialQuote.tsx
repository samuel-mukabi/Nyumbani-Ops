'use client';

import React from 'react';
import { FadeIn } from './FadeIn';

const EditorialQuote = () => {
    return (
        <section className="py-24 lg:py-64 bg-background overflow-hidden selection:bg-primary/20">
            <div className="container mx-auto px-6 relative">
                
                {/* Background Watermark Accent */}
                <div className="absolute -top-24 right-0 text-[15vw] font-black text-primary/5 select-none pointer-events-none whitespace-nowrap leading-none hidden lg:block">
                    OPERATIONAL_GRACE
                </div>

                <div className="relative z-10 space-y-24 lg:space-y-40">
                    
                    {/* First Line: Assertive & Massive */}
                    <div className="max-w-7xl">
                        <FadeIn direction="right" className="flex flex-col">
                            <h2 className="text-5xl lg:text-[9rem] font-bold text-foreground leading-[0.8] tracking-tighter mt-10">
                                Automation should <br/>
                                <span className="text-primary italic font-serif">never</span> feel robotic.
                            </h2>
                        </FadeIn>
                    </div>

                    {/* Second Line: Elegant & Offset */}
                    <div className="flex justify-end">
                        <div className="max-w-4xl lg:text-right">
                            <FadeIn direction="left" delay={300}>
                                <h3 className="text-4xl lg:text-7xl font-light text-on-surface-variant leading-tight tracking-tight italic font-serif">
                                    It should feel like a <span className="text-primary not-italic font-black sans">concierge</span> <br/>
                                    who anticipates every need before it <span className="text-secondary font-bold font-sans not-italic uppercase tracking-widest text-2xl lg:text-4xl ml-2">arises.</span>
                                </h3>
                            </FadeIn>
                        </div>
                    </div>

                </div>

                {/* Decorative Rule */}
                <div className="mt-32 lg:mt-64 border-t border-surface-dim w-1/3 ml-auto opacity-50" />
            </div>
        </section>
    );
};

export default EditorialQuote;
