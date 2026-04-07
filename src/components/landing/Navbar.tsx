'use client'

import React, {useState, useEffect} from 'react'
import Link from "next/link";
import { usePathname } from "next/navigation";
import {Button} from "@/components/ui/button";
import {FadeIn} from "@/components/landing/FadeIn";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from 'lucide-react';

const Navbar = () => {
    const pathname = usePathname();
    const [clickedLink, setClickedLink] = useState<number | null>(null);
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        }
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const links = [
        {label: 'Features', href: '/features'},
        {label: 'How It Works', href: '/howitworks'},
        {label: 'Integrations', href: '/integrations'},
        {label: 'Pricing', href: '/pricing'},
    ]

    const handleLinkClick = (index: number) => {
        setClickedLink(index);
        setTimeout(() => setClickedLink(null), 500);
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/10">
            <FadeIn direction="down" delay={100}>
                <nav className="container mx-auto px-6 h-20 flex-between">
                    <Link href='/' className="text-primary font-bold text-2xl hover:text-primary/80 transition-colors">Nyumbani-Ops</Link>
                    <div className="hidden md:flex items-center space-x-10">
                        {links.map((link, index) => {
                            const isActive = pathname === link.href;
                            const isClicking = clickedLink === index;

                            return (
                                <Link
                                    key={index}
                                    href={link.href}
                                    onClick={() => handleLinkClick(index)}
                                    className={`transition-colors duration-300 hover:text-primary 
                                        ${isActive ? 'active-underline font-bold text-primary transition-all duration-300' : 'animated-underline'}
                                        ${isClicking ? 'click-underline' : ''}`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard">
                                    <Button variant='default' size='lg' className="hidden sm:inline-flex">Dashboard</Button>
                                </Link>
                                <form action="/auth/sign-out" method="post">
                                    <button type="submit" className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant hover:text-primary transition-colors">
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <Link href="/sign-in">
                                <Button variant='default' size='lg' className="hidden sm:inline-flex">Get Started</Button>
                            </Link>
                        )}
                    </div>
                </nav>
            </FadeIn>
        </header>
    )
}

export default Navbar
