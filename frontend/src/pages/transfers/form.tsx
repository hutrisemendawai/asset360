import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { transfersApi, assetsApi, locationsApi, departmentsApi } from '@/lib/api';
import type { Asset, Location, Department } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useGsapFadeIn } from '@/hooks/use-gsap';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ArrowLeft, Send, ArrowLeftRight } from 'lucide-react';

export default function TransferFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const formRef = useGsapFadeIn(0);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assetId, setAssetId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [toDepartmentId, setToDepartmentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [assetList, locList, deptList] = await Promise.all([
          assetsApi.list(),
          locationsApi.list(),
          departmentsApi.list(),
        ]);
        // Filter assets to the user's region
        const regionAssets = user?.region
          ? assetList.filter((a) => a.location?.region === user.region)
          : assetList;
        setAssets(regionAssets);
        setLocations(locList);
        setDepartments(deptList);
      } catch {
        toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !toLocationId || !toDepartmentId) {
      toast({ title: 'Validation', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    try {
      setLoading(true);
      await transfersApi.create({
        assetId: Number(assetId),
        toLocationId: Number(toLocationId),
        toDepartmentId: Number(toDepartmentId),
      });
      toast({ title: 'Submitted', description: 'Transfer request submitted successfully' });
      navigate('/transfers');
    } catch {
      toast({ title: 'Error', description: 'Failed to submit transfer request', variant: 'destructive' });
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
    <div className="max-w-2xl mx-auto space-y-6" ref={formRef}>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/transfers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
            <ArrowLeftRight className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Transfer Request</h1>
            <p className="text-sm text-muted-foreground">Request an asset transfer to another location</p>
          </div>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
            <CardDescription>Select the asset and target destination</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Asset {user?.region && <span className="text-muted-foreground text-xs">({user.region} region)</span>}</Label>
              <Select value={assetId} onValueChange={setAssetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.assetId} value={String(asset.assetId)}>
                      {asset.fixedAssetCode} — {asset.assetName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Destination Location</Label>
              <Select value={toLocationId} onValueChange={setToLocationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.locationId} value={String(loc.locationId)}>
                      {loc.locationName} — {loc.region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Destination Department</Label>
              <Select value={toDepartmentId} onValueChange={setToDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.departmentId} value={String(dept.departmentId)}>
                      {dept.departmentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/transfers')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
