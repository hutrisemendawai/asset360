import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAuth } from '@/hooks/use-auth';
import { useGsapFadeIn } from '@/hooks/use-gsap';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const cardRef = useGsapFadeIn(0.2);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  // Floating orb animations
  useEffect(() => {
    const orbs = [orb1Ref.current, orb2Ref.current, orb3Ref.current];
    orbs.forEach((orb, i) => {
      if (!orb) return;
      gsap.to(orb, {
        y: `random(-30, 30)`,
        x: `random(-20, 20)`,
        duration: 3 + i,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.5,
      });
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 px-4">
      {/* Floating orbs */}
      <div
        ref={orb1Ref}
        className="pointer-events-none absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl"
      />
      <div
        ref={orb2Ref}
        className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl"
      />
      <div
        ref={orb3Ref}
        className="pointer-events-none absolute top-1/2 right-1/3 h-48 w-48 rounded-full bg-violet-400/10 blur-2xl"
      />

      <div ref={cardRef} className="w-full max-w-md relative z-10">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-2 space-y-4">
            {/* Logo */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
              <span className="text-2xl font-bold text-primary-foreground">
                A3
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome to Asset360
              </h1>
              <p className="text-sm text-purple-200/70 mt-1">
                Sign in to manage your assets
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-100">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300/50" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 border-white/10 bg-white/5 text-white placeholder:text-purple-300/40 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-purple-100">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300/50" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 border-white/10 bg-white/5 text-white placeholder:text-purple-300/40 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-semibold shadow-lg shadow-primary/25"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-purple-200/60">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-purple-300 hover:text-white transition-colors underline underline-offset-4"
              >
                Create account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
