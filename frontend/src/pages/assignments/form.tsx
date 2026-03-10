import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assignmentsApi, assetsApi, departmentsApi } from '@/lib/api';
import type { Asset, Department } from '@/lib/api';
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
import { ArrowLeft, Save, ClipboardList } from 'lucide-react';

interface FormData {
  assetId: string;
  departmentId: string;
  assignedDate: string;
  returnDate: string;
}

export default function AssignmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const formRef = useGsapFadeIn(0);

  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormData>({
    assetId: '',
    departmentId: '',
    assignedDate: '',
    returnDate: '',
  });
  const [assets, setAssets] = useState<Asset[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [assetList, deptList] = await Promise.all([
          assetsApi.list(),
          departmentsApi.list(),
        ]);
        setAssets(assetList);
        setDepartments(deptList);

        if (isEdit && id) {
          const assignment = await assignmentsApi.get(Number(id));
          setForm({
            assetId: String(assignment.asset.assetId),
            departmentId: String(assignment.assignedDepartment.departmentId),
            assignedDate: assignment.assignedDate,
            returnDate: assignment.returnDate ?? '',
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
    if (!form.assetId || !form.departmentId || !form.assignedDate) {
      toast({ title: 'Validation', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const payload = {
      assetId: Number(form.assetId),
      departmentId: Number(form.departmentId),
      assignedDate: form.assignedDate,
      returnDate: form.returnDate || undefined,
    };

    try {
      setLoading(true);
      if (isEdit && id) {
        await assignmentsApi.update(Number(id), payload);
        toast({ title: 'Updated', description: 'Assignment updated successfully' });
      } else {
        await assignmentsApi.create(payload);
        toast({ title: 'Created', description: 'Assignment created successfully' });
      }
      navigate('/assignments');
    } catch {
      toast({ title: 'Error', description: `Failed to ${isEdit ? 'update' : 'create'} assignment`, variant: 'destructive' });
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/assignments')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-500/20">
            <ClipboardList className="h-5 w-5 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? 'Edit Assignment' : 'New Assignment'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? 'Update assignment details' : 'Assign an asset to a department'}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Assignment' : 'Assignment Details'}</CardTitle>
            <CardDescription>Fill in the assignment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Asset</Label>
              <Select
                value={form.assetId}
                onValueChange={(v) => setForm((f) => ({ ...f, assetId: v }))}
              >
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
            <div className="space-y-2">
              <Label htmlFor="assignedDate">Assigned Date</Label>
              <Input
                id="assignedDate"
                type="date"
                value={form.assignedDate}
                onChange={(e) => setForm((f) => ({ ...f, assignedDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="returnDate">Return Date (optional)</Label>
              <Input
                id="returnDate"
                type="date"
                value={form.returnDate}
                onChange={(e) => setForm((f) => ({ ...f, returnDate: e.target.value }))}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/assignments')}>
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
