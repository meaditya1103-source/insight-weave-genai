
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, AlertTriangle, Hash } from 'lucide-react';

interface StatisticalAnalysisProps {
  analysis: any;
  visualizations: any;
}

export const StatisticalAnalysis = ({ analysis, visualizations }: StatisticalAnalysisProps) => {
  const numericVariables = Object.entries(analysis).filter(([_, varAnalysis]: [string, any]) => 
    varAnalysis.type === 'numeric');
  const categoricalVariables = Object.entries(analysis).filter(([_, varAnalysis]: [string, any]) => 
    varAnalysis.type === 'categorical');

  const getSkewnessLabel = (skewness: number) => {
    if (Math.abs(skewness) < 0.5) return { label: 'Normal', color: 'default' };
    if (Math.abs(skewness) < 1) return { label: 'Moderate', color: 'secondary' };
    return { label: 'High', color: 'destructive' };
  };

  const getCompletenessColor = (missing: number, total: number) => {
    const completeness = ((total - missing) / total) * 100;
    if (completeness >= 95) return 'bg-green-500';
    if (completeness >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Numeric Variables Analysis */}
      {numericVariables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Numeric Variables Analysis ({numericVariables.length})
            </CardTitle>
            <CardDescription>Five-number summary and distribution characteristics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {numericVariables.map(([varName, varAnalysis]: [string, any]) => {
                const skewnessInfo = getSkewnessLabel(varAnalysis.skewness);
                const visualization = visualizations[varName];
                
                return (
                  <div key={varName} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{varName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">Numeric</Badge>
                          <Badge variant={skewnessInfo.color as any}>
                            {skewnessInfo.label} Skew
                          </Badge>
                          <Badge variant="secondary">
                            n = {varAnalysis.count.toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Completeness</div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getCompletenessColor(varAnalysis.missing, varAnalysis.count + varAnalysis.missing)}`} />
                          <span className="font-medium">
                            {(((varAnalysis.count) / (varAnalysis.count + varAnalysis.missing)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Min</div>
                        <div className="font-semibold">{varAnalysis.min.toFixed(2)}</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Q1</div>
                        <div className="font-semibold">{varAnalysis.q1.toFixed(2)}</div>
                      </div>
                      <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="text-sm text-muted-foreground">Median</div>
                        <div className="font-semibold text-primary">{varAnalysis.median.toFixed(2)}</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Q3</div>
                        <div className="font-semibold">{varAnalysis.q3.toFixed(2)}</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Max</div>
                        <div className="font-semibold">{varAnalysis.max.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Mean</div>
                        <div className="font-medium">{varAnalysis.mean.toFixed(3)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Std Dev</div>
                        <div className="font-medium">{varAnalysis.std.toFixed(3)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Skewness</div>
                        <div className="font-medium">{varAnalysis.skewness.toFixed(3)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Kurtosis</div>
                        <div className="font-medium">{varAnalysis.kurtosis.toFixed(3)}</div>
                      </div>
                    </div>

                    {/* Simple ASCII histogram */}
                    {visualization && (
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-2">Distribution</div>
                        <div className="space-y-1">
                          {visualization.data.slice(0, 10).map((bin: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <div className="w-20 text-right">{bin.bin}</div>
                              <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                <div 
                                  className="h-full bg-primary transition-all"
                                  style={{ 
                                    width: `${(bin.count / Math.max(...visualization.data.map((b: any) => b.count))) * 100}%` 
                                  }}
                                />
                              </div>
                              <div className="w-8 text-left">{bin.count}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categorical Variables Analysis */}
      {categoricalVariables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Categorical Variables Analysis ({categoricalVariables.length})
            </CardTitle>
            <CardDescription>Frequency distributions and unique value counts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {categoricalVariables.map(([varName, varAnalysis]: [string, any]) => {
                const visualization = visualizations[varName];
                const isIdentifier = varAnalysis.unique / varAnalysis.count > 0.9;
                
                return (
                  <div key={varName} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{varName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">Categorical</Badge>
                          {isIdentifier && (
                            <Badge variant="outline" className="border-orange-300 text-orange-700">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Potential ID
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            n = {varAnalysis.count.toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Completeness</div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getCompletenessColor(varAnalysis.missing, varAnalysis.count + varAnalysis.missing)}`} />
                          <span className="font-medium">
                            {(((varAnalysis.count) / (varAnalysis.count + varAnalysis.missing)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="text-sm text-muted-foreground">Unique Values</div>
                        <div className="font-semibold text-primary">{varAnalysis.unique.toLocaleString()}</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Mode</div>
                        <div className="font-semibold">{varAnalysis.mode || 'N/A'}</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Mode Frequency</div>
                        <div className="font-semibold">{varAnalysis.modeCount.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Top values visualization */}
                    {visualization && !isIdentifier && (
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-2">Top Categories</div>
                        <div className="space-y-2">
                          {visualization.data.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-32 text-sm truncate">{item.label}</div>
                              <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                                <div 
                                  className="h-full bg-secondary transition-all"
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                              <div className="text-sm w-16 text-right">
                                {item.count} ({item.percentage}%)
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isIdentifier && (
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2 text-orange-700">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            This variable appears to be an identifier (90%+ unique values). 
                            Consider excluding from statistical analysis.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
