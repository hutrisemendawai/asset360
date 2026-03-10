import { useEffect, useState, useRef } from 'react';
import { assetsApi, bookValueApi } from '@/lib/api';
import type { Asset, BookValueResult } from '@/lib/api';
import { formatRupiah, formatDateShort } from '@/lib/format';
import { useGsapFadeIn } from '@/hooks/use-gsap';
import { useToast } from '@/components/ui/use-toast';
import gsap from 'gsap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Calculator, Search } from 'lucide-react';

export default function BookValuePage() {
  const { toast } = useToast();
  const headerRef = useGsapFadeIn(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [asOfDate, setAsOfDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [results, setResults] = useState<BookValueResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingAssets, setFetchingAssets] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    assetsApi
      .list()
      .then(setAssets)
      .catch(() => toast({ title: 'Error', description: 'Failed to load assets', variant: 'destructive' }))
      .finally(() => setFetchingAssets(false));
  }, [toast]);

  const toggleAsset = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredAssets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAssets.map((a) => a.assetId)));
    }
  };

  const handleCalculate = async () => {
    if (selectedIds.size === 0) {
      toast({ title: 'Validation', description: 'Select at least one asset', variant: 'destructive' });
      return;
    }
    if (!asOfDate) {
      toast({ title: 'Validation', description: 'Please select a date', variant: 'destructive' });
      return;
    }
    try {
      setLoading(true);
      const data = await bookValueApi.calculate(Array.from(selectedIds), asOfDate);
      setResults(data);

      // Animate results
      if (resultsRef.current) {
        const rows = resultsRef.current.querySelectorAll('tr[data-row]');
        gsap.fromTo(
          rows,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
        );
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to calculate book value', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter((a) => {
    const q = search.toLowerCase();
    return a.assetName.toLowerCase().includes(q) || a.fixedAssetCode.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div ref={headerRef} className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-500/20">
          <Calculator className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Book Value Calculator</h1>
          <p className="text-sm text-muted-foreground">Calculate asset depreciation and current book values</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Asset selection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Select Assets</CardTitle>
            <CardDescription>Choose assets to calculate book value for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-80 overflow-y-auto rounded-md border">
              {fetchingAssets ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">Loading assets...</div>
              ) : filteredAssets.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">No assets found</div>
              ) : (
                <div className="divide-y">
                  <label className="flex items-center gap-3 px-4 py-2.5 bg-muted/50 cursor-pointer hover:bg-muted">
                    <Checkbox
                      checked={selectedIds.size === filteredAssets.length && filteredAssets.length > 0}
                      onCheckedChange={toggleAll}
                    />
                    <span className="text-sm font-medium">Select All ({filteredAssets.length})</span>
                  </label>
                  {filteredAssets.map((asset) => (
                    <label
                      key={asset.assetId}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedIds.has(asset.assetId)}
                        onCheckedChange={() => toggleAsset(asset.assetId)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{asset.assetName}</p>
                        <p className="text-xs text-muted-foreground">{asset.fixedAssetCode} · {formatRupiah(asset.assetValue)}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedIds.size > 0 && (
              <p className="text-sm text-muted-foreground">{selectedIds.size} asset(s) selected</p>
            )}
          </CardContent>
        </Card>

        {/* Calculate controls */}
        <Card>
          <CardHeader>
            <CardTitle>Calculate</CardTitle>
            <CardDescription>Set the date for book value calculation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asOfDate">As of Date</Label>
              <Input
                id="asOfDate"
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleCalculate} disabled={loading || selectedIds.size === 0}>
              <Calculator className="mr-2 h-4 w-4" />
              {loading ? 'Calculating...' : 'Calculate Book Value'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {results && (
        <div ref={resultsRef}>
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>Book values as of {formatDateShort(asOfDate)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Original Value</TableHead>
                      <TableHead className="text-right">Book Value</TableHead>
                      <TableHead>Purchase Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No results
                        </TableCell>
                      </TableRow>
                    ) : (
                      results.map((r) => (
                        <TableRow key={r.fixedAssetCode} data-row>
                          <TableCell className="font-mono text-xs">{r.fixedAssetCode}</TableCell>
                          <TableCell className="font-medium">{r.assetName}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">{formatRupiah(r.originalValue)}</TableCell>
                          <TableCell className="text-right whitespace-nowrap font-semibold">{formatRupiah(r.bookValue)}</TableCell>
                          <TableCell>{formatDateShort(r.purchaseDate)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
