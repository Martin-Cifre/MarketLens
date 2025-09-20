'use client';

import { PriceData } from '@/types/crypto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/crypto/utils';

interface SparklineChartProps {
  data: PriceData[];
  symbol: string;
  color?: string;
}

export function SparklineChart({ data, symbol, color = '#3b82f6' }: SparklineChartProps) {
  const chartData = data.map((item, index) => ({
    time: index,
    price: item.close,
    timestamp: item.timestamp,
  }));

  const minPrice = Math.min(...data.map(d => d.close));
  const maxPrice = Math.max(...data.map(d => d.close));
  const currentPrice = data[data.length - 1]?.close || 0;
  const firstPrice = data[0]?.close || 0;
  const priceChange = ((currentPrice - firstPrice) / firstPrice) * 100;
  const isPositive = priceChange > 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-lg">
          <p className="text-sm font-medium">{symbol}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Price Chart</span>
          <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={60}>
          <LineChart data={chartData}>
            <XAxis 
              dataKey="time" 
              hide={true}
            />
            <YAxis 
              domain={[minPrice * 0.999, maxPrice * 1.001]} 
              hide={true}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}