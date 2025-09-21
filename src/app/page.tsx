'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { MarketOverview } from '@/components/dashboard/MarketOverview';
import { SignalsOverview } from '@/components/dashboard/SignalsOverview';
import { PersonalizedRecommendations } from '@/components/dashboard/PersonalizedRecommendations';
import { PortfolioSummaryCard } from '@/components/portfolio/PortfolioSummary';
import { useCryptoStore } from '@/store/crypto';
import { useUserData } from '@/hooks/use-user-data';
import { useUserStore } from '@/store/user';
import { simulatePriceUpdate } from '@/lib/crypto/mockData';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/ui/icons';

export default function Home() {
  const { data: session, status } = useSession();
  const { assets, updateAssetPrice } = useCryptoStore();
  const { refreshUserData } = useUserData();
  const { positions } = useUserStore();

  // Calculate portfolio summary from positions
  const calculatePortfolioSummary = (positions: any[]) => {
    if (!positions || positions.length === 0) return null;
    
    const totalValue = positions.reduce((sum, position) => {
      return sum + (position.qty * (position.currentPrice || position.avgCost));
    }, 0);

    const totalCost = positions.reduce((sum, position) => {
      return sum + (position.qty * position.avgCost);
    }, 0);

    const totalPnl = totalValue - totalCost;
    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    return {
      totalValue,
      totalPnl,
      totalPnlPercent,
      positions: positions.map(p => ({
        ...p,
        currentPrice: p.currentPrice || p.avgCost,
        pnl: (p.currentPrice || p.avgCost) - p.avgCost
      }))
    };
  };

  const portfolioSummary = calculatePortfolioSummary(positions);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const update = simulatePriceUpdate();
      updateAssetPrice(update.symbol, update.price, update.change);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [updateAssetPrice]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <h1 className="text-3xl font-bold">MarketLens</h1>
                <p className="text-muted-foreground">
                  Advanced market tracking and trading insights
                </p>
              </div>
              
              {/* Navigation */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Markets</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-6 w-[400px]">
                        <NavigationMenuLink asChild>
                          <Link href="/" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Market Overview</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Real-time market prices and data across multiple asset classes
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <Link href="/signals" legacyBehavior passHref>
                      <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                        Signals
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <Link href="/alerts" legacyBehavior passHref>
                      <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                        Alerts
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <Link href="/portfolio" legacyBehavior passHref>
                      <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                        Portfolio
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Live Market Data
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              
              {status === "loading" ? (
                <Icons.spinner className="h-6 w-6 animate-spin" />
              ) : session ? (
                <>
                  <Link href="/portfolio">
                    <Button variant="outline">View Portfolio</Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                          <AvatarFallback>
                            {session.user?.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {session.user?.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {session.user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/portfolio">Portfolio</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/alerts">Alerts</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/signals">Signals</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()}>
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/signin">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button>Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Market Overview */}
          <div className="lg:col-span-3">
            <MarketOverview />
          </div>
          
          {/* Right Column - Portfolio and Signals */}
          <div className="space-y-6">
            <PortfolioSummaryCard portfolio={portfolioSummary} />
            <PersonalizedRecommendations />
            <SignalsOverview />
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Important Disclaimer
          </h3>
          <p className="text-yellow-700 text-sm">
            This application provides educational signals and market data only. 
            It does not constitute financial advice. Trading financial instruments involves 
            significant risk and you should only trade with money you can afford to lose. 
            Past performance is not indicative of future results.
          </p>
        </div>
      </main>
    </div>
  );
}