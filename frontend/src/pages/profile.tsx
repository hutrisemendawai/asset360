import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { profileApi, locationsApi } from '@/lib/api';
import type { Location } from '@/lib/api';
import { useGsapFadeIn, useGsapStagger } from '@/hooks/use-gsap';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Save, Loader2, UserCircle, Mail, Phone, MapPin } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const headerRef = useGsapFadeIn(0);
  const formContainerRef = useGsapStagger('[data-animate]', 0.15);

  const [form, setForm] = useState({
    fullName: '',
    birthPlace: '',
    birthDate: '',
    gender: '',
    identityNumber: '',
    phoneNumber: '',
    address: '',
    locationId: '',
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    locationsApi.list().then(setLocations).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    profileApi.get().then((profile) => {
      const loc = locations.find(
        (l) => l.locationName === profile.region || l.region === profile.region,
      );
      setForm({
        fullName: profile.fullName || '',
        birthPlace: profile.birthPlace || '',
        birthDate: profile.birthDate || '',
        gender: profile.gender || '',
        identityNumber: profile.identityNumber || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
        locationId: loc ? String(loc.locationId) : '',
      });
    }).catch(() => {});
  }, [user, locations]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileApi.update({
        ...form,
        locationId: form.locationId ? Number(form.locationId) : undefined,
      });
      await refreshUser();
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header card */}
      <div ref={headerRef}>
        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex items-center gap-5 p-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{user?.fullName}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      <div ref={formContainerRef}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card data-animate className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email ?? ''}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthPlace">Birth Place</Label>
              <Input
                id="birthPlace"
                value={form.birthPlace}
                onChange={(e) => update('birthPlace', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={form.birthDate}
                onChange={(e) => update('birthDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => update('gender', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="identityNumber">Identity Number</Label>
              <Input
                id="identityNumber"
                value={form.identityNumber}
                onChange={(e) => update('identityNumber', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card data-animate className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-5 w-5 text-primary" />
              Contact Information
            </CardTitle>
            <CardDescription>Update your contact details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={form.phoneNumber}
                onChange={(e) => update('phoneNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location
              </Label>
              <Select
                value={form.locationId}
                onValueChange={(v) => update('locationId', v)}
              >
                <SelectTrigger>
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div data-animate>
          <Separator className="mb-6" />
          <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}
