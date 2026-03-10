import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { categoriesApi } from '@/lib/api';
import type { AssetCategory } from '@/lib/api';
import { useGsapFadeIn, useGsapStagger } from '@/hooks/use-gsap';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Search, Tag } from 'lucide-react';

export default function CategoryListPage() {
  const { toast } = useToast();
  const headerRef = useGsapFadeIn(0);
  const tableRef = useGsapStagger('tr[data-row]', 0.15);

  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AssetCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Inline edit dialog
  const [editTarget, setEditTarget] = useState<AssetCategory | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.list();
      setCategories(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load categories', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await categoriesApi.delete(deleteTarget.categoryId);
      toast({ title: 'Deleted', description: `Category "${deleteTarget.categoryName}" deleted` });
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (cat: AssetCategory) => {
    setEditTarget(cat);
    setEditName(cat.categoryName);
  };

  const handleEditSave = async () => {
    if (!editTarget || !editName.trim()) return;
    try {
      setSaving(true);
      await categoriesApi.update(editTarget.categoryId, { categoryName: editName.trim() });
      toast({ title: 'Updated', description: 'Category updated successfully' });
      setEditTarget(null);
      fetchData();
    } catch {
      toast({ title: 'Error', description: 'Failed to update category', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = categories.filter((c) =>
    c.categoryName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
            <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            <p className="text-sm text-muted-foreground">Manage asset categories</p>
          </div>
        </div>
        <Button asChild>
          <Link to="/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div ref={tableRef} className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                  {search ? 'No categories match your search' : 'No categories found'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((cat) => (
                <TableRow key={cat.categoryId} data-row>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {cat.categoryId}
                  </TableCell>
                  <TableCell className="font-medium">{cat.categoryName}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(cat)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.categoryName}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category name</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="editCatName">Category Name</Label>
              <Input
                id="editCatName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Category name"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditSave} disabled={saving || !editName.trim()}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
