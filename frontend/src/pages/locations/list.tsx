import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { locationsApi } from '@/lib/api';
import type { Location } from '@/lib/api';
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
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Search, MapPin } from 'lucide-react';

export default function LocationListPage() {
  const { toast } = useToast();
  const headerRef = useGsapFadeIn(0);
  const tableRef = useGsapStagger('tr[data-row]', 0.15);

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState<Location | null>(null);
  const [editName, setEditName] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await locationsApi.list();
      setLocations(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load locations', variant: 'destructive' });
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
      await locationsApi.delete(deleteTarget.locationId);
      toast({ title: 'Deleted', description: `Location "${deleteTarget.locationName}" deleted` });
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete location', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (loc: Location) => {
    setEditTarget(loc);
    setEditName(loc.locationName);
    setEditRegion(loc.region);
  };

  const handleEditSave = async () => {
    if (!editTarget || !editName.trim() || !editRegion.trim()) return;
    try {
      setSaving(true);
      await locationsApi.update(editTarget.locationId, {
        locationName: editName.trim(),
        region: editRegion.trim(),
      });
      toast({ title: 'Updated', description: 'Location updated successfully' });
      setEditTarget(null);
      fetchData();
    } catch {
      toast({ title: 'Error', description: 'Failed to update location', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = locations.filter((l) => {
    const q = search.toLowerCase();
    return l.locationName.toLowerCase().includes(q) || l.region.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/20">
            <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
            <p className="text-sm text-muted-foreground">Manage office locations and branches</p>
          </div>
        </div>
        <Button asChild>
          <Link to="/locations/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search locations..."
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
              <TableHead>Location Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  {search ? 'No locations match your search' : 'No locations found'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((loc) => (
                <TableRow key={loc.locationId} data-row>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {loc.locationId}
                  </TableCell>
                  <TableCell className="font-medium">{loc.locationName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{loc.region}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(loc)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(loc)}
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
            <DialogTitle>Delete Location</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.locationName}&quot;? This action cannot be undone.
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
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>Update location details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="editLocName">Location Name</Label>
              <Input
                id="editLocName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Location name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLocRegion">Region</Label>
              <Input
                id="editLocRegion"
                value={editRegion}
                onChange={(e) => setEditRegion(e.target.value)}
                placeholder="Region"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditSave} disabled={saving || !editName.trim() || !editRegion.trim()}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
