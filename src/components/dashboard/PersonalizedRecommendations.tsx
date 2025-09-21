"use client"

import { useSession } from "next-auth/react"
import { useUserStore } from "@/store/user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, AlertTriangle, Target, Lightbulb } from "lucide-react"
import Link from "next/link"

interface PersonalizedRecommendationsProps {
  className?: string
}

export function PersonalizedRecommendations({ className }: PersonalizedRecommendationsProps) {
  const { data: session } = useSession()
  const { positions, recommendations, alerts } = useUserStore()

  if (!session) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Personalized Tips
          </CardTitle>
          <CardDescription>
            Sign in to get personalized trading recommendations based on your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Create an account to receive AI-powered trading signals tailored to your investments
            </p>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Generate personalized tips based on user's portfolio
  const generatePersonalizedTips = () => {
    const tips: Array<{
      type: string;
      title: string;
      description: string;
      icon: any;
      action: string;
    }> = [];
    
    if (positions.length === 0) {
      tips.push({
        type: "info",
        title: "Start Your Portfolio",
        description: "Add your first asset position to receive personalized recommendations",
        icon: Target,
        action: "Add Position"
      })
    } else {
      // Portfolio diversification tip
      const uniqueAssets = new Set(positions.map(p => p.assetId)).size
      if (uniqueAssets < 3) {
        tips.push({
          type: "warning",
          title: "Diversify Your Portfolio",
          description: "Consider adding more assets to reduce risk",
          icon: AlertTriangle,
          action: "Explore Assets"
        })
      }

      // Alert setup tip
      if (alerts.length === 0) {
        tips.push({
          type: "info",
          title: "Set Up Price Alerts",
          description: "Get notified when your assets reach important price levels",
          icon: AlertTriangle,
          action: "Create Alerts"
        })
      }

      // Recent recommendations
      const recentRecommendations = recommendations.slice(0, 3)
      if (recentRecommendations.length > 0) {
        recentRecommendations.forEach(rec => {
          const action = rec.action.toLowerCase()
          tips.push({
            type: action === "buy" ? "success" : action === "sell" ? "danger" : "info",
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Signal`,
            description: `${rec.confidence * 100}% confidence to ${action}`,
            icon: action === "buy" ? TrendingUp : action === "sell" ? TrendingDown : Target,
            action: "View Details"
          })
        })
      }
    }

    return tips
  }

  const tips = generatePersonalizedTips()

  const getTipColor = (type: string) => {
    switch (type) {
      case "success": return "bg-green-50 border-green-200"
      case "warning": return "bg-yellow-50 border-yellow-200"
      case "danger": return "bg-red-50 border-red-200"
      default: return "bg-blue-50 border-blue-200"
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "success": return "bg-green-100 text-green-800"
      case "warning": return "bg-yellow-100 text-yellow-800"
      case "danger": return "bg-red-100 text-red-800"
      default: return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Personalized Tips
        </CardTitle>
        <CardDescription>
          AI-powered recommendations based on your portfolio and market analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tips.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No personalized tips available at the moment. Check back later for new recommendations.
            </p>
          </div>
        ) : (
          tips.map((tip, index) => {
            const Icon = tip.icon
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getTipColor(tip.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{tip.title}</h4>
                        <Badge variant="secondary" className={getBadgeColor(tip.type)}>
                          {tip.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {tip.action}
                  </Button>
                </div>
              </div>
            )
          })
        )}
        
        {positions.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm mb-1">Portfolio Summary</h4>
                <p className="text-xs text-muted-foreground">
                  {positions.length} position{positions.length !== 1 ? 's' : ''} • {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Link href="/portfolio">
                <Button variant="outline" size="sm">
                  View Portfolio
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}