'use client';

import { Signal, Recommendation } from '@/types/crypto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPercent } from '@/lib/crypto/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Lightbulb,
  Activity
} from 'lucide-react';

interface SignalsDisplayProps {
  signals: Signal[];
  recommendations: Recommendation[];
  onGenerateSignals?: () => void;
  isGenerating?: boolean;
}

export function SignalsDisplay({ 
  signals, 
  recommendations, 
  onGenerateSignals, 
  isGenerating = false 
}: SignalsDisplayProps) {
  const getSignalIcon = (label: string) => {
    switch (label) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'buy':
      case 'accumulate':
        return <TrendingUp className="w-4 h-4" />;
      case 'sell':
      case 'take_profit':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy':
      case 'accumulate':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'sell':
      case 'take_profit':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Trading Signals & Recommendations
            </div>
            <Button 
              onClick={onGenerateSignals}
              disabled={isGenerating}
            >
              <Brain className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-pulse' : ''}`} />
              {isGenerating ? 'Generating...' : 'Generate New Signals'}
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="signals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signals" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Trading Signals
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            AI Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Latest Trading Signals ({signals.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {signals.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No signals available</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate new signals to get started
                    </p>
                  </div>
                ) : (
                  signals.map((signal) => (
                    <div
                      key={signal.id}
                      className={`p-4 rounded-lg border ${getSignalColor(signal.label)}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getSignalIcon(signal.label)}
                          <div>
                            <h3 className="font-semibold capitalize">{signal.label} Signal</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {signal.timeframe}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Asset ID: {signal.assetId}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Confidence</div>
                          <div className={`text-lg font-bold ${getConfidenceColor(signal.score)}`}>
                            {formatPercent(signal.score * 100)}
                          </div>
                        </div>
                      </div>

                      {/* Technical Indicators */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="text-center p-2 bg-white/50 rounded">
                          <div className="text-xs text-muted-foreground">RSI</div>
                          <div className="font-semibold">{signal.payload.rsi14.toFixed(1)}</div>
                        </div>
                        <div className="text-center p-2 bg-white/50 rounded">
                          <div className="text-xs text-muted-foreground">MACD</div>
                          <div className="font-semibold">{signal.payload.macd.toFixed(4)}</div>
                        </div>
                        <div className="text-center p-2 bg-white/50 rounded">
                          <div className="text-xs text-muted-foreground">SMA 20</div>
                          <div className="font-semibold">${signal.payload.sma20.toFixed(2)}</div>
                        </div>
                        <div className="text-center p-2 bg-white/50 rounded">
                          <div className="text-xs text-muted-foreground">SMA 50</div>
                          <div className="font-semibold">${signal.payload.sma50.toFixed(2)}</div>
                        </div>
                      </div>

                      {/* Signal Strength */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Signal Strength</span>
                          <span className={getConfidenceColor(signal.score)}>
                            {formatPercent(signal.score * 100)}
                          </span>
                        </div>
                        <Progress value={signal.score * 100} className="h-2" />
                      </div>

                      {/* Explanation */}
                      {signal.explanation && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-sm">Analysis</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {signal.explanation}
                          </p>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Generated {signal.createdAt.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                AI Recommendations ({recommendations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No recommendations available</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate signals to get AI-powered recommendations
                    </p>
                  </div>
                ) : (
                  recommendations.map((recommendation) => (
                    <div
                      key={recommendation.id}
                      className={`p-4 rounded-lg border ${getActionColor(recommendation.action)}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getActionIcon(recommendation.action)}
                          <div>
                            <h3 className="font-semibold capitalize">
                              {recommendation.action.replace('_', ' ')}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Signal ID: {recommendation.signalId}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Confidence</div>
                          <div className={`text-lg font-bold ${getConfidenceColor(recommendation.confidence)}`}>
                            {formatPercent(recommendation.confidence * 100)}
                          </div>
                        </div>
                      </div>

                      {/* Confidence Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Recommendation Strength</span>
                          <span className={getConfidenceColor(recommendation.confidence)}>
                            {formatPercent(recommendation.confidence * 100)}
                          </span>
                        </div>
                        <Progress value={recommendation.confidence * 100} className="h-2" />
                      </div>

                      {/* Rationale */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4" />
                          <span className="font-medium text-sm">AI Rationale</span>
                        </div>
                        <div className="text-sm text-muted-foreground bg-white/50 p-3 rounded">
                          {typeof recommendation.rationale === 'string' 
                            ? recommendation.rationale 
                            : JSON.stringify(recommendation.rationale)
                          }
                        </div>
                      </div>

                      {/* Risk Assessment */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="text-center p-2 bg-white/50 rounded">
                          <div className="text-xs text-muted-foreground">Risk Level</div>
                          <div className="font-semibold">
                            {recommendation.confidence > 0.8 ? 'Low' : 
                             recommendation.confidence > 0.6 ? 'Medium' : 'High'}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-white/50 rounded">
                          <div className="text-xs text-muted-foreground">Time Horizon</div>
                          <div className="font-semibold">
                            {recommendation.action.includes('profit') ? 'Short' : 'Medium'}
                          </div>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Generated {recommendation.createdAt.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}