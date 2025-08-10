import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Database, TrendingUp, AlertTriangle, Target } from 'lucide-react';

interface DataPreviewProps {
  data: {
    fileName: string;
    totalRows: number;
    totalColumns: number;
    missingValues: number;
    variables: Array<{
      name: string;
      type: string;
      missing: number;
      uniqueValues?: number;
      mean?: number;
      min?: number;
      max?: number;
    }>;
    sampleData: Array<any>;
  };
}

export const DataPreview = ({ data }: DataPreviewProps) => {
  const [analysisGoal, setAnalysisGoal] = useState<string>('');
  
  const missingPercentage = (data.missingValues / (data.totalRows * data.totalColumns)) * 100;
  const dataQuality = missingPercentage < 5 ? 'Excellent' : missingPercentage < 15 ? 'Good' : 'Needs Attention';

  const analysisGoals = [
    { value: 'customer_satisfaction', label: 'Customer Satisfaction Analysis' },
    { value: 'market_research', label: 'Market Research Insights' },
    { value: 'employee_feedback', label: 'Employee Feedback Analysis' },
    { value: 'product_feedback', label: 'Product Feedback Analysis' },
    { value: 'brand_perception', label: 'Brand Perception Study' },
    { value: 'demographic_analysis', label: 'Demographic Analysis' },
    { value: 'behavioral_patterns', label: 'Behavioral Pattern Analysis' },
    { value: 'general', label: 'General Statistical Analysis' }
  ];

  return (
    <div className="space-y-6">
      {/* Analysis Goal Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Analysis Goal
          </CardTitle>
          <CardDescription>Select your primary analysis objective for customized insights</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={analysisGoal} onValueChange={setAnalysisGoal}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose your analysis goal (optional)" />
            </SelectTrigger>
            <SelectContent>
              {analysisGoals.map((goal) => (
                <SelectItem key={goal.value} value={goal.value}>
                  {goal.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {analysisGoal && (
            <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              Based on your goal, the analysis will focus on relevant visualizations and statistical tests.
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Sample Data */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Data (First 10 Records)</CardTitle>
          <CardDescription>Preview of your actual survey data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {Object.keys(data.sampleData[0] || {}).map((header, index) => (
                    <th key={index} className="text-left p-2 font-medium">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.sampleData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b hover:bg-muted/30">
                    {Object.values(row).map((value: any, colIndex) => (
                      <td key={colIndex} className="p-2">{value || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Statistical Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Statistical Analysis
          </CardTitle>
          <CardDescription>Detailed breakdown and statistics for each variable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.variables.map((variable, index) => {
              const completeness = ((data.totalRows - variable.missing) / data.totalRows) * 100;
              const status = completeness >= 95 ? 'Complete' : completeness >= 80 ? 'Good' : 'Attention';
              
              return (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-lg">{variable.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={variable.type === 'numeric' ? 'default' : 'secondary'}>
                          {variable.type}
                        </Badge>
                        <Badge 
                          variant={status === 'Complete' ? 'default' : status === 'Good' ? 'secondary' : 'destructive'}
                        >
                          {status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Completeness</div>
                      <div className="text-lg font-semibold">{completeness.toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Missing Values</div>
                      <div className="font-medium">{variable.missing.toLocaleString()}</div>
                    </div>
                    {variable.type === 'numeric' ? (
                      <>
                        <div>
                          <div className="text-muted-foreground">Mean</div>
                          <div className="font-medium">{variable.mean?.toFixed(2) || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Min</div>
                          <div className="font-medium">{variable.min?.toFixed(2) || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Max</div>
                          <div className="font-medium">{variable.max?.toFixed(2) || 'N/A'}</div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <div className="text-muted-foreground">Unique Values</div>
                        <div className="font-medium">{variable.uniqueValues || 'N/A'}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <Progress value={completeness} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
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
              <h4 className="font-medium mb-2">Recommended Visualizations</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Histograms and box plots for numeric variables</li>
                <li>• Bar charts and pie charts for categorical variables</li>
                <li>• Correlation heatmaps for variable relationships</li>
                <li>• Scatter plots for bivariate analysis</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Statistical Tests</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Descriptive statistics for all variables</li>
                <li>• Chi-square tests for categorical associations</li>
                <li>• Correlation analysis for numeric variables</li>
                <li>• Normality tests for distribution assessment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};