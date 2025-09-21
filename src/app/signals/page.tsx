'use client';

import { useState, useEffect } from 'react';
import { Signal, Recommendation } from '@/types/crypto';
import { SignalsDisplay } from '@/components/signals/SignalsDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCryptoStore } from '@/store/crypto';
import { fetchSignals, generateMockSignal } from '@/lib/crypto/mockData';
import { getRecommendation } from '@/lib/crypto/utils';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  Zap
} from 'lucide-react';

export default function SignalsPage() {
  const { setLoading, setError } = useCryptoStore();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSignals();
  }, []);

  const loadSignals = async () => {
    try {
      setIsLoading(true);
      const data = await fetchSignals();
      setSignals(data);
      
      // Generate recommendations from signals
      const recs = data.map(signal => {
        const recommendation = getRecommendation(signal.score, signal.payload);
        return {
          id: `rec_${signal.id}`,
          userId: 'demo_user',
          signalId: signal.id,
          action: recommendation.action,
          confidence: recommendation.confidence,
          rationale: recommendation.rationale.join('. '),
          createdAt: signal.createdAt,
        };
      });
      setRecommendations(recs);
      
    } catch (error) {
      setError('Failed to load signals');
      console.error('Error loading signals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSignals = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate new signals for all assets
      const newSignals: Signal[] = [];
      const assetIds = ['1', '2', '3', '4', '5']; // Mock asset IDs
      const timeframes = ['1h', '4h', '1d'];
      
      for (const assetId of assetIds) {
        for (const timeframe of timeframes) {
          if (Math.random() > 0.5) { // 50% chance for each asset/timeframe
            const signal = generateMockSignal(assetId, timeframe);
            newSignals.push(signal);
          }
        }
      }
      
      setSignals(newSignals);
      
      // Generate new recommendations
      const newRecommendations = newSignals.map(signal => {
        const recommendation = getRecommendation(signal.score, signal.payload);
        return {
          id: `rec_${signal.id}`,
          userId: 'demo_user',
          signalId: signal.id,
          action: recommendation.action,
          confidence: recommendation.confidence,
          rationale: recommendation.rationale.join('. '),
          createdAt: signal.createdAt,
        };
      });
      setRecommendations(newRecommendations);
      
    } catch (error) {
      setError('Failed to generate signals');
      console.error('Error generating signals:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate statistics
  const bullishSignals = signals.filter(s => s.label === 'bullish').length;
  const bearishSignals = signals.filter(s => s.label === 'bearish').length;
  const neutralSignals = signals.filter(s => s.label === 'neutral').length;
  
  const buyRecommendations = recommendations.filter(r => r.action === 'buy' || r.action === 'accumulate').length;
  const sellRecommendations = recommendations.filter(r => r.action === 'sell' || r.action === 'take_profit').length;
  const holdRecommendations = recommendations.filter(r => r.action === 'hold').length;

  const avgConfidence = recommendations.length > 0 
    ? recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Trading Signals</h1>
              <p className="text-muted-foreground">
                Advanced AI-powered trading signals and recommendations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Brain className="w-4 h-4" />
                <span>AI-Powered Analysis</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadSignals}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Signals</p>
                  <p className="text-2xl font-bold">{signals.length}</p>
                </div>
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bullish Signals</p>
                  <p className="text-2xl font-bold text-green-600">{bullishSignals}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bearish Signals</p>
                  <p className="text-2xl font-bold text-red-600">{bearishSignals}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Confidence</p>
                  <p className="text-2xl font-bold">
                    {avgConfidence > 0 ? (avgConfidence * 100).toFixed(1) + '%' : 'N/A'}
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signal Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Signal Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mb-2">
                  <div className="text-3xl font-bold text-green-600">{bullishSignals}</div>
                  <div className="text-sm text-muted-foreground">Bullish</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: signals.length > 0 ? (bullishSignals / signals.length) * 100 : 0 + '%' }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="mb-2">
                  <div className="text-3xl font-bold text-gray-600">{neutralSignals}</div>
                  <div className="text-sm text-muted-foreground">Neutral</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-600 h-2 rounded-full" 
                    style={{ width: signals.length > 0 ? (neutralSignals / signals.length) * 100 : 0 + '%' }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="mb-2">
                  <div className="text-3xl font-bold text-red-600">{bearishSignals}</div>
                  <div className="text-sm text-muted-foreground">Bearish</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: signals.length > 0 ? (bearishSignals / signals.length) * 100 : 0 + '%' }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              AI Recommendations Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">{buyRecommendations}</div>
                <div className="text-sm text-green-700">Buy/Accumulate</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">{holdRecommendations}</div>
                <div className="text-sm text-blue-700">Hold</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-1">{sellRecommendations}</div>
                <div className="text-sm text-red-700">Sell/Take Profit</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Signals Display */}
        <SignalsDisplay
          signals={signals}
          recommendations={recommendations}
          onGenerateSignals={handleGenerateSignals}
          isGenerating={isGenerating}
        />

        {/* AI Information */}
        <Card className="mt-8 border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">How AI Signals Work</h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Our AI analyzes multiple technical indicators including RSI, MACD, and moving averages</li>
                  <li>• Signals are generated using advanced pattern recognition algorithms</li>
                  <li>• Each signal includes a confidence score based on indicator alignment</li>
                  <li>• Recommendations are tailored to different market conditions and timeframes</li>
                  <li>• All signals are for educational purposes and not financial advice</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Warning */}
        <Card className="mt-8 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Important Risk Warning</h3>
                <p className="text-sm text-yellow-700">
                  Trading signals and recommendations are generated by AI algorithms for educational purposes only. 
                  They do not constitute financial advice. Always do your own research, consider your risk tolerance, 
                  and consult with a qualified financial advisor before making investment decisions. 
                  Past performance is not indicative of future results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}