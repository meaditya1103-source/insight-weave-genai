
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Target, Download, BarChart3 } from 'lucide-react';

interface EstimateGroup {
  group: string;
  estimate: number;
  marginOfError: number;
  confidenceInterval: [number, number];
  sampleSize: number;
  weightedN: number;
}

interface ParameterEstimate {
  estimatingParameter: string;
  baseParameter: string;
  aggregationType: string;
  weightVariable?: string;
  groups: EstimateGroup[];
}

interface EstimatesTableProps {
  estimates: ParameterEstimate[];
  onExportEstimates: () => void;
}

export const EstimatesTable = ({ estimates, onExportEstimates }: EstimatesTableProps) => {
  const formatNumber = (num: number, decimals: number = 2) => {
    if (typeof num !== 'number' || isNaN(num)) return 'N/A';
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const getEstimateUnit = (aggregationType: string, parameterName: string) => {
    switch (aggregationType) {
      case 'Mean':
      case 'Median':
        return parameterName.toLowerCase().includes('percentage') || 
               parameterName.toLowerCase().includes('rate') ? '%' : '';
      case 'Proportion':
        return '%';
      case 'Sum':
        return '';
      case 'Count':
        return ' responses';
      default:
        return '';
    }
  };

  const getConfidenceWidth = (estimate: number, marginOfError: number) => {
    if (estimate === 0) return 0;
    return (marginOfError / estimate) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Parameter Estimates Results
            </CardTitle>
            <CardDescription>
              Weighted statistical estimates with confidence intervals and sample sizes
            </CardDescription>
          </div>
          <Button onClick={onExportEstimates} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {estimates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No parameter estimates generated yet.</p>
            <p className="text-sm">Configure parameters and click "Generate Estimates" to see results.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {estimates.map((estimate, estimateIdx) => (
              <div key={estimateIdx} className="border rounded-lg overflow-hidden">
                <div className="bg-muted/30 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{estimate.estimatingParameter}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default">{estimate.aggregationType}</Badge>
                        {estimate.baseParameter !== 'None' && (
                          <>
                            <span className="text-sm text-muted-foreground">grouped by</span>
                            <Badge variant="secondary">{estimate.baseParameter}</Badge>
                          </>
                        )}
                        {estimate.weightVariable && (
                          <>
                            <span className="text-sm text-muted-foreground">weighted by</span>
                            <Badge variant="outline">{estimate.weightVariable}</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group</TableHead>
                        <TableHead className="text-right">Estimate</TableHead>
                        <TableHead className="text-right">Margin of Error</TableHead>
                        <TableHead className="text-right">95% Confidence Interval</TableHead>
                        <TableHead className="text-right">Sample Size (n)</TableHead>
                        <TableHead className="text-right">Weighted n</TableHead>
                        <TableHead className="text-center">Precision</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estimate.groups.map((group, groupIdx) => {
                        const unit = getEstimateUnit(estimate.aggregationType, estimate.estimatingParameter);
                        const precision = getConfidenceWidth(group.estimate, group.marginOfError);
                        
                        return (
                          <TableRow key={groupIdx}>
                            <TableCell className="font-medium">
                              {group.group}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatNumber(group.estimate)}{unit}
                            </TableCell>
                            <TableCell className="text-right">
                              ±{formatNumber(group.marginOfError)}{unit}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-sm">
                                [{formatNumber(group.confidenceInterval[0])}, {formatNumber(group.confidenceInterval[1])}]{unit}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {group.sampleSize.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNumber(group.weightedN, 0)}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <div className="w-16 bg-muted rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`h-full transition-all ${
                                      precision < 10 ? 'bg-green-500' : 
                                      precision < 25 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(precision, 100)}%` }}
                                  />
                                </div>
                                <Badge 
                                  variant={
                                    precision < 10 ? 'default' : 
                                    precision < 25 ? 'secondary' : 'destructive'
                                  }
                                  className="ml-2 text-xs"
                                >
                                  {precision < 10 ? 'High' : precision < 25 ? 'Medium' : 'Low'}
                                </Badge>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
