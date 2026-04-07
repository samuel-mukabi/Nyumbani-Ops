'use client';

import React from 'react';
import { FadeIn } from './FadeIn';
import { Layers, CalendarCheck, Shield, Bot, ArrowRight } from 'lucide-react';

const Features = () => {
  const features = [
    {
      title: 'Intelligent Scheduling',
      subtitle: 'Easy Scheduling',
      description: 'Manage routes, resources, and availability effortlessly. Our calendar predicts and prevents double bookings.',
      icon: <CalendarCheck className="w-5 h-5" />,
      tag: 'Automation'
    },
    {
      title: 'Unified Dashboard',
      subtitle: 'Everything in One Place',
      description: 'Monitor all your properties from a single, simple interface. Clear analytics help you make data-driven decisions to grow your business.',
      icon: <Layers className="w-5 h-5" />,
      tag: 'Analytics'
    },
    {
      title: 'Automated Workflows',
      subtitle: 'Save Time',
      description: 'Let us handle the repetitive tasks. From guest communication to tax filing, our tools work silently in the background.',
      icon: <Bot className="w-5 h-5" />,
      tag: 'Efficiency'
    },
    {
      title: 'Enterprise Security',
      subtitle: 'Peace of Mind',
      description: 'Bank-grade encryption ensures your property data remains secure. Comprehensive logs provide a clear trail for every action your team takes.',
      icon: <Shield className="w-5 h-5" />,
      tag: 'Security'
    }
  ];

  return (
    <div className="bg-background py-24 lg:py-48 relative overflow-hidden">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-surface-container-low to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-32 gap-8 px-4">
          <FadeIn className="max-w-2xl">
            <span className="text-secondary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">How We Help</span>
            <h2 className="text-5xl lg:text-[6rem] font-bold text-foreground leading-none tracking-tighter">
              Managing properties, <br/>
              <span className="text-primary italic font-serif">made effortless.</span>
            </h2>
          </FadeIn>
          <FadeIn delay={200} className="lg:max-w-xs">
            <p className="text-lg text-on-surface-variant leading-relaxed font-light italic">
              Replace spreadsheets and scattered apps with a single, easy-to-use platform.
            </p>
          </FadeIn>
        </div>

        {/* Zero-Card Layout: Asymmetric List with Rule Dividers */}
        <div className="space-y-0">
          {features.map((feature, index) => (
            <FadeIn key={index} delay={index * 100} direction="up">
              <div className="group py-16 lg:py-24 px-10 border-t border-surface-dim first:border-t-0 flex flex-col lg:flex-row gap-12 lg:items-center relative">
                
                {/* Index / Tag */}
                <div className="lg:w-1/4">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl font-serif italic text-primary/30 group-hover:text-primary transition-colors duration-500">0{index + 1}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-surface-variant group-hover:text-on-primary group-hover:bg-primary transition-colors duration-500 px-3 py-1 bg-surface-container-low rounded-full">
                      {feature.tag}
                    </span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 max-w-2xl">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">{feature.subtitle}</h4>
                  <h3 className="text-3xl lg:text-5xl font-bold text-foreground tracking-tight mb-6 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-xl text-on-surface-variant leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>

                {/* Icon & CTA */}
                <div className="lg:w-1/4 flex flex-col items-start lg:items-end justify-center gap-8">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-500 shadow-sm">
                    {feature.icon}
                  </div>
                  <button className="flex items-center gap-2 text-sm font-bold text-primary opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    Explore <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>

                {/* Subtle Hover Reveal - Narrative text snippet */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />
              </div>
            </FadeIn>
          ))}
          {/* Bottom Rule */}
          <div className="border-t border-surface-dim" />
        </div>
      </div>

      {/* Background Watermark */}
      <div className="absolute top-1/2 left-0 -translate-x-1/2 -rotate-90 text-[10vw] font-black text-primary/5 select-none pointer-events-none whitespace-nowrap">
        NYUMBANI_OPS_SYSTEM_01
      </div>
    </div>
  );
};

export default Features;
