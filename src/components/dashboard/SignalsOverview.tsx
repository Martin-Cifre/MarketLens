'use client';

import { useEffect, useState } from 'react';
import { Signal } from '@/types/crypto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCryptoStore } from '@/store/crypto';
import { fetchSignals } from '@/lib/crypto/mockData';
import { formatPercent } from '@/lib/crypto/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  AlertTriangle,
  Target
} from 'lucide-react';

export function SignalsOverview() {
  const { signals, setSignals, setLoading, setError } = useCryptoStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');

  useEffect(() => {
    const loadSignals = async () => {
      try {
        setLoading(true);
        const data = await fetchSignals();
        setSignals(data);
      } catch (error) {
        setError('Failed to load signals');
        console.error('Error loading signals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSignals();
  }, [setSignals, setLoading, setError]);

  const filteredSignals = selectedTimeframe === 'all' 
    ? signals 
    : signals.filter(signal => signal.timeframe === selectedTimeframe);

  const getSignalIcon = (label: string) => {
    switch (label) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getSignalColor = (label: string) => {
    switch (label) {
      case 'bullish':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'bearish':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score <= 0.3) return 'text-red-600';
    return 'text-yellow-600';
  };

  const timeframes = ['all', '1h', '4h', '1d'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Trading Signals
          </CardTitle>
          <div className="flex gap-2">
            {timeframes.map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe === 'all' ? 'All' : timeframe}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredSignals.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No signals available</p>
            </div>
          ) : (
            filteredSignals.map((signal) => (
              <div
                key={signal.id}
                className={`p-3 rounded-lg border ${getSignalColor(signal.label)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSignalIcon(signal.label)}
                    <span className="font-medium capitalize">{signal.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {signal.timeframe}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-3 h-3" />
                    <span className="text-muted-foreground">
                      {signal.createdAt.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Confidence: </span>
                    <span className={`font-medium ${getConfidenceColor(signal.score)}`}>
                      {formatPercent(signal.score * 100)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RSI: </span>
                    <span className="font-medium">
                      {signal.payload.rsi14.toFixed(1)}
                    </span>
                  </div>
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
  );
}