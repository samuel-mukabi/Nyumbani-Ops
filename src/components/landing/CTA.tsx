'use client';

import React from 'react';
import Link from 'next/link';
import { FadeIn } from './FadeIn';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-32 lg:py-48 bg-surface-container relative overflow-hidden">
      {/* Visual Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          
          {/* Headline Area - Typography as Architecture */}
          <div className="max-w-2xl">
            <FadeIn direction="right">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-surface-dim mb-10">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-on-surface-variant uppercase tracking-widest text-[10px]">Get Started Today</span>
              </div>
              <h2 className="text-5xl lg:text-8xl font-black text-foreground leading-[0.9] tracking-tighter mb-8">
                Ready to <br/>
                <span className="text-primary italic font-serif">save time?</span>
              </h2>
            </FadeIn>
          </div>

          {/* Action Area */}
          <div className="space-y-12">
            <FadeIn delay={200} direction="up">
              <p className="text-2xl lg:text-3xl text-on-surface-variant font-light leading-relaxed italic">
                Join the smart property managers who use Nyumbani-Ops to run their business smoothly.
              </p>
            </FadeIn>

            <FadeIn delay={400} direction="up">
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/dashboard">
                  <Button size="lg" className="h-16 px-10 rounded-xl text-lg font-bold group shadow-2xl shadow-primary/20 cursor-pointer">
                    Create Free Account
                    <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
                <a href="mailto:hello@nyumbani-ops.com" className="h-16 px-10 text-lg font-bold text-on-surface hover:text-primary transition-colors flex items-center justify-center">
                  Contact the Team
                </a>
              </div>
              
              <div className="mt-12 flex items-center gap-8 text-on-surface-variant/60">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest">No Commitment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest">14-Day Free Trial</span>
                </div>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>

      {/* Background Typography - Subtle large watermark */}
      <div className="absolute -bottom-10 right-10 text-[20rem] font-black text-primary/5 select-none pointer-events-none leading-none tracking-tighter font-serif">
        Start
      </div>
    </section>
  );
};

export default CTA;
