import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoriesApi } from '@/lib/api';
import { useGsapFadeIn } from '@/hooks/use-gsap';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Save, Tag } from 'lucide-react';

export default function CategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const formRef = useGsapFadeIn(0);

  const isEdit = Boolean(id);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  useEffect(() => {
    if (isEdit && id) {
      categoriesApi
        .get(Number(id))
        .then((cat) => setCategoryName(cat.categoryName))
        .catch(() => toast({ title: 'Error', description: 'Failed to load category', variant: 'destructive' }))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast({ title: 'Validation', description: 'Category name is required', variant: 'destructive' });
      return;
    }
    try {
      setLoading(true);
      if (isEdit && id) {
        await categoriesApi.update(Number(id), { categoryName: categoryName.trim() });
        toast({ title: 'Updated', description: 'Category updated successfully' });
      } else {
        await categoriesApi.create({ categoryName: categoryName.trim() });
        toast({ title: 'Created', description: 'Category created successfully' });
      }
      navigate('/categories');
    } catch {
      toast({ title: 'Error', description: `Failed to ${isEdit ? 'update' : 'create'} category`, variant: 'destructive' });
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/categories')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
            <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEdit ? 'Edit Category' : 'New Category'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? 'Update category details' : 'Create a new asset category'}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Category' : 'Category Details'}</CardTitle>
            <CardDescription>Provide the category name below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="Enter category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/categories')}>
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
