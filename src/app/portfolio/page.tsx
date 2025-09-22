'use client';

import { useState, useEffect } from 'react';
import { Position } from '@/types/crypto';
import { PositionList } from '@/components/portfolio/PositionList';
import { PositionForm } from '@/components/portfolio/PositionForm';
import { PortfolioPerformance } from '@/components/portfolio/PortfolioPerformance';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCryptoStore } from '@/store/crypto';
import { simulatePriceUpdate, fetchAssets } from '@/lib/crypto/mockData';
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function PortfolioPage() {
  const { positions, setPositions, setLoading, setError } = useCryptoStore();
  const [isLoading, setIsLoading] = useState(false);

  // Simulate price updates for positions
  useEffect(() => {
    const interval = setInterval(() => {
      if (positions.length > 0) {
        const update = simulatePriceUpdate();
        // Update positions with new prices
        const updatedPositions = positions.map(position => {
          if (position.assetId === update.symbol) {
            const currentPrice = update.price;
            const pnl = (currentPrice - position.avgCost) * position.qty;
            return {
              ...position,
              currentPrice,
              pnl,
            };
          }
          return position;
        });
        setPositions(updatedPositions);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [positions.length, setPositions]);

  const handleAddPosition = (positionData: Omit<Position, 'id' | 'createdAt'>) => {
    const newPosition: Position = {
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...positionData,
      createdAt: new Date(),
      currentPrice: (await fetchAssets()).find(asset => asset.id === positionData.assetId)?.price || positionData.avgCost,
      pnl: 0,
    };

    setPositions([...positions, newPosition]);
  };

  const handleEditPosition = (position: Position) => {
    // For now, we'll just log the edit action
    console.log('Edit position:', position);
    // In a real app, you would open the form with the position data
  };

  const handleDeletePosition = (positionId: string) => {
    setPositions(positions.filter(position => position.id !== positionId));
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  // Calculate portfolio summary
  const totalValue = positions.reduce((sum, position) => {
    return sum + (position.qty * (position.currentPrice || position.avgCost));
  }, 0);

  const totalCost = positions.reduce((sum, position) => {
    return sum + (position.qty * position.avgCost);
  }, 0);

  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  const isPositive = totalPnl >= 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Portfolio</h1>
              <p className="text-muted-foreground">
                Track your market investments and performance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-xl font-bold">{totalValue > 0 ? totalValue.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }) : '$0'}</div>
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
        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">
                    {totalValue.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total P&L</p>
                  <p className={`text-2xl font-bold flex items-center gap-1 ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {totalPnl.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                {isPositive ? (
                  <TrendingUp className="w-8 h-8 text-green-600" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">P&L Percentage</p>
                  <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%
                  </p>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {isPositive ? '+' : ''}{totalPnlPercent.toFixed(1)}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Tabs */}
        <Tabs defaultValue="positions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="add">Add Position</TabsTrigger>
          </TabsList>

          <TabsContent value="positions">
            <PositionList
              positions={positions}
              onAddPosition={() => {}}
              onEditPosition={handleEditPosition}
              onDeletePosition={handleDeletePosition}
            />
          </TabsContent>

          <TabsContent value="performance">
            <PortfolioPerformance positions={positions} />
          </TabsContent>

          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add New Position</CardTitle>
                <p className="text-muted-foreground">
                  Add a new asset position to your portfolio
                </p>
              </CardHeader>
              <CardContent>
                <PositionForm onSubmit={handleAddPosition} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Risk Warning */}
        <Card className="mt-8 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">Investment Risk Warning</h3>
                <p className="text-sm text-yellow-700">
                  Market investments are subject to market risks. The value of your portfolio 
                  can go up or down. Past performance is not indicative of future results. 
                  Only invest what you can afford to lose and consider diversifying your investments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}