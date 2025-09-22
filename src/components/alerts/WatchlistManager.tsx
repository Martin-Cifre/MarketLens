'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MOCK_ASSETS } from '@/lib/crypto/mockData';
import { formatCurrency, formatPercent, formatLargeNumber } from '@/lib/crypto/utils';
import { 
  Plus, 
  Star, 
  StarOff, 
  Search, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Eye,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

interface WatchlistItem {
  id: string;
  assetId: string;
  notes?: string;
  addedAt: Date;
  targetPrice?: number;
  stopLoss?: number;
}

interface WatchlistManagerProps {
  watchlist: WatchlistItem[];
  onAddToWatchlist: (item: Omit<WatchlistItem, 'id' | 'addedAt'>) => void;
  onRemoveFromWatchlist: (itemId: string) => void;
}

export function WatchlistManager({ 
  watchlist, 
  onAddToWatchlist, 
  onRemoveFromWatchlist 
}: WatchlistManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    assetId: '',
    notes: '',
    targetPrice: '',
    stopLoss: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const watchlistItem = {
      assetId: formData.assetId,
      notes: formData.notes || undefined,
      targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) : undefined,
      stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : undefined,
    };

    onAddToWatchlist(watchlistItem);
    setIsDialogOpen(false);
    
    // Reset form
    setFormData({
      assetId: '',
      notes: '',
      targetPrice: '',
      stopLoss: '',
    });
  };

  const filteredAssets = MOCK_ASSETS.filter(asset =>
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWatchlistAssetData = (assetId: string) => {
    return MOCK_ASSETS.find(asset => asset.id === assetId);
  };

  const getPriceTargetStatus = (currentPrice: number, targetPrice?: number, stopLoss?: number) => {
    if (!targetPrice && !stopLoss) return null;
    
    if (targetPrice && currentPrice >= targetPrice) {
      return { status: 'target_reached', color: 'text-green-600', label: 'Target Reached' };
    }
    
    if (stopLoss && currentPrice <= stopLoss) {
      return { status: 'stop_loss', color: 'text-red-600', label: 'Stop Loss Hit' };
    }
    
    return null;
  };

  if (watchlist.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Watchlist
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Watchlist
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add to Watchlist</DialogTitle>
                </DialogHeader>
                <WatchlistForm 
                  formData={formData} 
                  setFormData={setFormData} 
                  onSubmit={handleSubmit} 
                />
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <StarOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Your watchlist is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add cryptocurrencies to your watchlist to track them closely
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Asset
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Watchlist ({watchlist.length})
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add to Watchlist
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add to Watchlist</DialogTitle>
              </DialogHeader>
              <WatchlistForm 
                formData={formData} 
                setFormData={setFormData} 
                onSubmit={handleSubmit} 
              />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search assets to add..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Watchlist Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>24h Change</TableHead>
                <TableHead>Targets</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchlist.map((item) => {
                const asset = getWatchlistAssetData(item.assetId);
                if (!asset) return null;

                const isPositive = asset.change24h > 0;
                const priceTargetStatus = getPriceTargetStatus(
                  asset.price, 
                  item.targetPrice, 
                  item.stopLoss
                );

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <Link 
                          href={`/asset/${asset.symbol}`}
                          className="hover:underline"
                        >
                          <div>
                            <div className="font-semibold">{asset.symbol}</div>
                            <div className="text-sm text-muted-foreground">{asset.name}</div>
                          </div>
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(asset.price)}
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {formatPercent(asset.change24h)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {item.targetPrice && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Target:</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(item.targetPrice)}
                            </span>
                          </div>
                        )}
                        {item.stopLoss && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Stop:</span>
                            <span className="font-medium text-red-600">
                              {formatCurrency(item.stopLoss)}
                            </span>
                          </div>
                        )}
                        {priceTargetStatus && (
                          <Badge variant="outline" className={priceTargetStatus.color}>
                            {priceTargetStatus.label}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.notes && (
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {item.notes}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {item.addedAt.toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/asset/${asset.symbol}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveFromWatchlist(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Asset Search Results */}
          {searchTerm && filteredAssets.length > 0 && (
            <div className="border rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Available Assets</h4>
              {filteredAssets.slice(0, 5).map((asset) => {
                const isInWatchlist = watchlist.some(item => item.assetId === asset.id);
                
                return (
                  <div key={asset.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{asset.symbol}</span>
                      <span className="text-sm text-muted-foreground">{asset.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatCurrency(asset.price)}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant={isInWatchlist ? "outline" : "default"}
                      disabled={isInWatchlist}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, assetId: asset.id }));
                        setIsDialogOpen(true);
                        setSearchTerm('');
                      }}
                    >
                      {isInWatchlist ? 'Added' : 'Add'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface WatchlistFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function WatchlistForm({ formData, setFormData, onSubmit }: WatchlistFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Asset Selection */}
      <div className="space-y-2">
        <Label htmlFor="asset">Asset</Label>
        <Select 
          value={formData.assetId} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, assetId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an asset" />
          </SelectTrigger>
          <SelectContent>
            {MOCK_ASSETS.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{asset.symbol}</span>
                  <span className="text-muted-foreground">- {asset.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {formatCurrency(asset.price)}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Target Price */}
      <div className="space-y-2">
        <Label htmlFor="targetPrice">Target Price (Optional)</Label>
        <Input
          id="targetPrice"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.targetPrice}
          onChange={(e) => setFormData(prev => ({ ...prev, targetPrice: e.target.value }))}
        />
      </div>

      {/* Stop Loss */}
      <div className="space-y-2">
        <Label htmlFor="stopLoss">Stop Loss (Optional)</Label>
        <Input
          id="stopLoss"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.stopLoss}
          onChange={(e) => setFormData(prev => ({ ...prev, stopLoss: e.target.value }))}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          placeholder="Add notes about this asset..."
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setFormData({
            assetId: '',
            notes: '',
            targetPrice: '',
            stopLoss: '',
          })}
        >
          Clear
        </Button>
        <Button 
          type="submit"
          disabled={!formData.assetId}
        >
          Add to Watchlist
        </Button>
      </div>
    </form>
  );
}