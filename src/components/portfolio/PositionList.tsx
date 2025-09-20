'use client';

import { Position } from '@/types/crypto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatPercent } from '@/lib/crypto/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Edit, 
  Trash2,
  DollarSign,
  PieChart
} from 'lucide-react';

interface PositionListProps {
  positions: Position[];
  onAddPosition?: () => void;
  onEditPosition?: (position: Position) => void;
  onDeletePosition?: (positionId: string) => void;
}

export function PositionList({ 
  positions, 
  onAddPosition, 
  onEditPosition, 
  onDeletePosition 
}: PositionListProps) {
  const totalValue = positions.reduce((sum, position) => {
    return sum + (position.qty * (position.currentPrice || position.avgCost));
  }, 0);

  const totalPnl = positions.reduce((sum, position) => {
    return sum + (position.pnl || 0);
  }, 0);

  const totalPnlPercent = totalValue > 0 ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Portfolio Positions
            </div>
            <Button onClick={onAddPosition} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Position
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No positions yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your portfolio by adding your first position
            </p>
            <Button onClick={onAddPosition}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Position
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Portfolio Positions
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Total Value: </span>
                <span className="font-semibold">{formatCurrency(totalValue)}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Total P&L: </span>
                <span className={`font-semibold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalPnl)} ({formatPercent(totalPnlPercent)})
                </span>
              </div>
            </div>
          </div>
          <Button onClick={onAddPosition} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Position
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Avg Cost</TableHead>
              <TableHead className="text-right">Current Price</TableHead>
              <TableHead className="text-right">Market Value</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead className="text-right">P&L %</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map((position) => {
              const marketValue = position.qty * (position.currentPrice || position.avgCost);
              const pnl = marketValue - (position.qty * position.avgCost);
              const pnlPercent = ((position.currentPrice || position.avgCost) - position.avgCost) / position.avgCost * 100;
              const isPositive = pnl >= 0;

              return (
                <TableRow key={position.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{position.assetId}</span>
                      <Badge variant="outline" className="text-xs">
                        {position.source}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {position.qty.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(position.avgCost)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(position.currentPrice || position.avgCost)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(marketValue)}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    <div className="flex items-center justify-end gap-1">
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {formatCurrency(pnl)}
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(pnlPercent)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditPosition?.(position)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeletePosition?.(position.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}