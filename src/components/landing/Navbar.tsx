'use client'

import React, {useState} from 'react'
import Link from "next/link";
import { usePathname } from "next/navigation";
import {Button} from "@/components/ui/button";
import {FadeIn} from "@/components/landing/FadeIn";

const Navbar = () => {
    const pathname = usePathname();
    const [clickedLink, setClickedLink] = useState<number | null>(null);

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
                        <Button variant='default' size='lg' className="hidden sm:inline-flex">Get Started</Button>
                    </div>
                </nav>
            </FadeIn>
        </header>
    )
}

export default Navbar
