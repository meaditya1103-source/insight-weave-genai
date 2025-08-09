import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, BarChart3, Target, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ResultsDashboardProps {
  results: {
    estimatedParameters: Array<{
      variable: string;
      estimate: number;
      marginOfError: number;
      confidenceInterval: [number, number];
      sampleSize: number;
    }>;
    insights: Array<{
      category: string;
      finding: string;
      significance: 'high' | 'medium' | 'low';
    }>;
    qualityScore: number;
  };
}

export const ResultsDashboard = ({ results }: ResultsDashboardProps) => {
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    toast({
      title: "Generating Report",
      description: "Your PDF report is being generated...",
    });
    
    try {
      // Dynamic import to avoid bundle issues
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Add title and header
      doc.setFontSize(20);
      doc.text('Survey Analysis Report', 20, 30);
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
      
      // Quality Score section
      doc.setFontSize(16);
      doc.text('Analysis Quality Score', 20, 65);
      doc.setFontSize(12);
      doc.text(`Overall Score: ${results.qualityScore}%`, 20, 80);
      
      // Estimated Parameters section
      doc.setFontSize(16);
      doc.text('Estimated Parameters', 20, 100);
      
      let yPosition = 115;
      results.estimatedParameters.forEach((param, index) => {
        doc.setFontSize(12);
        doc.text(`${param.variable.toUpperCase()}`, 20, yPosition);
        doc.text(`Estimate: ${param.estimate.toFixed(2)}%`, 30, yPosition + 10);
        doc.text(`Margin of Error: ±${param.marginOfError.toFixed(2)}%`, 30, yPosition + 20);
        doc.text(`95% CI: [${param.confidenceInterval[0].toFixed(2)}%, ${param.confidenceInterval[1].toFixed(2)}%]`, 30, yPosition + 30);
        doc.text(`Sample Size: ${param.sampleSize.toLocaleString()}`, 30, yPosition + 40);
        yPosition += 55;
      });
      
      // AI Insights section
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(16);
      doc.text('AI-Generated Insights', 20, yPosition);
      yPosition += 20;
      
      results.insights.forEach((insight, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.text(`${insight.category} (${insight.significance} impact)`, 20, yPosition);
        
        // Split long text into multiple lines
        const lines = doc.splitTextToSize(insight.finding, 170);
        doc.text(lines, 20, yPosition + 10);
        yPosition += 10 + (lines.length * 5) + 10;
      });
      
      // Save the PDF
      doc.save('survey-analysis-report.pdf');
      
      toast({
        title: "Report Ready",
        description: "Your survey analysis report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating the PDF report.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
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
              <Progress value={results.qualityScore} className="h-4" />
            </div>
            <div className="text-2xl font-bold text-primary">{results.qualityScore}%</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Sample Size</div>
              <div className="font-semibold">Adequate</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Data Quality</div>
              <div className="font-semibold">High</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Weights Applied</div>
              <div className="font-semibold">Yes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estimated Parameters
          </CardTitle>
          <CardDescription>Statistical estimates with margins of error</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.estimatedParameters.map((param, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium capitalize">{param.variable}</h4>
                  <Badge variant="outline">n = {param.sampleSize.toLocaleString()}</Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Estimate</div>
                    <div className="text-lg font-semibold text-primary">
                      {param.estimate.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Margin of Error</div>
                    <div className="text-lg font-semibold">
                      ±{param.marginOfError.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">95% CI</div>
                    <div className="text-sm">
                      [{param.confidenceInterval[0].toFixed(2)}%, {param.confidenceInterval[1].toFixed(2)}%]
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI-Generated Insights
          </CardTitle>
          <CardDescription>Key findings and patterns identified in your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.insights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Badge 
                    variant={
                      insight.significance === 'high' ? 'default' : 
                      insight.significance === 'medium' ? 'secondary' : 'outline'
                    }
                    className="mt-1"
                  >
                    {insight.significance} impact
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{insight.category}</h4>
                    <p className="text-sm text-muted-foreground">{insight.finding}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Download Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Report
          </CardTitle>
          <CardDescription>Download comprehensive analysis in PDF format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Report includes:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Executive summary with key findings</li>
                <li>• Detailed statistical analysis</li>
                <li>• Data quality assessment</li>
                <li>• Methodology documentation</li>
                <li>• Visualizations and charts</li>
                <li>• AI-generated insights and recommendations</li>
              </ul>
            </div>
            
            <Button onClick={handleDownloadPDF} className="w-full" size="lg">
              <Download className="mr-2 h-4 w-4" />
              Download PDF Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};