'use client';

import { PriceData, TechnicalIndicators } from '@/types/crypto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Candlestick, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  Bar
} from 'recharts';
import { formatCurrency } from '@/lib/crypto/utils';
import { useState } from 'react';

interface CandlestickChartProps {
  data: PriceData[];
  indicators?: TechnicalIndicators;
  symbol: string;
  volume?: boolean;
}

export function CandlestickChart({ data, indicators, symbol, volume = true }: CandlestickChartProps) {
  const [showVolume, setShowVolume] = useState(volume);
  
  const chartData = data.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    timestamp: item.timestamp,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: item.volume,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.close >= data.open;
      
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{symbol} - {label}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Open: <span className="font-medium">{formatCurrency(data.open)}</span></div>
            <div>Close: <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.close)}
            </span></div>
            <div>High: <span className="font-medium">{formatCurrency(data.high)}</span></div>
            <div>Low: <span className="font-medium">{formatCurrency(data.low)}</span></div>
            {showVolume && (
              <div className="col-span-2">Volume: <span className="font-medium">
                {data.volume.toLocaleString()}
              </span></div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const minPrice = Math.min(...data.map(d => d.low));
  const maxPrice = Math.max(...data.map(d => d.high));
  const maxVolume = Math.max(...data.map(d => d.volume));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Price Chart</CardTitle>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showVolume}
                onChange={(e) => setShowVolume(e.target.checked)}
                className="rounded"
              />
              Show Volume
            </label>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <XAxis 
              dataKey="time" 
              scale="band"
              interval="preserveStartEnd"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[minPrice * 0.995, maxPrice * 1.005]}
              orientation="right"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            {showVolume && (
              <YAxis 
                yAxisId="volume"
                orientation="left"
                domain={[0, maxVolume * 1.1]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Candlesticks */}
            <Candlestick
              fill="#8884d8"
              stroke="#8884d8"
            />
            
            {/* Volume bars */}
            {showVolume && (
              <Bar
                yAxisId="volume"
                dataKey="volume"
                fill="#8884d8"
                opacity={0.3}
              />
            )}
            
            {/* Technical Indicators */}
            {indicators && (
              <>
                <Line
                  type="monotone"
                  dataKey={() => indicators.sma20}
                  stroke="#ff7300"
                  dot={false}
                  strokeWidth={2}
                  name="SMA 20"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey={() => indicators.sma50}
                  stroke="#00ff00"
                  dot={false}
                  strokeWidth={2}
                  name="SMA 50"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey={() => indicators.ema12}
                  stroke="#0088fe"
                  dot={false}
                  strokeWidth={1}
                  name="EMA 12"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey={() => indicators.ema26}
                  stroke="#ff0080"
                  dot={false}
                  strokeWidth={1}
                  name="EMA 26"
                  connectNulls={false}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}