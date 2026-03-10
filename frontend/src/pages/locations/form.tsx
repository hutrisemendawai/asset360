import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { locationsApi } from '@/lib/api';
import { useGsapFadeIn } from '@/hooks/use-gsap';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Save, MapPin } from 'lucide-react';

export default function LocationFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const formRef = useGsapFadeIn(0);

  const isEdit = Boolean(id);
  const [locationName, setLocationName] = useState('');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  useEffect(() => {
    if (isEdit && id) {
      locationsApi
        .get(Number(id))
        .then((loc) => {
          setLocationName(loc.locationName);
          setRegion(loc.region);
        })
        .catch(() => toast({ title: 'Error', description: 'Failed to load location', variant: 'destructive' }))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim() || !region.trim()) {
      toast({ title: 'Validation', description: 'All fields are required', variant: 'destructive' });
      return;
    }
    try {
      setLoading(true);
      const payload = { locationName: locationName.trim(), region: region.trim() };
      if (isEdit && id) {
        await locationsApi.update(Number(id), payload);
        toast({ title: 'Updated', description: 'Location updated successfully' });
      } else {
        await locationsApi.create(payload);
        toast({ title: 'Created', description: 'Location created successfully' });
      }
      navigate('/locations');
    } catch {
      toast({ title: 'Error', description: `Failed to ${isEdit ? 'update' : 'create'} location`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6" ref={formRef}>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/locations')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/20">
            <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? 'Edit Location' : 'New Location'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? 'Update location details' : 'Add a new office location'}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Location' : 'Location Details'}</CardTitle>
            <CardDescription>Fill in the details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="locationName">Location Name</Label>
              <Input
                id="locationName"
                placeholder="Enter location name"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                placeholder="Enter region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/locations')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
