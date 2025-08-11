
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Database, Target, Zap, ArrowRight } from 'lucide-react';

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
  onStartAnalysis: (goal?: string) => void;
}

export const DataPreview = ({ data, onStartAnalysis }: DataPreviewProps) => {
  const [analysisGoal, setAnalysisGoal] = useState<string>('');
  
  const missingPercentage = (data.missingValues / (data.totalRows * data.totalColumns)) * 100;
  const dataQuality = missingPercentage < 5 ? 'Excellent' : missingPercentage < 15 ? 'Good' : 'Needs Attention';

  const handleStartAnalysis = () => {
    onStartAnalysis(analysisGoal);
  };

  return (
    <div className="space-y-6">
      {/* Analysis Goal Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Target className="h-5 w-5" />
            AI Analysis Goal (Optional)
          </CardTitle>
          <CardDescription className="text-purple-600">
            Describe your analysis objective for AI-powered customized insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={analysisGoal}
            onChange={(e) => setAnalysisGoal(e.target.value)}
            placeholder="Example: Analyze customer satisfaction trends by demographics and identify key drivers of satisfaction scores. Focus on relationships between satisfaction ratings and customer characteristics like age, income, and purchase history..."
            className="min-h-[120px] resize-none border-purple-200 focus:border-purple-400"
          />
          {analysisGoal && (
            <div className="mt-3 p-4 bg-white/50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="text-sm text-purple-700">
                  <div className="font-medium mb-1">AI Analysis Focus:</div>
                  The system will tailor statistical tests, visualizations, parameter estimations, and insights based on your specific goal using advanced machine learning algorithms to analyze patterns and relationships most relevant to your objective.
                </div>
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleStartAnalysis}
            size="lg"
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <ArrowRight className="h-5 w-5 mr-2" />
            Start AI-Powered Analysis
          </Button>
        </CardContent>
      </Card>

      {/* Data Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-white border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Database className="h-5 w-5" />
            Data Overview
          </CardTitle>
          <CardDescription className="text-blue-600">Summary of your uploaded survey data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-blue-200 rounded-lg bg-white/50">
              <div className="text-3xl font-bold text-blue-600">{data.totalRows.toLocaleString()}</div>
              <div className="text-sm text-blue-500">Total Responses</div>
            </div>
            <div className="text-center p-4 border border-blue-200 rounded-lg bg-white/50">
              <div className="text-3xl font-bold text-blue-600">{data.totalColumns}</div>
              <div className="text-sm text-blue-500">Variables</div>
            </div>
            <div className="text-center p-4 border border-blue-200 rounded-lg bg-white/50">
              <div className="text-3xl font-bold text-blue-600">{data.missingValues.toLocaleString()}</div>
              <div className="text-sm text-blue-500">Missing Values</div>
            </div>
            <div className="text-center p-4 border border-blue-200 rounded-lg bg-white/50">
              <div className="text-3xl font-bold text-blue-600">{missingPercentage.toFixed(1)}%</div>
              <div className="text-sm text-blue-500">Missing Rate</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Data Quality Score</span>
              <Badge variant={missingPercentage < 5 ? 'default' : missingPercentage < 15 ? 'secondary' : 'destructive'}>
                {dataQuality}
              </Badge>
            </div>
            <Progress value={100 - missingPercentage} className="h-3" />
            <p className="text-xs text-blue-600 mt-1">
              Quality based on missing value percentage and data consistency
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sample Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-800">Sample Data Preview (First 10 Records)</CardTitle>
          <CardDescription className="text-blue-600">Preview of your actual survey responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-blue-50">
                  {Object.keys(data.sampleData[0] || {}).map((header, index) => (
                    <th key={index} className="text-left p-3 font-medium text-blue-800 border-r border-blue-200 last:border-r-0">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.sampleData.slice(0, 10).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b hover:bg-blue-50/50 transition-colors">
                    {Object.values(row).map((value: any, colIndex) => (
                      <td key={colIndex} className="p-3 border-r border-gray-200 last:border-r-0">
                        {value || <span className="text-gray-400 italic">missing</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Variable Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <BarChart3 className="h-5 w-5" />
            Variable Summary
          </CardTitle>
          <CardDescription className="text-blue-600">Overview of variable types and characteristics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-blue-800">Numeric Variables ({data.variables.filter(v => v.type === 'numeric').length})</h4>
              {data.variables.filter(v => v.type === 'numeric').slice(0, 5).map((variable, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="text-sm font-medium">{variable.name}</span>
                  <div className="text-xs text-blue-600">
                    {variable.mean ? `μ = ${variable.mean.toFixed(2)}` : 'No data'}
                  </div>
                </div>
              ))}
              {data.variables.filter(v => v.type === 'numeric').length > 5 && (
                <div className="text-xs text-blue-600">
                  +{data.variables.filter(v => v.type === 'numeric').length - 5} more variables...
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-purple-800">Categorical Variables ({data.variables.filter(v => v.type === 'categorical').length})</h4>
              {data.variables.filter(v => v.type === 'categorical').slice(0, 5).map((variable, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <span className="text-sm font-medium">{variable.name}</span>
                  <div className="text-xs text-purple-600">
                    {variable.uniqueValues} unique values
                  </div>
                </div>
              ))}
              {data.variables.filter(v => v.type === 'categorical').length > 5 && (
                <div className="text-xs text-purple-600">
                  +{data.variables.filter(v => v.type === 'categorical').length - 5} more variables...
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
