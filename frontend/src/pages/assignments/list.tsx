import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { assignmentsApi } from '@/lib/api';
import type { AssetAssignment } from '@/lib/api';
import { formatDateShort } from '@/lib/format';
import { useGsapFadeIn, useGsapStagger } from '@/hooks/use-gsap';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Pencil, Trash2, Search, ClipboardList } from 'lucide-react';

export default function AssignmentListPage() {
  const { toast } = useToast();
  const headerRef = useGsapFadeIn(0);
  const tableRef = useGsapStagger('tr[data-row]', 0.15);

  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AssetAssignment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await assignmentsApi.list();
      setAssignments(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load assignments', variant: 'destructive' });
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
      await assignmentsApi.delete(deleteTarget.assignmentId);
      toast({ title: 'Deleted', description: 'Assignment deleted successfully' });
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete assignment', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const filtered = assignments.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.asset?.assetName?.toLowerCase().includes(q) ||
      a.assignedDepartment?.departmentName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-500/20">
            <ClipboardList className="h-5 w-5 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
            <p className="text-sm text-muted-foreground">Manage asset assignments to departments</p>
          </div>
        </div>
        <Button asChild>
          <Link to="/assignments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Assignment
          </Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search assignments..."
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
              <TableHead>Asset</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead>Return Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  {search ? 'No assignments match your search' : 'No assignments found'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.assignmentId} data-row>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.assignmentId}
                  </TableCell>
                  <TableCell className="font-medium">{item.asset?.assetName}</TableCell>
                  <TableCell>{item.assignedDepartment?.departmentName}</TableCell>
                  <TableCell>{formatDateShort(item.assignedDate)}</TableCell>
                  <TableCell>
                    {item.returnDate ? (
                      formatDateShort(item.returnDate)
                    ) : (
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/assignments/${item.assignmentId}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(item)}
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

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action cannot be undone.
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
    </div>
  );
}
