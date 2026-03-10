import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { departmentsApi } from '@/lib/api';
import { useGsapFadeIn } from '@/hooks/use-gsap';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Save, Building2 } from 'lucide-react';

export default function DepartmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const formRef = useGsapFadeIn(0);

  const isEdit = Boolean(id);
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  useEffect(() => {
    if (isEdit && id) {
      departmentsApi
        .get(Number(id))
        .then((dept) => setDepartmentName(dept.departmentName))
        .catch(() => toast({ title: 'Error', description: 'Failed to load department', variant: 'destructive' }))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentName.trim()) {
      toast({ title: 'Validation', description: 'Department name is required', variant: 'destructive' });
      return;
    }
    try {
      setLoading(true);
      if (isEdit && id) {
        await departmentsApi.update(Number(id), { departmentName: departmentName.trim() });
        toast({ title: 'Updated', description: 'Department updated successfully' });
      } else {
        await departmentsApi.create({ departmentName: departmentName.trim() });
        toast({ title: 'Created', description: 'Department created successfully' });
      }
      navigate('/departments');
    } catch {
      toast({ title: 'Error', description: `Failed to ${isEdit ? 'update' : 'create'} department`, variant: 'destructive' });
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/departments')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
            <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? 'Edit Department' : 'New Department'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? 'Update department details' : 'Create a new department'}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Department' : 'Department Details'}</CardTitle>
            <CardDescription>Provide the department name below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="departmentName">Department Name</Label>
              <Input
                id="departmentName"
                placeholder="Enter department name"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/departments')}>
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
