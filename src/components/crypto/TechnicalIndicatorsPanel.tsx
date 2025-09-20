'use client';

import { TechnicalIndicators } from '@/types/crypto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatPercent } from '@/lib/crypto/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3,
  Target,
  AlertTriangle
} from 'lucide-react';

interface TechnicalIndicatorsPanelProps {
  indicators: TechnicalIndicators;
  symbol: string;
}

export function TechnicalIndicatorsPanel({ indicators, symbol }: TechnicalIndicatorsPanelProps) {
  const getRSIStatus = (rsi: number) => {
    if (rsi >= 70) return { status: 'Overbought', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (rsi <= 30) return { status: 'Oversold', color: 'text-green-600', bgColor: 'bg-green-50' };
    return { status: 'Neutral', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  };

  const getMACDSignal = (macd: number, signal: number) => {
    if (macd > signal) return { status: 'Bullish', color: 'text-green-600', icon: TrendingUp };
    if (macd < signal) return { status: 'Bearish', color: 'text-red-600', icon: TrendingDown };
    return { status: 'Neutral', color: 'text-yellow-600', icon: Activity };
  };

  const getTrendSignal = (sma20: number, sma50: number, ema12: number, ema26: number) => {
    const smaSignal = sma20 > sma50 ? 1 : -1;
    const emaSignal = ema12 > ema26 ? 1 : -1;
    const totalSignal = smaSignal + emaSignal;
    
    if (totalSignal >= 2) return { status: 'Strong Bullish', color: 'text-green-600', strength: 100 };
    if (totalSignal === 1) return { status: 'Mild Bullish', color: 'text-green-500', strength: 75 };
    if (totalSignal === -1) return { status: 'Mild Bearish', color: 'text-red-500', strength: 75 };
    if (totalSignal <= -2) return { status: 'Strong Bearish', color: 'text-red-600', strength: 100 };
    return { status: 'Neutral', color: 'text-yellow-600', strength: 50 };
  };

  const rsiStatus = getRSIStatus(indicators.rsi14);
  const macdSignal = getMACDSignal(indicators.macd, indicators.macdSignal);
  const trendSignal = getTrendSignal(indicators.sma20, indicators.sma50, indicators.ema12, indicators.ema26);
  const MacdIcon = macdSignal.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Technical Indicators
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* RSI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">RSI (14)</span>
            <Badge className={rsiStatus.bgColor}>
              <span className={rsiStatus.color}>{rsiStatus.status}</span>
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Progress 
                value={indicators.rsi14} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>30</span>
                <span>70</span>
                <span>100</span>
              </div>
            </div>
            <span className="font-medium text-sm w-12 text-right">
              {indicators.rsi14.toFixed(1)}
            </span>
          </div>
        </div>

        {/* MACD */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">MACD</span>
            <Badge variant="outline" className="flex items-center gap-1">
              <MacdIcon className="w-3 h-3" />
              <span className={macdSignal.color}>{macdSignal.status}</span>
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">MACD: </span>
              <span className="font-medium">{indicators.macd.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Signal: </span>
              <span className="font-medium">{indicators.macdSignal.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {/* Moving Averages */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Moving Averages</span>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span className={trendSignal.color}>{trendSignal.status}</span>
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">SMA 20: </span>
              <span className="font-medium">${indicators.sma20.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">SMA 50: </span>
              <span className="font-medium">${indicators.sma50.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">EMA 12: </span>
              <span className="font-medium">${indicators.ema12.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">EMA 26: </span>
              <span className="font-medium">${indicators.ema26.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Bollinger Bands */}
        {indicators.bollingerUpper && indicators.bollingerLower && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Bollinger Bands</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Upper: </span>
                <span className="font-medium">${indicators.bollingerUpper.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Middle: </span>
                <span className="font-medium">
                  ${((indicators.bollingerUpper + indicators.bollingerLower) / 2).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Lower: </span>
                <span className="font-medium">${indicators.bollingerLower.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Overall Signal Strength */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Signal Strength</span>
            <span className={`text-sm font-medium ${trendSignal.color}`}>
              {formatPercent(trendSignal.strength)}
            </span>
          </div>
          <Progress value={trendSignal.strength} className="h-3" />
        </div>
      </CardContent>
    </Card>
  );
}