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

export default function SignUpPage() {
  const supabase = createClient();
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = (pw: string): { score: number; label: string; color: string } => {
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-400' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-400' };
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-400' };
    if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
    return { score: 5, label: 'Excellent', color: 'bg-emerald-500' };
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!firstName.trim()) {
      errors.firstName = 'First name is required.';
    } else if (firstName.trim().length < 2) {
      errors.firstName = 'Must be at least 2 characters.';
    }

    if (!lastName.trim()) {
      errors.lastName = 'Last name is required.';
    } else if (lastName.trim().length < 2) {
      errors.lastName = 'Must be at least 2 characters.';
    }

    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validate()) return;

    setIsLoading(true);
    const { error, data } = await supabase.auth.signUp({ 
      email: email.trim(), 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`,
        },
      }
    });
    setIsLoading(false);
    
    if (error) {
      // Map common Supabase errors to friendlier messages
      const msg = error.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setFieldErrors({ email: 'This email is already registered. Try signing in instead.' });
      } else if (msg.includes('password')) {
        setFieldErrors({ password: error.message });
      } else if (msg.includes('email')) {
        setFieldErrors({ email: error.message });
      } else {
        setFieldErrors({ form: error.message });
      }
    } else {
      if (data?.session) {
          router.refresh();
          router.push('/dashboard');
      } else {
          setMessage("Check your email for the confirmation link.");
      }
    }
  };

  const handleOAuthSignUp = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  const passwordStrength = getPasswordStrength(password);

  return (
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
                    Begin Your <br/>
                    <span className="text-primary italic font-serif">Journey.</span>
                </h1>
                <p className="text-2xl text-on-surface-variant max-w-md leading-relaxed font-light italic">
                    The future of property management is automation. Join the network of property owners who prioritize efficiency and ease.
                </p>
            </FadeIn>
        </div>

        {/* Footer info or link */}
        <div className="z-10 text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant">
            NYUMBANI_OPS • NEW ACCOUNT
        </div>

        {/* Decorative Watermark */}
        <div className="absolute bottom-0 right-0 text-[20vw] font-black text-primary/5 select-none pointer-events-none whitespace-nowrap leading-none tracking-tighter italic font-serif translate-y-1/4 translate-x-1/4">
            SIGN UP
        </div>
      </section>

      {/* Auth Interaction Side */}
      <section className="flex items-center justify-center p-8 bg-background overflow-y-auto">
        <FadeIn delay={200} className="w-full flex-col flex items-center max-w-[400px]">
            <div className="text-center mb-8 w-full">
                <h2 className="text-3xl font-bold text-foreground mb-3">Create Account</h2>
                <p className="text-on-surface-variant">Step into the world of effortless property management.</p>
            </div>

            <div className="w-full flex flex-col gap-6">
                <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4">
                    {/* Name row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2 text-left">
                            <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                            <Input 
                                id="firstName" 
                                type="text" 
                                placeholder="Jane"
                                value={firstName}
                                onChange={(e) => { setFirstName(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.firstName; return n; }); }}
                                required
                                autoComplete="given-name"
                                className={`h-14 rounded-xl bg-transparent ${fieldErrors.firstName ? 'border-red-400 focus-visible:ring-red-400' : 'border-surface-dim'}`}
                            />
                            {fieldErrors.firstName && <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>}
                        </div>
                        <div className="space-y-2 text-left">
                            <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                            <Input 
                                id="lastName" 
                                type="text" 
                                placeholder="Doe"
                                value={lastName}
                                onChange={(e) => { setLastName(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.lastName; return n; }); }}
                                required
                                autoComplete="family-name"
                                className={`h-14 rounded-xl bg-transparent ${fieldErrors.lastName ? 'border-red-400 focus-visible:ring-red-400' : 'border-surface-dim'}`}
                            />
                            {fieldErrors.lastName && <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName}</p>}
                        </div>
                    </div>

                    <div className="space-y-2 text-left">
                        <Label htmlFor="email" className="text-foreground">Email</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="name@example.com" 
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.email; return n; }); }}
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
                            onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => { const n = {...prev}; delete n.password; return n; }); }}
                            required
                            autoComplete="new-password"
                            className={`h-14 rounded-xl bg-transparent ${fieldErrors.password ? 'border-red-400 focus-visible:ring-red-400' : 'border-surface-dim'}`}
                        />
                        {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
                        {/* Password strength meter */}
                        {password && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 flex gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                                i <= passwordStrength.score ? passwordStrength.color : 'bg-surface-dim'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-on-surface-variant font-medium min-w-[60px] text-right">
                                    {passwordStrength.label}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    {fieldErrors.form && (
                        <p className="text-sm text-red-500 font-medium">{fieldErrors.form}</p>
                    )}

                    {message && (
                        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 font-medium">
                            {message}
                        </div>
                    )}
                    
                    <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="h-14 w-full rounded-xl font-bold mt-2"
                    >
                        {isLoading ? 'Creating account...' : 'Create Account'}
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
                        onClick={() => handleOAuthSignUp('google')}
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
                        onClick={() => handleOAuthSignUp('github')}
                        type="button"
                    >
                        <GithubIcon className="w-5 h-5" />
                        Continue with GitHub
                    </Button>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
                <p className="text-on-surface-variant text-sm">
                    Already have an account? 
                    <Link href="/sign-in" className="text-primary font-bold ml-2 hover:text-primary transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </FadeIn>
      </section>

    </main>
  );
}
