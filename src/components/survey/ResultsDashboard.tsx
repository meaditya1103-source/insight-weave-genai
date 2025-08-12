
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, BarChart3, Target, Zap, Calculator } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

import { ParameterEstimationSetup } from './ParameterEstimationSetup';
import { StatisticalAnalysis } from './StatisticalAnalysis';
import { EstimatesTable } from './EstimatesTable';
import { EnhancedInsights } from './EnhancedInsights';

interface ResultsDashboardProps {
  data: any;
}

export const ResultsDashboard = ({ data }: ResultsDashboardProps) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingEstimates, setIsGeneratingEstimates] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [parameterEstimates, setParameterEstimates] = useState<any[]>([]);

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Prepare data with proper structure for the edge function
      const analysisData = {
        variables: data.variables.map((variable: any) => ({
          name: variable.name,
          type: variable.type,
          values: variable.values || [],
          missing: variable.missing || 0
        })),
        sampleData: data.sampleData || [],
        totalRows: data.totalRows || 0,
        fileName: data.fileName
      };

      console.log('Sending analysis request with data:', analysisData);

      const { data: result, error } = await supabase.functions.invoke('analyze-survey', {
        body: { 
          data: analysisData
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!result) {
        throw new Error('No result returned from analysis function');
      }

      console.log('Analysis result received:', result);
      setAnalysisResults(result);
      
      toast({
        title: "Analysis Complete",
        description: "AI-powered statistical analysis has been completed successfully.",
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "There was an error performing the analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateEstimates = async (parameters: any[]) => {
    setIsGeneratingEstimates(true);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('analyze-survey', {
        body: { 
          data: data,
          parameters
        }
      });

      if (error) throw error;

      setParameterEstimates(result.parameterEstimates || []);
      
      toast({
        title: "Estimates Generated",
        description: `Successfully generated ${result.parameterEstimates?.length || 0} parameter estimates.`,
      });
    } catch (error) {
      console.error('Estimation error:', error);
      toast({
        title: "Estimation Failed",
        description: "There was an error generating parameter estimates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingEstimates(false);
    }
  };

  const handleDownloadPDF = async () => {
    toast({
      title: "Generating Report",
      description: "Your comprehensive PDF report is being generated...",
    });
    
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(24);
      doc.text('Survey Analysis Report', 20, 30);
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
      doc.text(`Dataset: ${data.fileName}`, 20, 55);
      
      // Executive Summary
      if (analysisResults?.executiveSummary) {
        doc.setFontSize(16);
        doc.text('Executive Summary', 20, 75);
        doc.setFontSize(12);
        doc.text(analysisResults.executiveSummary.overview, 20, 90);
        
        let yPos = 105;
        analysisResults.executiveSummary.keyFindings.forEach((finding: string, index: number) => {
          const lines = doc.splitTextToSize(`• ${finding}`, 170);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 5 + 5;
        });
      }
      
      // Quality Score
      if (analysisResults?.qualityScore) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Data Quality Assessment', 20, 30);
        doc.setFontSize(12);
        doc.text(`Overall Quality Score: ${analysisResults.qualityScore}%`, 20, 45);
      }
      
      // Parameter Estimates
      if (parameterEstimates.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Parameter Estimates', 20, 30);
        
        let yPos = 45;
        parameterEstimates.forEach((estimate, index) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFontSize(14);
          doc.text(`${estimate.estimatingParameter} (${estimate.aggregationType})`, 20, yPos);
          yPos += 15;
          
          estimate.groups.forEach((group: any) => {
            doc.setFontSize(10);
            doc.text(`${group.group}: ${group.estimate.toFixed(2)} ± ${group.marginOfError.toFixed(2)}`, 30, yPos);
            yPos += 10;
          });
          yPos += 10;
        });
      }
      
      // AI Insights
      if (analysisResults?.insights?.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('AI-Generated Insights', 20, 30);
        
        let yPos = 45;
        analysisResults.insights.forEach((insight: any, index: number) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFontSize(12);
          doc.text(`${insight.category}`, 20, yPos);
          yPos += 10;
          
          const lines = doc.splitTextToSize(insight.finding, 170);
          doc.setFontSize(10);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 5 + 15;
        });
      }
      
      doc.save('comprehensive-survey-analysis-report.pdf');
      
      toast({
        title: "Report Ready",
        description: "Your comprehensive survey analysis report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating the PDF report.",
        variant: "destructive",
      });
    }
  };

  const exportEstimates = () => {
    if (parameterEstimates.length === 0) {
      toast({
        title: "No Data",
        description: "No parameter estimates to export.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['Parameter', 'Group', 'Aggregation', 'Estimate', 'Margin of Error', '95% CI Lower', '95% CI Upper', 'Sample Size', 'Weighted N'].join(','),
      ...parameterEstimates.flatMap(estimate =>
        estimate.groups.map((group: any) => [
          estimate.estimatingParameter,
          group.group,
          estimate.aggregationType,
          group.estimate.toFixed(4),
          group.marginOfError.toFixed(4),
          group.confidenceInterval[0].toFixed(4),
          group.confidenceInterval[1].toFixed(4),
          group.sampleSize,
          group.weightedN.toFixed(0)
        ].join(','))
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parameter-estimates.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Parameter estimates have been exported to CSV.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Analysis Control Panel */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Calculator className="h-5 w-5" />
            AI-Powered Analysis Control
          </CardTitle>
          <CardDescription className="text-blue-600">
            Perform comprehensive statistical analysis with machine learning insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={performAnalysis}
              disabled={isAnalyzing}
              size="lg"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? 'Analyzing...' : 'Start AI Analysis'}
            </Button>
            
            <Button 
              onClick={handleDownloadPDF}
              variant="outline"
              size="lg"
              disabled={!analysisResults}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results Tabs */}
      {analysisResults && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="estimates">Estimates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quality Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Analysis Quality Score
                </CardTitle>
                <CardDescription>Overall confidence in the statistical estimates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress value={analysisResults.qualityScore} className="h-6" />
                  </div>
                  <div className="text-3xl font-bold text-primary">{analysisResults.qualityScore}%</div>
                </div>
                
                {/* Executive Summary */}
                {analysisResults.executiveSummary && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-semibold text-lg">Executive Summary</h3>
                    <p className="text-muted-foreground">{analysisResults.executiveSummary.overview}</p>
                    
                    <div>
                      <h4 className="font-medium mb-2">Key Findings:</h4>
                      <ul className="space-y-1">
                        {analysisResults.executiveSummary.keyFindings.map((finding: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics">
            <StatisticalAnalysis 
              analysis={analysisResults.statisticalAnalysis} 
              visualizations={analysisResults.visualizations}
            />
          </TabsContent>

          <TabsContent value="parameters">
            <ParameterEstimationSetup
              variables={data.variables}
              onGenerateEstimates={generateEstimates}
              isGenerating={isGeneratingEstimates}
            />
          </TabsContent>

          <TabsContent value="insights">
            <EnhancedInsights insights={analysisResults.insights || []} />
          </TabsContent>

          <TabsContent value="estimates">
            <EstimatesTable 
              estimates={parameterEstimates}
              onExportEstimates={exportEstimates}
            />
          </TabsContent>
        </Tabs>
      )}

      {!analysisResults && (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Ready for AI Analysis</h3>
            <p className="text-muted-foreground mb-4">
              Click "Start AI Analysis" to perform comprehensive statistical analysis with machine learning insights.
            </p>
            <Badge variant="outline" className="px-4 py-2">
              {data.totalRows.toLocaleString()} responses • {data.variables.length} variables
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
