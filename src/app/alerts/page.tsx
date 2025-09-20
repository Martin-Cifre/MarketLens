'use client';

import { useState, useEffect } from 'react';
import { AlertRule } from '@/types/crypto';
import { AlertManager } from '@/components/alerts/AlertManager';
import { WatchlistManager } from '@/components/alerts/WatchlistManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCryptoStore } from '@/store/crypto';
import { 
  Bell, 
  Star, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  RefreshCw
} from 'lucide-react';

interface WatchlistItem {
  id: string;
  assetId: string;
  notes?: string;
  addedAt: Date;
  targetPrice?: number;
  stopLoss?: number;
}

export default function AlertsPage() {
  const { setLoading, setError } = useCryptoStore();
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading alerts and watchlist
    const mockAlerts: AlertRule[] = [
      {
        id: 'alert_1',
        assetId: '1',
        type: 'price_change',
        operator: 'above',
        threshold: 5,
        timeframe: '1h',
        channel: 'in_app',
        isActive: true,
        lastFiredAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: 'alert_2',
        assetId: '2',
        type: 'rsi_threshold',
        operator: 'below',
        threshold: 30,
        timeframe: '4h',
        channel: 'telegram',
        isActive: true,
        lastFiredAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
    ];

    const mockWatchlist: WatchlistItem[] = [
      {
        id: 'watch_1',
        assetId: '1',
        notes: 'Main holding, monitoring for breakout',
        targetPrice: 45000,
        stopLoss: 40000,
        addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        id: 'watch_2',
        assetId: '3',
        notes: 'High potential altcoin',
        targetPrice: 120,
        addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ];

    setAlerts(mockAlerts);
    setWatchlist(mockWatchlist);
  }, []);

  const handleAddAlert = (alertData: Omit<AlertRule, 'id' | 'lastFiredAt'>) => {
    const newAlert: AlertRule = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastFiredAt: undefined,
    };
    setAlerts([...alerts, newAlert]);
  };

  const handleEditAlert = (alertId: string, alertData: Partial<AlertRule>) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, ...alertData } : alert
    ));
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const handleToggleAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const handleAddToWatchlist = (item: Omit<WatchlistItem, 'id' | 'addedAt'>) => {
    const newItem: WatchlistItem = {
      ...item,
      id: `watch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedAt: new Date(),
    };
    setWatchlist([...watchlist, newItem]);
  };

  const handleRemoveFromWatchlist = (itemId: string) => {
    setWatchlist(watchlist.filter(item => item.id !== itemId));
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  // Calculate statistics
  const activeAlerts = alerts.filter(alert => alert.isActive).length;
  const watchlistSize = watchlist.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Alerts & Watchlist</h1>
              <p className="text-muted-foreground">
                Manage price alerts and track your favorite cryptocurrencies
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span>{activeAlerts} active alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>{watchlistSize} watchlist items</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Alerts</p>
                  <p className="text-2xl font-bold">{alerts.length}</p>
                </div>
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold text-green-600">{activeAlerts}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Watchlist Size</p>
                  <p className="text-2xl font-bold">{watchlistSize}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Price Alerts
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Watchlist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts">
            <AlertManager
              alerts={alerts}
              onAddAlert={handleAddAlert}
              onEditAlert={handleEditAlert}
              onDeleteAlert={handleDeleteAlert}
              onToggleAlert={handleToggleAlert}
            />
          </TabsContent>

          <TabsContent value="watchlist">
            <WatchlistManager
              watchlist={watchlist}
              onAddToWatchlist={handleAddToWatchlist}
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
            />
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Price Increase</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Set alerts for price increases
                </p>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Price Decrease</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Set alerts for price drops
                </p>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Volume Spikes</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get notified of unusual volume
                </p>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium">Add to Watchlist</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Track your favorite assets
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">Pro Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Set multiple alerts for different timeframes to catch various market conditions</li>
                  <li>• Use RSI thresholds to identify overbought or oversold conditions</li>
                  <li>• Combine price alerts with volume alerts for stronger signals</li>
                  <li>• Regularly review and clean up your watchlist to focus on relevant assets</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}