'use client';

import { useEffect } from 'react';
import { EnrichedAsset } from '@/types/crypto';
import { CryptoCard } from '@/components/crypto/CryptoCard';
import { useCryptoStore } from '@/store/crypto';
import { fetchAssets } from '@/lib/crypto/mockData';

export function MarketOverview() {
  const { assets, setAssets, setLoading, setError } = useCryptoStore();

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        const data = await fetchAssets();
        setAssets(data);
      } catch (error) {
        setError('Failed to load assets');
        console.error('Error loading assets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, [setAssets, setLoading, setError]);

  if (assets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No assets available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Market Overview</h2>
        <p className="text-muted-foreground">
          Real-time market prices and data across multiple asset classes
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {assets.map((asset) => (
          <CryptoCard
            key={asset.id}
            asset={asset}
          />
        ))}
      </div>
    </div>
  );
}