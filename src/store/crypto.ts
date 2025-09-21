import { create } from 'zustand';
import { Asset, EnrichedAsset, Signal, Recommendation, PortfolioSummary, Position, AlertRule, PriceData } from '@/types/crypto';

interface CryptoStore {
  // Market data
  assets: EnrichedAsset[];
  selectedAsset: EnrichedAsset | null;
  timeFrame: string;
  priceData: Record<string, PriceData[]>;
  
  // Portfolio
  portfolio: PortfolioSummary | null;
  positions: Position[];
  
  // Signals & Recommendations
  signals: Signal[];
  recommendations: Recommendation[];
  
  // Alerts
  alerts: AlertRule[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAssets: (assets: EnrichedAsset[]) => void;
  setSelectedAsset: (asset: EnrichedAsset | null) => void;
  setTimeFrame: (timeFrame: string) => void;
  setPriceData: (symbol: string, data: PriceData[]) => void;
  setPortfolio: (portfolio: PortfolioSummary) => void;
  setPositions: (positions: Position[]) => void;
  setSignals: (signals: Signal[]) => void;
  setRecommendations: (recommendations: Recommendation[]) => void;
  setAlerts: (alerts: AlertRule[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Update functions
  updateAssetPrice: (symbol: string, price: number, change: number) => void;
  addSignal: (signal: Signal) => void;
  addRecommendation: (recommendation: Recommendation) => void;
  removeAlert: (alertId: string) => void;
  toggleAlert: (alertId: string) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  assets: [],
  selectedAsset: null,
  timeFrame: '1h',
  priceData: {},
  portfolio: null,
  positions: [],
  signals: [],
  recommendations: [],
  alerts: [],
  isLoading: false,
  error: null,
};

export const useCryptoStore = create<CryptoStore>((set, get) => ({
  ...initialState,
  
  // Setters
  setAssets: (assets) => set({ assets }),
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
  setTimeFrame: (timeFrame) => set({ timeFrame }),
  setPriceData: (symbol, data) => 
    set((state) => ({ priceData: { ...state.priceData, [symbol]: data } })),
  setPortfolio: (portfolio) => set({ portfolio }),
  setPositions: (positions) => set({ positions }),
  setSignals: (signals) => set({ signals }),
  setRecommendations: (recommendations) => set({ recommendations }),
  setAlerts: (alerts) => set({ alerts }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Update functions
  updateAssetPrice: (symbol, price, change) =>
    set((state) => ({
      assets: state.assets.map((asset) =>
        asset.symbol === symbol
          ? { ...asset, price, change24h: change }
          : asset
      ),
    })),
    
  addSignal: (signal) =>
    set((state) => ({
      signals: [signal, ...state.signals].slice(0, 100), // Keep last 100 signals
    })),
    
  addRecommendation: (recommendation) =>
    set((state) => ({
      recommendations: [recommendation, ...state.recommendations].slice(0, 50),
    })),
    
  removeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== alertId),
    })),
    
  toggleAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId
          ? { ...alert, isActive: !alert.isActive }
          : alert
      ),
    })),
    
  // Reset
  reset: () => set(initialState),
}));