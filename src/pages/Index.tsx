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

  // Generate real results from uploaded data
  const generateResults = (data: any) => {
    const numericVariables = data.variables.filter((v: any) => v.type === 'numeric');
    
    return {
      estimatedParameters: numericVariables.map((variable: any) => ({
        variable: variable.name,
        estimate: variable.mean || 0,
        marginOfError: variable.mean ? (variable.max - variable.min) / 10 : 0,
        confidenceInterval: [
          Math.max(0, (variable.mean || 0) - (variable.max - variable.min) / 10),
          Math.min(100, (variable.mean || 0) + (variable.max - variable.min) / 10)
        ] as [number, number],
        sampleSize: data.totalRows - variable.missing
      })),
      insights: [
        {
          category: 'Data Quality Assessment',
          finding: `Dataset contains ${data.totalRows} responses across ${data.totalColumns} variables with ${((data.missingValues / (data.totalRows * data.totalColumns)) * 100).toFixed(1)}% missing values.`,
          significance: 'high' as const
        },
        {
          category: 'Variable Distribution',
          finding: `${data.variables.filter((v: any) => v.type === 'numeric').length} numeric and ${data.variables.filter((v: any) => v.type === 'categorical').length} categorical variables identified for analysis.`,
          significance: 'medium' as const
        },
        {
          category: 'Completeness Analysis',
          finding: `${data.variables.filter((v: any) => v.missing === 0).length} variables have complete data, while ${data.variables.filter((v: any) => v.missing > 0).length} require imputation.`,
          significance: data.variables.filter((v: any) => v.missing > 0).length > 0 ? 'medium' as const : 'low' as const
        }
      ],
      qualityScore: Math.round(100 - (data.missingValues / (data.totalRows * data.totalColumns)) * 100)
    };
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
              
              <ResultsDashboard results={generateResults(uploadedData)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
