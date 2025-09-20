import { PriceData, TechnicalIndicators } from '@/types/crypto';

export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  const gains = changes.filter(change => change > 0);
  const losses = changes.filter(change => change < 0).map(loss => Math.abs(loss));
  
  const avgGain = gains.length > 0 ? gains.reduce((sum, gain) => sum + gain, 0) / period : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((sum, loss) => sum + loss, 0) / period : 0;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  
  const sum = prices.slice(-period).reduce((sum, price) => sum + price, 0);
  return sum / period;
}

export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(prices.slice(0, period), period);
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

export function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  
  // For signal line, we'd typically need MACD values over time
  // For simplicity, we'll use a basic approximation
  const signal = macd * 0.9; // Simplified calculation
  
  return {
    macd,
    signal,
    histogram: macd - signal,
  };
}

export function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): {
  upper: number;
  middle: number;
  lower: number;
} {
  if (prices.length < period) {
    const price = prices[prices.length - 1] || 0;
    return { upper: price, middle: price, lower: price };
  }
  
  const recentPrices = prices.slice(-period);
  const middle = calculateSMA(recentPrices, period);
  
  const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) / period;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    upper: middle + (standardDeviation * stdDev),
    middle,
    lower: middle - (standardDeviation * stdDev),
  };
}

export function calculateTechnicalIndicators(priceData: PriceData[]): TechnicalIndicators {
  if (priceData.length < 20) {
    return {
      rsi14: 50,
      sma20: 0,
      sma50: 0,
      ema12: 0,
      ema26: 0,
      macd: 0,
      macdSignal: 0,
    };
  }
  
  const prices = priceData.map(candle => candle.close);
  const volumes = priceData.map(candle => candle.volume);
  
  const rsi14 = calculateRSI(prices, 14);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdData = calculateMACD(prices);
  const bollinger = calculateBollingerBands(prices);
  
  return {
    rsi14,
    sma20,
    sma50,
    ema12,
    ema26,
    macd: macdData.macd,
    macdSignal: macdData.signal,
    bollingerUpper: bollinger.upper,
    bollingerLower: bollinger.lower,
  };
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

export function generateSignalScore(indicators: TechnicalIndicators): number {
  let score = 0.5; // Neutral starting point
  
  // RSI conditions
  if (indicators.rsi14 < 30) score += 0.2; // Oversold
  if (indicators.rsi14 > 70) score -= 0.2; // Overbought
  
  // EMA crossover
  if (indicators.ema12 > indicators.ema26) score += 0.15;
  if (indicators.ema12 < indicators.ema26) score -= 0.15;
  
  // SMA trend
  if (indicators.sma20 > indicators.sma50) score += 0.1;
  if (indicators.sma20 < indicators.sma50) score -= 0.1;
  
  // MACD
  if (indicators.macd > indicators.macdSignal) score += 0.1;
  if (indicators.macd < indicators.macdSignal) score -= 0.1;
  
  // Bollinger Bands
  if (indicators.bollingerUpper && indicators.bollingerLower) {
    const middle = (indicators.bollingerUpper + indicators.bollingerLower) / 2;
    // This would need current price, simplified for now
  }
  
  return Math.max(0, Math.min(1, score));
}

export function getSignalLabel(score: number): 'bullish' | 'bearish' | 'neutral' {
  if (score > 0.65) return 'bullish';
  if (score < 0.35) return 'bearish';
  return 'neutral';
}

export function getRecommendation(score: number, indicators: TechnicalIndicators): {
  action: 'buy' | 'sell' | 'hold' | 'take_profit' | 'accumulate';
  confidence: number;
  rationale: string[];
} {
  const rationale: string[] = [];
  
  if (score > 0.7) {
    if (indicators.rsi14 < 35) {
      return {
        action: 'accumulate',
        confidence: score,
        rationale: ['Strong oversold signal (RSI < 35)', 'Multiple bullish indicators aligned'],
      };
    }
    return {
      action: 'buy',
      confidence: score,
      rationale: ['Strong bullish signal', 'Technical indicators suggest upward momentum'],
    };
  }
  
  if (score < 0.3) {
    if (indicators.rsi14 > 65) {
      return {
        action: 'take_profit',
        confidence: 1 - score,
        rationale: ['Overbought conditions (RSI > 65)', 'Consider taking profits'],
      };
    }
    return {
      action: 'sell',
      confidence: 1 - score,
      rationale: ['Bearish signal detected', 'Technical indicators suggest downward pressure'],
    };
  }
  
  return {
    action: 'hold',
    confidence: 0.5,
    rationale: ['Neutral signal', 'Wait for clearer technical indicators'],
  };
}