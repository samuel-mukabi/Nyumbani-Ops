'use client';
import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import EditorialQuote from '@/components/landing/EditorialQuote';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

const Page = () => {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar/>
            <Hero/>
            <Features/>
            <EditorialQuote/>
            <CTA/>
            <Footer/>
        </main>
    );
};

export default Page;
