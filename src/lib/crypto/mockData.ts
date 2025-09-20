import { Asset, PriceData, Signal, TechnicalIndicators } from '@/types/crypto';
import { calculateTechnicalIndicators, generateSignalScore, getSignalLabel } from './utils';

// Mock data for initial development
export const MOCK_ASSETS: Asset[] = [
  {
    id: '1',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 43250.50,
    change24h: 2.5,
    volume24h: 28500000000,
    marketCap: 847000000000,
    lastUpdated: new Date(),
  },
  {
    id: '2',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2580.75,
    change24h: -1.2,
    volume24h: 15200000000,
    marketCap: 310000000000,
    lastUpdated: new Date(),
  },
  {
    id: '3',
    symbol: 'SOL',
    name: 'Solana',
    price: 98.45,
    change24h: 5.8,
    volume24h: 2100000000,
    marketCap: 42000000000,
    lastUpdated: new Date(),
  },
  {
    id: '4',
    symbol: 'ADA',
    name: 'Cardano',
    price: 0.58,
    change24h: 0.8,
    volume24h: 450000000,
    marketCap: 20500000000,
    lastUpdated: new Date(),
  },
  {
    id: '5',
    symbol: 'BNB',
    name: 'Binance Coin',
    price: 315.20,
    change24h: -0.5,
    volume24h: 1200000000,
    marketCap: 48500000000,
    lastUpdated: new Date(),
  },
];

export function generateMockPriceData(symbol: string, days: number = 30): PriceData[] {
  const data: PriceData[] = [];
  const basePrice = MOCK_ASSETS.find(asset => asset.symbol === symbol)?.price || 100;
  let currentPrice = basePrice;
  
  const now = Date.now();
  const interval = 5 * 60 * 1000; // 5 minutes
  
  for (let i = days * 24 * 12; i >= 0; i--) {
    const timestamp = now - (i * interval);
    
    // Random walk with trend
    const change = (Math.random() - 0.5) * 0.02;
    currentPrice = currentPrice * (1 + change);
    
    const volatility = 0.01;
    const high = currentPrice * (1 + Math.random() * volatility);
    const low = currentPrice * (1 - Math.random() * volatility);
    const open = i === days * 24 * 12 ? currentPrice : data[data.length - 1].close;
    
    data.push({
      timestamp,
      open,
      high: Math.max(high, open, currentPrice),
      low: Math.min(low, open, currentPrice),
      close: currentPrice,
      volume: Math.random() * 1000000,
    });
  }
  
  return data;
}

export function generateMockSignal(assetId: string, timeframe: string): Signal {
  const priceData = generateMockPriceData(
    MOCK_ASSETS.find(asset => asset.id === assetId)?.symbol || 'BTC',
    7
  );
  
  const indicators = calculateTechnicalIndicators(priceData);
  const score = generateSignalScore(indicators);
  const label = getSignalLabel(score);
  
  return {
    id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    assetId,
    timeframe,
    payload: indicators,
    score,
    label,
    createdAt: new Date(),
    explanation: generateSignalExplanation(indicators, score),
  };
}

function generateSignalExplanation(indicators: TechnicalIndicators, score: number): string {
  const reasons: string[] = [];
  
  if (indicators.rsi14 < 30) {
    reasons.push('RSI indicates oversold conditions');
  } else if (indicators.rsi14 > 70) {
    reasons.push('RSI indicates overbought conditions');
  }
  
  if (indicators.ema12 > indicators.ema26) {
    reasons.push('EMA 12/26 crossover shows bullish momentum');
  } else if (indicators.ema12 < indicators.ema26) {
    reasons.push('EMA 12/26 crossover shows bearish momentum');
  }
  
  if (indicators.sma20 > indicators.sma50) {
    reasons.push('Price trading above short-term moving averages');
  } else if (indicators.sma20 < indicators.sma50) {
    reasons.push('Price trading below short-term moving averages');
  }
  
  if (indicators.macd > indicators.macdSignal) {
    reasons.push('MACD shows positive momentum');
  } else if (indicators.macd < indicators.macdSignal) {
    reasons.push('MACD shows negative momentum');
  }
  
  if (reasons.length === 0) {
    reasons.push('Mixed signals, waiting for clearer direction');
  }
  
  return reasons.join('. ') + '.';
}

export function generateMockSignals(): Signal[] {
  const signals: Signal[] = [];
  const timeframes = ['1h', '4h', '1d'];
  
  MOCK_ASSETS.forEach(asset => {
    timeframes.forEach(timeframe => {
      if (Math.random() > 0.7) { // 30% chance of signal for each asset/timeframe
        signals.push(generateMockSignal(asset.id, timeframe));
      }
    });
  });
  
  return signals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Simulate real-time price updates
export function simulatePriceUpdate(): { symbol: string; price: number; change: number } {
  const asset = MOCK_ASSETS[Math.floor(Math.random() * MOCK_ASSETS.length)];
  const changePercent = (Math.random() - 0.5) * 0.5; // -0.25% to +0.25%
  const newPrice = asset.price * (1 + changePercent / 100);
  const newChange = asset.change24h + changePercent;
  
  return {
    symbol: asset.symbol,
    price: newPrice,
    change: newChange,
  };
}

// Mock API functions
export async function fetchAssets(): Promise<Asset[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_ASSETS;
}

export async function fetchPriceData(symbol: string, timeframe: string = '1h', limit: number = 100): Promise<PriceData[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  let days = 1;
  switch (timeframe) {
    case '1m':
    case '5m':
    case '15m':
      days = 1;
      break;
    case '1h':
    case '4h':
      days = 7;
      break;
    case '1d':
      days = 30;
      break;
  }
  
  return generateMockPriceData(symbol, days).slice(-limit);
}

export async function fetchSignals(assetId?: string): Promise<Signal[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const signals = generateMockSignals();
  return assetId ? signals.filter(signal => signal.assetId === assetId) : signals;
}