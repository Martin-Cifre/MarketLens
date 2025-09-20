'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PortfolioSummary, Position } from '@/types/crypto';
import { formatCurrency, formatPercent } from '@/lib/crypto/utils';
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';

interface PortfolioSummaryProps {
  portfolio: PortfolioSummary | null;
}

export function PortfolioSummaryCard({ portfolio }: PortfolioSummaryProps) {
  if (!portfolio) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <PieChart className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No portfolio data available</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add positions to track your portfolio
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = portfolio.totalPnl >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Portfolio Summary
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Total Value */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Total Value</div>
            <div className="text-3xl font-bold">
              {formatCurrency(portfolio.totalValue)}
            </div>
          </div>
          
          {/* P&L */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">P&L</div>
              <div className={`text-xl font-bold flex items-center justify-center gap-1 ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendIcon className="w-4 h-4" />
                {formatCurrency(portfolio.totalPnl)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">P&L %</div>
              <div className={`text-xl font-bold ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercent(portfolio.totalPnlPercent)}
              </div>
            </div>
          </div>
          
          {/* Asset Allocation */}
          <div>
            <div className="text-sm text-muted-foreground mb-3">Asset Allocation</div>
            <div className="space-y-2">
              {portfolio.positions.slice(0, 5).map((position, index) => {
                const allocation = Math.abs((position.qty * (position.currentPrice || 0)) / portfolio.totalValue * 100);
                return (
                  <div key={position.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{position.assetId}</span>
                      <span>{allocation.toFixed(1)}%</span>
                    </div>
                    <Progress value={allocation} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Positions</div>
              <div className="text-lg font-semibold">
                {portfolio.positions.length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Best Performer</div>
              <div className="text-lg font-semibold">
                {portfolio.positions.length > 0 
                  ? portfolio.positions.reduce((best, current) => 
                      (current.pnl || 0) > (best.pnl || 0) ? current : best
                    ).assetId
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}