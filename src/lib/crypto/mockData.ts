import { Asset, EnrichedAsset, PriceData, Signal, TechnicalIndicators } from '@/types/crypto';
import { calculateTechnicalIndicators, generateSignalScore, getSignalLabel } from './utils';
import axios from 'axios';

export function generateMockPriceData(basePrice: number, days: number = 30): PriceData[] {
  const data: PriceData[] = [];
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

export async function generateMockSignal(assetId: string, assetSymbol: string, timeframe: string): Promise<Signal> {
  const priceData = generateMockPriceData(
    // Need a base price here. For now, just use a random one.
    Math.random() * 1000 + 100,
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

export async function generateMockSignals(): Promise<Signal[]> {
  const signals: Signal[] = [];
  const timeframes = ['1h', '4h', '1d'];

  const assets = await fetchAssets(); // Fetch assets from the API

  for (const asset of assets) {
    for (const timeframe of timeframes) {
      if (Math.random() > 0.7) { // 30% chance of signal for each asset/timeframe
        signals.push(await generateMockSignal(asset.id, asset.symbol, timeframe));
      }
    }
  }
  
  return signals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// Simulate real-time price updates
export async function simulatePriceUpdate(): Promise<{ symbol: string; price: number; change: number }> {
  const assets = await fetchAssets(); // Fetch assets from the API
  const asset = assets[Math.floor(Math.random() * assets.length)];
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
export async function fetchAssets(): Promise<EnrichedAsset[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const response = await axios.get<Asset[]>('/api/asset');
  const basicAssets = response.data;

  // Enrich assets with mock price data
  const enrichedAssets: EnrichedAsset[] = basicAssets.map(asset => {
    const basePrice = Math.random() * 1000 + 100; // Generate a random base price
    const change24h = (Math.random() - 0.5) * 10; // Random change
    const volume24h = Math.random() * 10000000000; // Random volume
    const marketCap = Math.random() * 1000000000000; // Random market cap
    const lastUpdated = new Date();

    return {
      ...asset,
      price: basePrice,
      change24h,
      volume24h,
      marketCap,
      lastUpdated,
    };
  });

  return enrichedAssets;
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
  
  // Need to get the base price for the symbol. For now, just use a random one.
  const basePrice = Math.random() * 1000 + 100;
  return generateMockPriceData(basePrice, days).slice(-limit);
}

export async function fetchSignals(assetId?: string): Promise<Signal[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 150));
  
  const signals = await generateMockSignals();
  return assetId ? signals.filter(signal => signal.assetId === assetId) : signals;
}