import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Database, TrendingUp, AlertTriangle } from 'lucide-react';

interface DataPreviewProps {
  data: {
    fileName: string;
    totalRows: number;
    totalColumns: number;
    missingValues: number;
    variables: Array<{
      name: string;
      type: 'numeric' | 'categorical';
      missing: number;
    }>;
  };
}

export const DataPreview = ({ data }: DataPreviewProps) => {
  const missingPercentage = (data.missingValues / (data.totalRows * data.totalColumns)) * 100;
  const dataQuality = missingPercentage < 5 ? 'Excellent' : missingPercentage < 15 ? 'Good' : 'Needs Attention';
  const qualityColor = missingPercentage < 5 ? 'bg-green-500' : missingPercentage < 15 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-6">
      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Overview
          </CardTitle>
          <CardDescription>Summary of your uploaded survey data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{data.totalRows.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Responses</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{data.totalColumns}</div>
              <div className="text-sm text-muted-foreground">Variables</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{data.missingValues}</div>
              <div className="text-sm text-muted-foreground">Missing Values</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{missingPercentage.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Missing Rate</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Data Quality Score</span>
              <Badge variant={missingPercentage < 5 ? 'default' : missingPercentage < 15 ? 'secondary' : 'destructive'}>
                {dataQuality}
              </Badge>
            </div>
            <Progress value={100 - missingPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">
              Quality based on missing value percentage and data consistency
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Variable Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Variable Analysis
          </CardTitle>
          <CardDescription>Breakdown of variables in your dataset</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variable Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Missing Values</TableHead>
                <TableHead>Completeness</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.variables.map((variable) => {
                const completeness = ((data.totalRows - variable.missing) / data.totalRows) * 100;
                return (
                  <TableRow key={variable.name}>
                    <TableCell className="font-medium">{variable.name}</TableCell>
                    <TableCell>
                      <Badge variant={variable.type === 'numeric' ? 'default' : 'secondary'}>
                        {variable.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{variable.missing}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={completeness} className="h-2 w-16" />
                        <span className="text-xs">{completeness.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {variable.missing === 0 ? (
                        <Badge variant="default" className="bg-green-500">Complete</Badge>
                      ) : variable.missing < data.totalRows * 0.1 ? (
                        <Badge variant="secondary">Good</Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Attention
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Processing Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Processing Recommendations
          </CardTitle>
          <CardDescription>AI-generated suggestions for optimal analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Recommended Imputation Methods</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Mean imputation for numeric variables with &lt;10% missing</li>
                <li>• Mode imputation for categorical variables</li>
                <li>• Multiple imputation for variables with &gt;10% missing</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Statistical Analysis Plan</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Apply post-stratification weights based on demographics</li>
                <li>• Calculate 95% confidence intervals for all estimates</li>
                <li>• Use robust standard errors for variance estimation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};