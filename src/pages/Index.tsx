import { useState } from 'react';
import { FileUpload } from '@/components/survey/FileUpload';
import { DataPreview } from '@/components/survey/DataPreview';
import { ResultsDashboard } from '@/components/survey/ResultsDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChartBar, Upload, Database, FileText } from 'lucide-react';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'results'>('upload');
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock results data
  const mockResults = {
    estimatedParameters: [
      {
        variable: 'customer satisfaction',
        estimate: 73.5,
        marginOfError: 2.8,
        confidenceInterval: [70.7, 76.3] as [number, number],
        sampleSize: 1200
      },
      {
        variable: 'likelihood to recommend',
        estimate: 68.2,
        marginOfError: 3.1,
        confidenceInterval: [65.1, 71.3] as [number, number],
        sampleSize: 1180
      },
      {
        variable: 'service quality rating',
        estimate: 76.8,
        marginOfError: 2.5,
        confidenceInterval: [74.3, 79.3] as [number, number],
        sampleSize: 1195
      }
    ],
    insights: [
      {
        category: 'Customer Satisfaction Trends',
        finding: 'Satisfaction levels show significant improvement in Q4, with 73.5% reporting positive experiences (+5.2% from previous quarter).',
        significance: 'high' as const
      },
      {
        category: 'Demographic Patterns',
        finding: 'Younger demographics (18-34) show 15% higher satisfaction rates compared to older segments.',
        significance: 'medium' as const
      },
      {
        category: 'Service Quality Impact',
        finding: 'Service quality rating is strongly correlated with overall satisfaction (r=0.78, p<0.001).',
        significance: 'high' as const
      }
    ],
    qualityScore: 89
  };

  const handleFileProcessed = (data: any) => {
    setUploadedData(data);
    setCurrentStep('preview');
  };

  const handleStartAnalysis = () => {
    setIsProcessing(true);
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep('results');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <ChartBar className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Survey Processor AI</h1>
              <p className="text-muted-foreground">Intelligent survey analysis with automated insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              currentStep === 'upload' ? 'bg-primary text-primary-foreground' : 
              uploadedData ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">Upload</span>
            </div>
            
            <div className={`w-8 h-0.5 ${uploadedData ? 'bg-green-500' : 'bg-muted'}`} />
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              currentStep === 'preview' ? 'bg-primary text-primary-foreground' : 
              currentStep === 'results' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Preview</span>
            </div>
            
            <div className={`w-8 h-0.5 ${currentStep === 'results' ? 'bg-green-500' : 'bg-muted'}`} />
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              currentStep === 'results' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Results</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 'upload' && (
            <div className="max-w-2xl mx-auto">
              <FileUpload onFileProcessed={handleFileProcessed} isProcessing={isProcessing} />
            </div>
          )}

          {currentStep === 'preview' && uploadedData && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Preview & Analysis Setup</CardTitle>
                  <CardDescription>
                    Review your data and configure analysis parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-semibold">File: {uploadedData.fileName}</h3>
                      <p className="text-muted-foreground">Ready for AI-powered analysis</p>
                    </div>
                    <button
                      onClick={handleStartAnalysis}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Start Analysis'}
                    </button>
                  </div>
                </CardContent>
              </Card>
              
              <DataPreview data={uploadedData} />
            </div>
          )}

          {currentStep === 'results' && (
            <div>
              <div className="text-center mb-6">
                <Badge variant="default" className="mb-2">Analysis Complete</Badge>
                <h2 className="text-2xl font-bold">Survey Analysis Results</h2>
                <p className="text-muted-foreground">
                  Your data has been processed with AI-powered insights
                </p>
              </div>
              
              <ResultsDashboard results={mockResults} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
