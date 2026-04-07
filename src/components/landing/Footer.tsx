import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-surface-dim pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-primary font-bold text-2xl mb-4 inline-block">
              Nyumbani-Ops
            </Link>
            <p className="text-on-surface-variant max-w-sm">
              The Digital Concierge for modern service businesses. Elegant automation for seamless operations.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Product</h4>
            <ul className="space-y-3 text-on-surface-variant">
              <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/integrations" className="hover:text-primary transition-colors">Integrations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Company</h4>
            <ul className="space-y-3 text-on-surface-variant">
              <li><Link href="/" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-dim pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-on-surface-variant">
          <p>© {new Date().getFullYear()} Nyumbani-Ops. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
