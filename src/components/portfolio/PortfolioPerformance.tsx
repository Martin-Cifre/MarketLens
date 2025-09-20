'use client';

import { Position } from '@/types/crypto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { formatCurrency, formatPercent } from '@/lib/crypto/utils';
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, BarChart3, DollarSign } from 'lucide-react';

interface PortfolioPerformanceProps {
  positions: Position[];
}

export function PortfolioPerformance({ positions }: PortfolioPerformanceProps) {
  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Portfolio Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <PieChartIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Add positions to see performance analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate portfolio metrics
  const totalValue = positions.reduce((sum, position) => {
    return sum + (position.qty * (position.currentPrice || position.avgCost));
  }, 0);

  const totalCost = positions.reduce((sum, position) => {
    return sum + (position.qty * position.avgCost);
  }, 0);

  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  // Prepare data for charts
  const allocationData = positions.map(position => {
    const value = position.qty * (position.currentPrice || position.avgCost);
    const allocation = (value / totalValue) * 100;
    
    return {
      name: position.assetId,
      value: value,
      allocation: allocation,
      pnl: position.pnl || 0,
      pnlPercent: position.currentPrice ? 
        ((position.currentPrice - position.avgCost) / position.avgCost) * 100 : 0,
    };
  });

  // Performance data (P&L by asset)
  const performanceData = allocationData.map(item => ({
    asset: item.name,
    pnl: item.pnl,
    pnlPercent: item.pnlPercent,
  })).sort((a, b) => b.pnl - a.pnl);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Total Value</div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalValue)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Total Cost</div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalCost)}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Total P&L</div>
              <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalPnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {formatCurrency(totalPnl)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">P&L %</div>
              <div className={`text-2xl font-bold ${totalPnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(totalPnlPercent)}
              </div>
            </div>
          </div>

          {/* Best & Worst Performers */}
          <div className="pt-4 border-t space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Best Performer</span>
              <Badge variant="outline" className="text-green-600">
                {performanceData.length > 0 ? performanceData[0].asset : 'N/A'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Worst Performer</span>
              <Badge variant="outline" className="text-red-600">
                {performanceData.length > 0 ? performanceData[performanceData.length - 1].asset : 'N/A'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Asset Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, allocation }) => `${name} ${allocation.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Value']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Allocation Details */}
          <div className="space-y-2 mt-4">
            {allocationData.slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(item.value)} ({item.allocation.toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance by Asset */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance by Asset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <XAxis dataKey="asset" />
                <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'pnl' ? formatCurrency(value) : formatPercent(value),
                    name === 'pnl' ? 'P&L' : 'P&L %'
                  ]}
                />
                <Bar 
                  dataKey="pnl" 
                  fill={totalPnl >= 0 ? '#10b981' : '#ef4444'}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Performance Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {performanceData.slice(0, 6).map((item) => {
              const isPositive = item.pnl >= 0;
              return (
                <div key={item.asset} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{item.asset}</span>
                    <Badge variant={isPositive ? 'default' : 'destructive'}>
                      {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {formatPercent(item.pnlPercent)}
                    </Badge>
                  </div>
                  <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(item.pnl)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}