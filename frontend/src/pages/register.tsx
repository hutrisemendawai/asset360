import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { locationsApi } from '@/lib/api';
import type { Location } from '@/lib/api';
import { useGsapStagger } from '@/hooks/use-gsap';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserPlus,
  Loader2,
  User,
  Phone,
  MapPin,
} from 'lucide-react';

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useGsapStagger('[data-animate]', 0.1);

  const [form, setForm] = useState({
    fullName: '',
    birthPlace: '',
    birthDate: '',
    gender: '',
    identityNumber: '',
    email: '',
    phoneNumber: '',
    address: '',
    locationId: '',
    password: '',
    confirmPassword: '',
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    locationsApi.list().then(setLocations).catch(() => {});
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword: _, ...data } = form;
      await register({ ...data, locationId: Number(data.locationId) });
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 px-4 py-10">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute top-20 left-10 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 right-10 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />

      <div ref={containerRef} className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div data-animate className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <span className="text-2xl font-bold text-primary-foreground">
              A3
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-sm text-purple-200/70 mt-1">
            Join Asset360 to manage your assets
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              data-animate
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {/* Personal Data */}
          <Card
            data-animate
            className="border-white/10 bg-white/5 backdrop-blur-xl shadow-xl"
          >
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <User className="h-5 w-5 text-primary" />
                Personal Data
              </CardTitle>
              <CardDescription className="text-purple-200/50">
                Your basic personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName" className="text-purple-100">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  required
                  className="border-white/10 bg-white/5 text-white placeholder:text-purple-300/40"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthPlace" className="text-purple-100">
                  Birth Place
                </Label>
                <Input
                  id="birthPlace"
                  value={form.birthPlace}
                  onChange={(e) => update('birthPlace', e.target.value)}
                  required
                  className="border-white/10 bg-white/5 text-white placeholder:text-purple-300/40"
                  placeholder="Jakarta"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-purple-100">
                  Birth Date
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => update('birthDate', e.target.value)}
                  required
                  className="border-white/10 bg-white/5 text-white placeholder:text-purple-300/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-purple-100">
                  Gender
                </Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => update('gender', v)}
                >
                  <SelectTrigger className="border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="identityNumber" className="text-purple-100">
                  Identity Number
                </Label>
                <Input
                  id="identityNumber"
                  value={form.identityNumber}
                  onChange={(e) => update('identityNumber', e.target.value)}
                  required
                  className="border-white/10 bg-white/5 text-white placeholder:text-purple-300/40"
                  placeholder="3174..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Data */}
          <Card
            data-animate
            className="border-white/10 bg-white/5 backdrop-blur-xl shadow-xl"
          >
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Phone className="h-5 w-5 text-primary" />
                Contact Data
              </CardTitle>
              <CardDescription className="text-purple-200/50">
                How we can reach you
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-100">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                  className="border-white/10 bg-white/5 text-white placeholder:text-purple-300/40"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-purple-100">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  value={form.phoneNumber}
                  onChange={(e) => update('phoneNumber', e.target.value)}
                  required
                  className="border-white/10 bg-white/5 text-white placeholder:text-purple-300/40"
                  placeholder="08xx..."
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address" className="text-purple-100">
                  Address
                </Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  required
                  className="border-white/10 bg-white/5 text-white placeholder:text-purple-300/40"
                  placeholder="Jl. Example No. 123"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="location" className="text-purple-100">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Location
                </Label>
                <Select
                  value={form.locationId}
                  onValueChange={(v) => update('locationId', v)}
                >
                  <SelectTrigger className="border-white/10 bg-white/5 text-white">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem
                        key={loc.locationId}
                        value={String(loc.locationId)}
                      >
                        {loc.locationName} — {loc.region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account Data */}
          <Card
            data-animate
            className="border-white/10 bg-white/5 backdrop-blur-xl shadow-xl"
          >
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <UserPlus className="h-5 w-5 text-primary" />
                Account Data
              </CardTitle>
              <CardDescription className="text-purple-200/50">
                Set your login credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-purple-100">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  required
                  className="border-white/10 bg-white/5 text-white placeholder:text-purple-300/40"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-purple-100">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  required
                  className="border-white/10 bg-white/5 text-white placeholder:text-purple-300/40"
                  placeholder="••••••••"
                />
              </div>
            </CardContent>
          </Card>

          <div data-animate className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-lg shadow-primary/25"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Create Account
            </Button>
            <p className="text-center text-sm text-purple-200/60">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-purple-300 hover:text-white transition-colors underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
