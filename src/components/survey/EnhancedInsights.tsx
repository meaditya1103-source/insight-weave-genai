
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, TrendingUp, AlertTriangle, Info, Target, Lightbulb } from 'lucide-react';

interface Insight {
  category: string;
  finding: string;
  significance: 'high' | 'medium' | 'low';
  type: 'warning' | 'trend' | 'anomaly' | 'pattern' | 'info' | 'recommendation';
}

interface EnhancedInsightsProps {
  insights: Insight[];
}

export const EnhancedInsights = ({ insights }: EnhancedInsightsProps) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4" />;
      case 'anomaly':
        return <Zap className="h-4 w-4" />;
      case 'pattern':
        return <Target className="h-4 w-4" />;
      case 'recommendation':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string, significance: string) => {
    if (significance === 'high') {
      switch (type) {
        case 'warning':
        case 'anomaly':
          return 'border-red-200 bg-red-50 text-red-800';
        case 'trend':
        case 'pattern':
          return 'border-blue-200 bg-blue-50 text-blue-800';
        case 'recommendation':
          return 'border-green-200 bg-green-50 text-green-800';
        default:
          return 'border-purple-200 bg-purple-50 text-purple-800';
      }
    } else if (significance === 'medium') {
      return 'border-orange-200 bg-orange-50 text-orange-800';
    } else {
      return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getBadgeVariant = (significance: string) => {
    switch (significance) {
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.type]) {
      acc[insight.type] = [];
    }
    acc[insight.type].push(insight);
    return acc;
  }, {} as Record<string, Insight[]>);

  const typeOrder = ['warning', 'anomaly', 'trend', 'pattern', 'recommendation', 'info'];
  const sortedTypes = typeOrder.filter(type => groupedInsights[type]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          AI-Generated Insights & Analysis
        </CardTitle>
        <CardDescription>
          Machine learning powered insights from your survey data patterns and distributions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Insight Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-2xl font-bold text-red-700">
                {insights.filter(i => i.significance === 'high').length}
              </div>
              <div className="text-sm text-red-600">High Priority</div>
            </div>
            <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">
                {insights.filter(i => i.significance === 'medium').length}
              </div>
              <div className="text-sm text-orange-600">Medium Priority</div>
            </div>
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {insights.filter(i => i.type === 'recommendation').length}
              </div>
              <div className="text-sm text-blue-600">Recommendations</div>
            </div>
          </div>

          {/* Grouped Insights */}
          {sortedTypes.map(type => (
            <div key={type} className="space-y-3">
              <h3 className="font-semibold text-lg capitalize flex items-center gap-2">
                {getInsightIcon(type)}
                {type === 'recommendation' ? 'Recommendations' : 
                 type === 'anomaly' ? 'Anomalies' : 
                 type + 's'}
                <Badge variant="outline" className="ml-2">
                  {groupedInsights[type].length}
                </Badge>
              </h3>
              
              <div className="space-y-3">
                {groupedInsights[type]
                  .sort((a, b) => {
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.significance] - priorityOrder[a.significance];
                  })
                  .map((insight, index) => (
                    <Alert 
                      key={index} 
                      className={`${getInsightColor(insight.type, insight.significance)} border-l-4`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getInsightIcon(insight.type)}
                            <h4 className="font-medium">{insight.category}</h4>
                            <Badge variant={getBadgeVariant(insight.significance)}>
                              {insight.significance} impact
                            </Badge>
                          </div>
                          <AlertDescription className="text-sm leading-relaxed">
                            {insight.finding}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))
                }
              </div>
            </div>
          ))}

          {insights.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No insights generated yet.</p>
              <p className="text-sm">Upload and analyze data to see AI-powered insights.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
