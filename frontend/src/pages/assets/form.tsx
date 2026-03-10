import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assetsApi, locationsApi, categoriesApi, departmentsApi } from '@/lib/api';
import type { Location, AssetCategory, Department } from '@/lib/api';
import { useGsapFadeIn } from '@/hooks/use-gsap';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ArrowLeft, Save, Package } from 'lucide-react';

interface FormData {
  assetName: string;
  assetValue: string;
  purchaseDate: string;
  locationId: string;
  categoryId: string;
  departmentId: string;
}

export default function AssetFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const formRef = useGsapFadeIn(0);

  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormData>({
    assetName: '',
    assetValue: '',
    purchaseDate: '',
    locationId: '',
    categoryId: '',
    departmentId: '',
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [locs, cats, depts] = await Promise.all([
          locationsApi.list(),
          categoriesApi.list(),
          departmentsApi.list(),
        ]);
        setLocations(locs);
        setCategories(cats);
        setDepartments(depts);

        if (isEdit && id) {
          const asset = await assetsApi.get(Number(id));
          setForm({
            assetName: asset.assetName,
            assetValue: String(asset.assetValue),
            purchaseDate: asset.purchaseDate,
            locationId: String(asset.location.locationId),
            categoryId: String(asset.category.categoryId),
            departmentId: String(asset.department.departmentId),
          });
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to load form data', variant: 'destructive' });
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, isEdit, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assetName || !form.assetValue || !form.purchaseDate || !form.locationId || !form.categoryId || !form.departmentId) {
      toast({ title: 'Validation', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    const payload = {
      assetName: form.assetName,
      assetValue: Number(form.assetValue),
      purchaseDate: form.purchaseDate,
      locationId: Number(form.locationId),
      categoryId: Number(form.categoryId),
      departmentId: Number(form.departmentId),
    };

    try {
      setLoading(true);
      if (isEdit && id) {
        await assetsApi.update(Number(id), payload);
        toast({ title: 'Updated', description: 'Asset updated successfully' });
      } else {
        await assetsApi.create(payload);
        toast({ title: 'Created', description: 'Asset created successfully' });
      }
      navigate('/assets');
    } catch {
      toast({ title: 'Error', description: `Failed to ${isEdit ? 'update' : 'create'} asset`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" ref={formRef}>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/assets')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
            <Package className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? 'Edit Asset' : 'New Asset'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? 'Update asset information' : 'Add a new asset to your inventory'}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Asset' : 'Asset Details'}</CardTitle>
            <CardDescription>Fill in the details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assetName">Asset Name</Label>
              <Input
                id="assetName"
                placeholder="Enter asset name"
                value={form.assetName}
                onChange={(e) => setForm((f) => ({ ...f, assetName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetValue">Value (IDR)</Label>
              <Input
                id="assetValue"
                type="number"
                min="0"
                placeholder="Enter value"
                value={form.assetValue}
                onChange={(e) => setForm((f) => ({ ...f, assetValue: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm((f) => ({ ...f, purchaseDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Select
                value={form.locationId}
                onValueChange={(v) => setForm((f) => ({ ...f, locationId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
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
              <Label>Category</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.categoryId} value={String(cat.categoryId)}>
                      {cat.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={form.departmentId}
                onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
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
            <Button type="button" variant="outline" onClick={() => navigate('/assets')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : isEdit ? 'Update Asset' : 'Create Asset'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
