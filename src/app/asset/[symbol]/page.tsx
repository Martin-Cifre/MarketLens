'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Asset, PriceData, TechnicalIndicators, Signal } from '@/types/crypto';
import { CandlestickChart } from '@/components/crypto/CandlestickChart';
import { TechnicalIndicatorsPanel } from '@/components/crypto/TechnicalIndicatorsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCryptoStore } from '@/store/crypto';
import { fetchPriceData, fetchSignals } from '@/lib/crypto/mockData';
import { calculateTechnicalIndicators } from '@/lib/crypto/utils';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  RefreshCw,
  Activity,
  Target
} from 'lucide-react';
import Link from 'next/link';

export default function AssetDetailPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  const { assets, setLoading, setError } = useCryptoStore();
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadAssetData = async () => {
      if (!symbol) return;
      
      try {
        setIsLoading(true);
        
        // Find asset in store or mock data
        const foundAsset = assets.find(a => a.symbol === symbol);
        
        if (!foundAsset) {
          setError('Asset not found');
          return;
        }
        
        setAsset(foundAsset);
        
        // Load price data
        const data = await fetchPriceData(symbol, selectedTimeframe, 200);
        setPriceData(data);
        
        // Calculate technical indicators
        const techIndicators = calculateTechnicalIndicators(data);
        setIndicators(techIndicators);
        
        // Load signals
        const assetSignals = await fetchSignals(foundAsset.id);
        setSignals(assetSignals);
        
      } catch (error) {
        setError('Failed to load asset data');
        console.error('Error loading asset data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssetData();
  }, [symbol, selectedTimeframe, assets, setError]);

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
  };

  const handleRefresh = () => {
    if (asset) {
      // Reload data for current asset
      const loadAssetData = async () => {
        try {
          setIsLoading(true);
          const data = await fetchPriceData(asset.symbol, selectedTimeframe, 200);
          setPriceData(data);
          
          const techIndicators = calculateTechnicalIndicators(data);
          setIndicators(techIndicators);
        } catch (error) {
          console.error('Error refreshing data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadAssetData();
    }
  };

  if (!asset) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Asset not found</p>
          <Link href="/">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPositive = asset.change24h > 0;
  const timeframes = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1d', label: '1d' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">{asset.symbol}</h1>
                <p className="text-muted-foreground">{asset.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
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
        {/* Asset Overview */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Current Price</div>
                <div className="text-3xl font-bold">
                  ${asset.price.toLocaleString()}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">24h Change</div>
                <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Volume 24h</div>
                <div className="text-xl font-semibold">
                  ${(asset.volume24h / 1e9).toFixed(2)}B
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Market Cap</div>
                <div className="text-xl font-semibold">
                  ${(asset.marketCap / 1e9).toFixed(2)}B
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeframe Selector */}
        <div className="flex gap-2 mb-6">
          {timeframes.map((timeframe) => (
            <Button
              key={timeframe.value}
              variant={selectedTimeframe === timeframe.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeframeChange(timeframe.value)}
            >
              {timeframe.label}
            </Button>
          ))}
        </div>

        {/* Chart and Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <CandlestickChart
              data={priceData}
              indicators={indicators || undefined}
              symbol={asset.symbol}
              volume={true}
            />
          </div>
          
          {/* Technical Indicators */}
          <div>
            {indicators && (
              <TechnicalIndicatorsPanel
                indicators={indicators}
                symbol={asset.symbol}
              />
            )}
          </div>
        </div>

        {/* Recent Signals */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {signals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No signals available for this asset</p>
                </div>
              ) : (
                signals.slice(0, 5).map((signal) => (
                  <div
                    key={signal.id}
                    className={`p-3 rounded-lg border ${
                      signal.label === 'bullish' 
                        ? 'text-green-600 bg-green-50 border-green-200'
                        : signal.label === 'bearish'
                        ? 'text-red-600 bg-red-50 border-red-200'
                        : 'text-gray-600 bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {signal.timeframe}
                        </Badge>
                        <span className="font-medium capitalize">{signal.label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-3 h-3" />
                        <span className="text-muted-foreground">
                          {signal.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Confidence: </span>
                      <span className="font-medium">
                        {(signal.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    {signal.explanation && (
                      <p className="text-xs mt-2 text-muted-foreground">
                        {signal.explanation}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}