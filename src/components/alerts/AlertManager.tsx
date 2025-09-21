'use client';

import { useState, useEffect } from 'react';
import { AlertRule, EnrichedAsset } from '@/types/crypto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPercent } from '@/lib/crypto/utils';
import { fetchAssets } from '@/lib/crypto/mockData'; // Import fetchAssets
import { 
  Plus, 
  Edit, 
  Trash2, 
  Bell, 
  BellOff,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

interface AlertManagerProps {
  alerts: AlertRule[];
  onAddAlert: (alert: Omit<AlertRule, 'id' | 'lastFiredAt'>) => void;
  onEditAlert: (alertId: string, alert: Partial<AlertRule>) => void;
  onDeleteAlert: (alertId: string) => void;
  onToggleAlert: (alertId: string) => void;
}

export function AlertManager({ 
  alerts, 
  onAddAlert, 
  onEditAlert, 
  onDeleteAlert, 
  onToggleAlert 
}: AlertManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    assetId: '',
    type: 'price_change' as AlertRule['type'],
    operator: 'above' as AlertRule['operator'],
    threshold: '',
    timeframe: '1h',
    channel: 'in_app' as AlertRule['channel'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const alertData = {
      assetId: formData.assetId,
      type: formData.type,
      operator: formData.operator,
      threshold: parseFloat(formData.threshold),
      timeframe: formData.timeframe,
      channel: formData.channel,
      isActive: true,
    };

    onAddAlert(alertData);
    setIsDialogOpen(false);
    
    // Reset form
    setFormData({
      assetId: '',
      type: 'price_change',
      operator: 'above',
      threshold: '',
      timeframe: '1h',
      channel: 'in_app',
    });
  };

  const getAlertIcon = (type: AlertRule['type']) => {
    switch (type) {
      case 'price_change':
        return <TrendingUp className="w-4 h-4" />;
      case 'rsi_threshold':
        return <Activity className="w-4 h-4" />;
      case 'sma_crossover':
        return <TrendingUp className="w-4 h-4" />;
      case 'volume_spike':
        return <Activity className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertDescription = (alert: AlertRule) => {
    const asset = assets.find(a => a.id === alert.assetId); // Use fetched assets
    const assetSymbol = asset?.symbol || alert.assetId;
    
    switch (alert.type) {
      case 'price_change':
        return `Price ${alert.operator} ${formatPercent(alert.threshold)}`;
      case 'rsi_threshold':
        return `RSI ${alert.operator} ${alert.threshold}`;
      case 'sma_crossover':
        return `SMA crossover ${alert.operator} ${alert.threshold}`;
      case 'volume_spike':
        return `Volume spike ${alert.operator} ${alert.threshold.toLocaleString()}`;
      default:
        return 'Custom alert';
    }
  };

  const getChannelBadge = (channel: AlertRule['channel']) => {
    switch (channel) {
      case 'email':
        return <Badge variant="outline">Email</Badge>;
      case 'telegram':
        return <Badge variant="outline">Telegram</Badge>;
      case 'webhook':
        return <Badge variant="outline">Webhook</Badge>;
      default:
        return <Badge>In-App</Badge>;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Price Alerts
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Alert</DialogTitle>
                </DialogHeader>
                <AlertForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} />
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BellOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No alerts set up</h3>
            <p className="text-muted-foreground mb-4">
              Create price alerts to get notified when market conditions change
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Alert
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
            <Bell className="w-5 h-5" />
            Price Alerts ({alerts.length})
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Alert</DialogTitle>
              </DialogHeader>
              <AlertForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Triggered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => {
              const asset = assets.find(a => a.id === alert.assetId); // Use fetched assets
              
              return (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      <span>{asset?.symbol || alert.assetId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{getAlertDescription(alert)}</span>
                      <Badge variant="outline" className="text-xs mt-1">
                        {alert.timeframe}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {alert.type === 'price_change' || alert.type === 'rsi_threshold' 
                      ? formatPercent(alert.threshold)
                      : alert.threshold.toLocaleString()
                    }
                  </TableCell>
                  <TableCell>
                    {getChannelBadge(alert.channel)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.isActive}
                        onCheckedChange={() => onToggleAlert(alert.id)}
                      />
                      <span className={`text-sm ${alert.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {alert.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {alert.lastFiredAt ? (
                      <span className="text-sm text-muted-foreground">
                        {new Date(alert.lastFiredAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // For demo, just log the edit
                          console.log('Edit alert:', alert);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteAlert(alert.id)}
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
      </CardContent>
    </Card>
  );
}

interface AlertFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function AlertForm({ formData, setFormData, onSubmit }: AlertFormProps) {
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
            {assets.map((asset) => ( // Use fetched assets
              <SelectItem key={asset.id} value={asset.id}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{asset.symbol}</span>
                  <span className="text-muted-foreground">- {asset.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Alert Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Alert Type</Label>
        <Select 
          value={formData.type} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price_change">Price Change</SelectItem>
            <SelectItem value="rsi_threshold">RSI Threshold</SelectItem>
            <SelectItem value="sma_crossover">SMA Crossover</SelectItem>
            <SelectItem value="volume_spike">Volume Spike</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Operator */}
      <div className="space-y-2">
        <Label htmlFor="operator">Operator</Label>
        <Select 
          value={formData.operator} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, operator: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="above">Above</SelectItem>
            <SelectItem value="below">Below</SelectItem>
            <SelectItem value="crosses">Crosses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Threshold */}
      <div className="space-y-2">
        <Label htmlFor="threshold">Threshold</Label>
        <Input
          id="threshold"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.threshold}
          onChange={(e) => setFormData(prev => ({ ...prev, threshold: e.target.value }))}
          required
        />
      </div>

      {/* Timeframe */}
      <div className="space-y-2">
        <Label htmlFor="timeframe">Timeframe</Label>
        <Select 
          value={formData.timeframe} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, timeframe: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">1 Minute</SelectItem>
            <SelectItem value="5m">5 Minutes</SelectItem>
            <SelectItem value="15m">15 Minutes</SelectItem>
            <SelectItem value="1h">1 Hour</SelectItem>
            <SelectItem value="4h">4 Hours</SelectItem>
            <SelectItem value="1d">1 Day</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Channel */}
      <div className="space-y-2">
        <Label htmlFor="channel">Notification Channel</Label>
        <Select 
          value={formData.channel} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, channel: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in_app">In-App</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="telegram">Telegram</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setFormData({
            assetId: '',
            type: 'price_change',
            operator: 'above',
            threshold: '',
            timeframe: '1h',
            channel: 'in_app',
          })}
        >
          Clear
        </Button>
        <Button 
          type="submit"
          disabled={!formData.assetId || !formData.threshold}
        >
          Create Alert
        </Button>
      </div>
    </form>
  );
}