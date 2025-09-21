export interface Asset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
}

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi14: number;
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  macd: number;
  macdSignal: number;
  bollingerUpper?: number;
  bollingerLower?: number;
}

export interface Signal {
  id: string;
  assetId: string;
  timeframe: string;
  payload: TechnicalIndicators;
  score: number;
  label: 'bullish' | 'bearish' | 'neutral';
  createdAt: Date;
  explanation?: string;
}

export interface Recommendation {
  id: string;
  userId: string;
  signalId: string;
  action: 'buy' | 'sell' | 'hold' | 'take_profit' | 'accumulate';
  confidence: number;
  rationale: string;
  createdAt: Date;
}

export interface Position {
  id: string;
  assetId: string;
  qty: number;
  avgCost: number;
  currentPrice?: number;
  pnl?: number;
  source: 'manual' | 'api';
  createdAt: Date;
}

export interface AlertRule {
  id: string;
  assetId: string;
  type: 'price_change' | 'rsi_threshold' | 'sma_crossover' | 'volume_spike';
  operator: 'above' | 'below' | 'crosses';
  threshold: number;
  timeframe: string;
  channel: 'in_app' | 'email' | 'telegram' | 'webhook';
  isActive: boolean;
  lastFiredAt?: Date;
}

export interface PortfolioSummary {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  positions: Position[];
}

export interface MarketData {
  tickers: Asset[];
  candles: Record<string, PriceData[]>;
  signals: Signal[];
}

export interface TimeFrame {
  value: string;
  label: string;
}

export const TIME_FRAMES: TimeFrame[] = [
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1d', label: '1 Day' },
];