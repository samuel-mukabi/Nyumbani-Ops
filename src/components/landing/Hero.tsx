'use client';

import React from 'react';
import Link from 'next/link';
import { FadeIn } from './FadeIn';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Globe, Smartphone, MessageCircle } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative w-full flex items-center min-h-[calc(100dvh-5rem)] overflow-hidden bg-background py-12 lg:py-20">
      {/* Visual Depth - Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-full bg-linear-to-b from-primary/5 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-120 h-120 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Text Content Area */}
          <div className="max-w-2xl">
            <FadeIn delay={0}>
              <h1 className="text-5xl lg:text-[6.5rem] font-black leading-[1.1] tracking-tighter mb-8 text-foreground">
                Property Management, <br/>
                <span className="text-primary italic font-serif">Made Simple.</span>
              </h1>
            </FadeIn>
            
            <FadeIn delay={100}>
              <p className="text-lg lg:text-xl text-on-surface-variant mb-10 leading-relaxed max-w-lg font-light italic">
                Experience a world without stress. <strong className='font-bold'>Nyumbani-Ops </strong>provides the tools to automate your properties with ease.
              </p>
            </FadeIn>
            
            <FadeIn delay={200}>
              <div className="flex flex-col sm:flex-row gap-5 mb-12">
                <Link href="/dashboard">
                  <Button size="lg" className="h-14 px-8 rounded-xl text-base font-bold group shadow-2xl shadow-primary/20 cursor-pointer">
                    Start Today
                    <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
                <Link href="/howitworks">
                  <button className="h-14 px-8 text-base font-bold text-on-surface cursor-pointer hover:text-primary transition-colors flex items-center justify-center underline decoration-primary/30 decoration-2 underline-offset-8">
                    See How It Works
                  </button>
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={300}>
                <div className="flex flex-wrap items-center gap-8 text-on-surface-variant">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Easy to Use</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Fast Payouts</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">24/7 Support</span>
                    </div>
                </div>
            </FadeIn>
          </div>

          {/* Abstract Architectural Visual (Zero-Card Design) */}
          <FadeIn delay={100} direction="left" className="relative h-96 lg:h-[30rem] flex items-center justify-center">
            
            {/* Background Narrative Typography */}
            <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden">
                <div className="text-[10rem] lg:text-[16rem] font-black text-primary/5 tracking-tighter leading-none italic font-serif -rotate-12 translate-x-20">
                    EASY
                </div>
                <div className="absolute top-0 right-0 text-6xl font-bold text-secondary/5 tracking-widest uppercase">
                    Simple
                </div>
                <div className="absolute bottom-20 left-0 text-6xl font-bold text-tertiary/5 tracking-widest uppercase -rotate-90">
                    Fast
                </div>
            </div>

            {/* Central Hub Node */}
            <div className="relative z-10 w-40 h-40 lg:w-56 lg:h-56 rounded-full bg-surface-container/50 border border-surface-dim backdrop-blur-3xl flex items-center justify-center shadow-2xl">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
                <div className="text-center space-y-1.5">
                    <Sparkles className="w-10 h-10 text-primary mx-auto mb-1.5 animate-bounce-slow" />
                    <div className="text-[9px] font-bold tracking-[0.4em] text-primary uppercase">Smart Platform</div>
                </div>
                
                {/* Connection Lines (SVG) */}
                <svg className="absolute -inset-full w-[300%] h-[300%] text-surface-dim pointer-events-none" viewBox="0 0 100 100">
                    <path d="M50 50 L20 20" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 2" className="animate-pulse" />
                    <path d="M50 50 L80 30" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 2" />
                    <path d="M50 50 L75 80" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 2" />
                    <path d="M50 50 L25 75" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 2" />
                </svg>
            </div>

            {/* Floating Nodes (Liquid Layout) */}
            <div className="absolute top-1/4 left-1/4 animate-bounce-slow">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-surface border border-surface-dim flex items-center justify-center shadow-xl">
                        <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">WhatsApp</span>
                </div>
            </div>

            <div className="absolute top-1/3 right-1/4 delay-75 animate-bounce-slow">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-surface border border-surface-dim flex items-center justify-center shadow-lg">
                        <FileTextIcon className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">eTIMS</span>
                </div>
            </div>

            <div className="absolute bottom-1/4 right-1/3 delay-150 animate-bounce-slow">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-surface border border-surface-dim flex items-center justify-center shadow-2xl">
                        <Smartphone className="w-6 h-6 text-tertiary" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Payments</span>
                </div>
            </div>

            <div className="absolute bottom-1/3 left-1/4 delay-300 animate-bounce-slow">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface border border-surface-dim flex items-center justify-center shadow-md">
                        <Globe className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">OTA Sync</span>
                </div>
            </div>

          </FadeIn>

        </div>
      </div>
    </div>
  );
};

// Internal icon proxy for easy migration if needed
const FileTextIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

export default Hero;
