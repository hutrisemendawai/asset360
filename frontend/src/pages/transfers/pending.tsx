import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { transfersApi } from '@/lib/api';
import type { AssetTransferRequest } from '@/lib/api';
import { formatDateShort } from '@/lib/format';
import { useGsapFadeIn, useGsapStagger } from '@/hooks/use-gsap';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Plus, Check, X, ArrowLeftRight } from 'lucide-react';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
  ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400',
};

export default function PendingTransfersPage() {
  const { toast } = useToast();
  const headerRef = useGsapFadeIn(0);
  const tableRef = useGsapStagger('tr[data-row]', 0.15);

  const [transfers, setTransfers] = useState<AssetTransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await transfersApi.pending();
      setTransfers(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load transfers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (id: number, action: 'accept' | 'reject') => {
    try {
      setActioning(id);
      if (action === 'accept') {
        await transfersApi.accept(id);
        toast({ title: 'Accepted', description: 'Transfer request accepted' });
      } else {
        await transfersApi.reject(id);
        toast({ title: 'Rejected', description: 'Transfer request rejected' });
      }
      fetchData();
    } catch {
      toast({ title: 'Error', description: `Failed to ${action} transfer`, variant: 'destructive' });
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
            <ArrowLeftRight className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transfer Requests</h1>
            <p className="text-sm text-muted-foreground">Review and manage asset transfer requests</p>
          </div>
        </div>
        <Button asChild>
          <Link to="/transfers/new">
            <Plus className="mr-2 h-4 w-4" />
            New Transfer
          </Link>
        </Button>
      </div>

      <div ref={tableRef} className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>From Location</TableHead>
              <TableHead>To Location</TableHead>
              <TableHead>From Dept</TableHead>
              <TableHead>To Dept</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : transfers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  No transfer requests found
                </TableCell>
              </TableRow>
            ) : (
              transfers.map((t) => (
                <TableRow key={t.id} data-row>
                  <TableCell className="font-mono text-xs text-muted-foreground">{t.id}</TableCell>
                  <TableCell className="font-medium">{t.asset?.assetName}</TableCell>
                  <TableCell>{t.fromLocation?.locationName}</TableCell>
                  <TableCell>{t.toLocation?.locationName}</TableCell>
                  <TableCell>{t.fromDepartment?.departmentName}</TableCell>
                  <TableCell>{t.toDepartment?.departmentName}</TableCell>
                  <TableCell>{formatDateShort(t.requestedAt)}</TableCell>
                  <TableCell>
                    <Badge className={statusStyles[t.status] ?? ''} variant="secondary">
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {t.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleAction(t.id, 'accept')}
                          disabled={actioning === t.id}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleAction(t.id, 'reject')}
                          disabled={actioning === t.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {t.respondedAt ? formatDateShort(t.respondedAt) : '—'}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
