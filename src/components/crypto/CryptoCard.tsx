'use client';

import { Asset } from '@/types/crypto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatPercent, formatLargeNumber } from '@/lib/crypto/utils';
import Link from 'next/link';

interface CryptoCardProps {
  asset: Asset;
}

export function CryptoCard({ asset }: CryptoCardProps) {
  const isPositive = asset.change24h > 0;
  const isNegative = asset.change24h < 0;
  
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const trendColor = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600';
  
  return (
    <Link href={`/asset/${asset.symbol}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">{asset.symbol}</CardTitle>
              <p className="text-sm text-muted-foreground">{asset.name}</p>
            </div>
            <Badge variant={isPositive ? 'default' : isNegative ? 'destructive' : 'secondary'}>
              <TrendIcon className="w-3 h-3 mr-1" />
              {formatPercent(asset.change24h)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {formatCurrency(asset.price)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Volume 24h</p>
                <p className="font-medium">{formatLargeNumber(asset.volume24h)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Market Cap</p>
                <p className="font-medium">{formatLargeNumber(asset.marketCap)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendIcon className={`w-3 h-3 ${trendColor}`} />
              <span className={trendColor}>
                {isPositive ? 'Up' : isNegative ? 'Down' : 'Neutral'} {formatPercent(Math.abs(asset.change24h))} today
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}