"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  User,
  Dumbbell,
} from "lucide-react";
import { login } from '@/app/actions/auth';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ModernLoginForm() {
  const router = useRouter();
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Animated background
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    type P = { x: number; y: number; v: number; o: number };
    let ps: P[] = [];
    let raf = 0;

    const make = (): P => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: Math.random() * 0.25 + 0.05,
      o: Math.random() * 0.35 + 0.15,
    });

    const init = () => {
      ps = [];
      const count = Math.floor((canvas.width * canvas.height) / 9000);
      for (let i = 0; i < count; i++) ps.push(make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + Math.random() * 40;
          p.v = Math.random() * 0.25 + 0.05;
          p.o = Math.random() * 0.35 + 0.15;
        }
        ctx.fillStyle = `rgba(250,250,250,${p.o})`;
        ctx.fillRect(p.x, p.y, 0.7, 2.2);
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      init();
    };

    window.addEventListener("resize", onResize);
    init();
    raf = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", loginEmail);
      formData.append("password", loginPassword);

      const result = await login(formData);

      if (result?.error) {
        throw new Error(result.error);
      }

      // Server action will redirect automatically
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      setError("Please accept the terms and privacy policy");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signupError } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupName,
          },
        },
      });

      if (signupError) throw signupError;

      alert("Success! Check your email to confirm your account.");
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <section className="fixed inset-0 bg-zinc-950 text-zinc-50">
      <style>{`
        .card-animate { opacity: 0; transform: translateY(12px); animation: fadeUp .6s ease .25s forwards; }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

        .accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.7}
        .hline,.vline{position:absolute;background:#27272a}
        .hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:drawX .6s ease forwards}
        .vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:drawY .7s ease forwards}
        .hline:nth-child(1){top:18%;animation-delay:.08s}
        .hline:nth-child(2){top:50%;animation-delay:.16s}
        .hline:nth-child(3){top:82%;animation-delay:.24s}
        .vline:nth-child(4){left:22%;animation-delay:.20s}
        .vline:nth-child(5){left:50%;animation-delay:.28s}
        .vline:nth-child(6){left:78%;animation-delay:.36s}
        @keyframes drawX{to{transform:scaleX(1)}}
        @keyframes drawY{to{transform:scaleY(1)}}

        .tab-shell{ position:relative; min-height: 420px; }

        .tab-panel{
          transition: opacity .22s ease, filter .22s ease;
        }
        .tab-panel[data-state="inactive"]{
          position:absolute; inset:0;
          opacity:0; filter: blur(8px);
          pointer-events:none;
        }
        .tab-panel[data-state="active"]{
          position:relative;
          opacity:1; filter: blur(0px);
        }

        .auth-tabs [role="tablist"] {
          background: #0f0f10; border: 1px solid #27272a; border-radius: 10px; padding: 4px;
        }
        .auth-tabs [role="tab"] {
          font-size: 13px; letter-spacing: .02em;
        }
        .auth-tabs [role="tab"][data-state="active"] {
          background: #111113; border-radius: 8px; box-shadow: inset 0 0 0 1px #27272a;
        }
      `}</style>

      {/* particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50 mix-blend-screen pointer-events-none" />

      {/* accent lines */}
      <div className="accent-lines">
        <div className="hline" />
        <div className="hline" />
        <div className="hline" />
        <div className="vline" />
        <div className="vline" />
        <div className="vline" />
      </div>

      {/* header */}
      <header className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <img 
            src="/gymville-logo.png" 
            alt="Gymville" 
            className="h-8 w-auto"
          />
          <span className="text-sm font-semibold text-white">
            Gymville
          </span>
        </div>
        <Button
          variant="outline"
          className="h-9 rounded-lg border-zinc-800 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/80"
          onClick={() => router.push('/')}
        >
          <span className="mr-2">Home</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </header>

      {/* centered card with tabs */}
      <div className="h-full w-full grid place-items-center px-4">
        <Card className="card-animate w-full max-w-md border-zinc-800/50 bg-zinc-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-900/70 shadow-2xl">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold text-white">Welcome</CardTitle>
            <CardDescription className="text-zinc-400 text-base">Log in or create your account</CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500 text-red-400 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <Tabs defaultValue="login" className="auth-tabs w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <div className="tab-shell mt-6">
                {/* LOGIN */}
                <TabsContent value="login" forceMount className="tab-panel">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="grid gap-2.5">
                      <Label htmlFor="login-email" className="text-zinc-200 font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          className="pl-11 h-11 bg-zinc-950/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2.5">
                      <Label htmlFor="login-password" className="text-zinc-200 font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                          id="login-password"
                          type={showLoginPw ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          minLength={6}
                          className="pl-11 pr-11 h-11 bg-zinc-950/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors"
                          onClick={() => setShowLoginPw((v) => !v)}
                          aria-label={showLoginPw ? "Hide password" : "Show password"}
                        >
                          {showLoginPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2.5">
                        <Checkbox 
                          id="remember" 
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                          className="border-zinc-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" 
                        />
                        <Label htmlFor="remember" className="text-zinc-300 text-sm cursor-pointer">Remember me</Label>
                      </div>
                      <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                    </div>

                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Signing in...' : 'Continue'}
                    </Button>
                  </form>
                </TabsContent>

                {/* SIGN UP */}
                <TabsContent value="signup" forceMount className="tab-panel">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid gap-2.5">
                      <Label htmlFor="name" className="text-zinc-200 font-medium">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="pl-11 h-11 bg-zinc-950/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2.5">
                      <Label htmlFor="signup-email" className="text-zinc-200 font-medium">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                          className="pl-11 h-11 bg-zinc-950/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2.5">
                      <Label htmlFor="signup-password" className="text-zinc-200 font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                          id="signup-password"
                          type={showSignupPw ? "text" : "password"}
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          minLength={6}
                          className="pl-11 pr-11 h-11 bg-zinc-950/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors"
                          onClick={() => setShowSignupPw((v) => !v)}
                          aria-label={showSignupPw ? "Hide password" : "Show password"}
                        >
                          {showSignupPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      <Checkbox 
                        id="terms" 
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                        className="border-zinc-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" 
                      />
                      <Label htmlFor="terms" className="text-zinc-300 text-sm cursor-pointer">I agree to the Terms & Privacy</Label>
                    </div>

                    <Button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Creating account...' : 'Create account'}
                    </Button>
                  </form>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}


