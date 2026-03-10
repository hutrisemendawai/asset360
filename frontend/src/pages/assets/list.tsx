import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { assetsApi } from '@/lib/api';
import type { Asset } from '@/lib/api';
import { formatRupiah, formatDateShort } from '@/lib/format';
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
import { Plus, Pencil, Trash2, Search, Package, QrCode } from 'lucide-react';

export default function AssetListPage() {
  const { toast } = useToast();
  const headerRef = useGsapFadeIn(0);
  const tableRef = useGsapStagger('tr[data-row]', 0.15);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await assetsApi.list();
      setAssets(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load assets', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await assetsApi.delete(deleteTarget.assetId);
      toast({ title: 'Deleted', description: `Asset "${deleteTarget.assetName}" deleted successfully` });
      setDeleteTarget(null);
      fetchAssets();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete asset', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const filtered = assets.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.assetName.toLowerCase().includes(q) ||
      a.fixedAssetCode.toLowerCase().includes(q) ||
      a.category?.categoryName?.toLowerCase().includes(q) ||
      a.department?.departmentName?.toLowerCase().includes(q) ||
      a.location?.region?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20">
            <Package className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
            <p className="text-sm text-muted-foreground">Manage your fixed assets inventory</p>
          </div>
        </div>
        <Button asChild>
          <Link to="/assets/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Asset
          </Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div ref={tableRef} className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-center">QR</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  Loading assets...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  {search ? 'No assets match your search' : 'No assets found'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((asset) => (
                <TableRow key={asset.assetId} data-row>
                  <TableCell className="font-mono text-xs">{asset.fixedAssetCode}</TableCell>
                  <TableCell className="font-medium">{asset.assetName}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">{formatRupiah(asset.assetValue)}</TableCell>
                  <TableCell>{formatDateShort(asset.purchaseDate)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{asset.location?.region}</Badge>
                  </TableCell>
                  <TableCell>{asset.category?.categoryName}</TableCell>
                  <TableCell>{asset.department?.departmentName}</TableCell>
                  <TableCell className="text-center">
                    <a
                      href={assetsApi.qrcode(asset.assetId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center"
                    >
                      <img
                        src={assetsApi.qrcode(asset.assetId)}
                        alt="QR"
                        className="h-8 w-8 rounded"
                      />
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/assets/${asset.assetId}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(asset)}
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
            <DialogTitle>Delete Asset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.assetName}&quot;? This action cannot be undone.
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
