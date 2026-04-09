'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FadeIn } from "@/components/landing/FadeIn";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GithubIcon = ({ className }: { className?: string }) => (
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
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function SignInPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) triggerShake();
    return Object.keys(errors).length === 0;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setIsLoading(false);
    
    if (error) {
      const msg = error.message.toLowerCase();
      triggerShake();
      if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
        setFieldErrors({ form: 'Incorrect email or password. Please try again.' });
      } else if (msg.includes('email not confirmed')) {
        setFieldErrors({ form: 'Your email hasn\'t been confirmed yet. Check your inbox.' });
      } else if (msg.includes('too many requests') || msg.includes('rate limit')) {
        setFieldErrors({ form: 'Too many attempts. Please wait a moment and try again.' });
      } else if (msg.includes('email')) {
        setFieldErrors({ email: error.message });
      } else if (msg.includes('password')) {
        setFieldErrors({ password: error.message });
      } else {
        setFieldErrors({ form: error.message });
      }
    } else {
      router.refresh();
      router.push('/dashboard');
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  return (
    <>
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background selection:bg-primary/20">
      
      {/* Editorial Narrative Side */}
      <section className="hidden lg:flex flex-col justify-between p-16 bg-surface-container-low border-r border-surface-dim relative overflow-hidden">
        
        {/* Logo / Branding */}
        <Link href="/" className="text-primary font-bold text-2xl z-10 hover:text-primary transition-colors">
            Nyumbani-Ops
        </Link>

        {/* Massive Typography */}
        <div className="relative z-10 w-full">
            <FadeIn direction="right">
                <h1 className="text-8xl lg:text-[10rem] font-black text-foreground leading-[0.85] tracking-tighter mb-12">
                    Welcome <br/>
                    <span className="text-primary italic font-serif">Home.</span>
                </h1>
                <p className="text-2xl text-on-surface-variant max-w-md leading-relaxed font-light italic">
                    Welcome back. Pick up right where you left off and stay on top of your properties.
                </p>
            </FadeIn>
        </div>

        {/* Footer info or link */}
        <div className="z-10 text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
            NYUMBANI_OPS • SECURE LOGIN
        </div>

        {/* Decorative Watermark */}
        <div className="absolute bottom-0 right-0 text-[20vw] font-black text-primary/5 select-none pointer-events-none whitespace-nowrap leading-none tracking-tighter italic font-serif translate-y-1/4 translate-x-1/4">
            WELCOME
        </div>
      </section>

      {/* Auth Interaction Side */}
      <section className="flex items-center justify-center p-8 bg-background overflow-y-auto">
        <FadeIn delay={200} className="w-full flex-col flex items-center max-w-[400px]">
            <div className="text-center mb-8 w-full">
                <h2 className="text-3xl font-bold text-foreground mb-3">Sign In</h2>
                <p className="text-on-surface-variant">Sign in to your account below.</p>
            </div>

            <div className="w-full flex flex-col gap-6">
                <form onSubmit={handleEmailSignIn} className={`flex flex-col gap-4 ${shake ? 'animate-shake' : ''}`}>
                    <div className="space-y-2 text-left">
                        <Label htmlFor="email" className="text-foreground">Email</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="name@example.com" 
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.email; delete n.form; return n; }); }}
                            required
                            autoComplete="email"
                            className={`h-14 rounded-xl bg-transparent ${fieldErrors.email ? 'border-red-400 focus-visible:ring-red-400' : 'border-surface-dim'}`}
                        />
                        {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                    </div>
                    <div className="space-y-2 text-left">
                        <Label htmlFor="password" className="text-foreground">Password</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.password; delete n.form; return n; }); }}
                            required
                            autoComplete="current-password"
                            className={`h-14 rounded-xl bg-transparent ${fieldErrors.password ? 'border-red-400 focus-visible:ring-red-400' : 'border-surface-dim'}`}
                        />
                        {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
                    </div>
                    
                    {fieldErrors.form && (
                        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium">
                            {fieldErrors.form}
                        </div>
                    )}
                    
                    <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="h-14 w-full rounded-xl font-bold mt-2"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-surface-dim" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-4 text-on-surface-variant font-bold tracking-wider">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <Button 
                        variant="outline" 
                        size="lg" 
                        className="h-16 rounded-xl border-surface-dim hover:bg-surface-container-low text-on-surface transition-all duration-300 font-bold flex gap-4"
                        onClick={() => handleOAuthSignIn('google')}
                        type="button"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </Button>

                    <Button 
                        variant="outline" 
                        size="lg" 
                        className="h-16 rounded-xl border-surface-dim hover:bg-surface-container-low text-on-surface transition-all duration-300 font-bold flex gap-4"
                        onClick={() => handleOAuthSignIn('github')}
                        type="button"
                    >
                        <GithubIcon className="w-5 h-5" />
                        Continue with GitHub
                    </Button>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
                <p className="text-on-surface-variant text-sm">
                    Don&#39;t have an account? 
                    <Link href="/sign-up" className="text-primary font-bold ml-2 hover:text-primary transition-colors">
                        Sign Up
                    </Link>
                </p>
            </div>
        </FadeIn>
      </section>

    </main>
    </>
  );
}
