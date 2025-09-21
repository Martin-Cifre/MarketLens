'use client';

import { useState } from 'react';
import { Position } from '@/types/crypto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit } from 'lucide-react';
import { MOCK_ASSETS } from '@/lib/crypto/mockData';
import { useState, useEffect } from 'react';
import { Position, EnrichedAsset } from '@/types/crypto'; // Add EnrichedAsset
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label }mport { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge }mport { Plus, Edit } from 'lucide-react';
import { fetchAssets } from '@/lib/crypto/mockData'; // Import fetchAssets
import { formatCurrency } from '@/lib/crypto/utils';

interface PositionFormProps {
  position?: Position;
  onSubmit: (position: Omit<Position, 'id' | 'createdAt'>) => void;
  trigger?: React.ReactNode;
}

export function PositionForm({ position, onSubmit, trigger }: PositionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    assetId: position?.assetId || '',
    qty: position?.qty.toString() || '',
    avgCost: position?.avgCost.toString() || '',
    source: position?.source || 'manual',
  });
  const [assets, setAssets] = useState<EnrichedAsset[]>([]); // State to store fetched assets

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const data = await fetchAssets();
        setAssets(data);
      } catch (error) {
        console.error('Error loading assets for position form:', error);
      }
    };
    loadAssets();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const positionData = {
      assetId: formData.assetId,
      qty: parseFloat(formData.qty),
      avgCost: parseFloat(formData.avgCost),
      source: formData.source as 'manual' | 'api',
    };

    onSubmit(positionData);
    setIsOpen(false);
    
    // Reset form
    setFormData({
      assetId: '',
      qty: '',
      avgCost: '',
      source: 'manual',
    });
  };

  const selectedAsset = assets.find(asset => asset.id === formData.assetId); // Use fetched assets
  const marketValue = formData.qty && formData.avgCost ? 
    parseFloat(formData.qty) * parseFloat(formData.avgCost) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Position
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {position ? 'Edit Position' : 'Add New Position'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
                {assets.map((asset) => (
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

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="qty">Quantity</Label>
            <Input
              id="qty"
              type="number"
              step="0.00000001"
              placeholder="0.00000000"
              value={formData.qty}
              onChange={(e) => setFormData(prev => ({ ...prev, qty: e.target.value }))}
              required
            />
          </div>

          {/* Average Cost */}
          <div className="space-y-2">
            <Label htmlFor="avgCost">Average Cost (USD)</Label>
            <Input
              id="avgCost"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.avgCost}
              onChange={(e) => setFormData(prev => ({ ...prev, avgCost: e.target.value }))}
              required
            />
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select 
              value={formData.source} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, source: value as 'manual' | 'api' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Entry</SelectItem>
                <SelectItem value="api">API Import</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {selectedAsset && formData.qty && formData.avgCost && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Position Preview</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Asset:</span>
                  <span className="font-medium">{selectedAsset.symbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quantity:</span>
                  <span className="font-medium">{parseFloat(formData.qty).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Cost:</span>
                  <span className="font-medium">{formatCurrency(parseFloat(formData.avgCost))}</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-2">
                  <span>Market Value:</span>
                  <span>{formatCurrency(marketValue)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!formData.assetId || !formData.qty || !formData.avgCost}
            >
              {position ? 'Update Position' : 'Add Position'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}