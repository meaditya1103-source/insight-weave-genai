
import { useState } from 'react';
import { FileUpload } from '@/components/survey/FileUpload';
import { DataPreview } from '@/components/survey/DataPreview';
import { ResultsDashboard } from '@/components/survey/ResultsDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartBar, Upload, Database, FileText } from 'lucide-react';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'results'>('upload');
  const [uploadedData, setUploadedData] = useState<any>(null);
  const [analysisGoal, setAnalysisGoal] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileProcessed = (data: any) => {
    setUploadedData(data);
    setCurrentStep('preview');
  };

  const handleStartAnalysis = () => {
    setCurrentStep('results');
  };

  const handleBackToPreview = () => {
    setShowPreview(true);
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setUploadedData(null);
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <ChartBar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent">
                Survey Processor AI
              </h1>
              <p className="text-blue-600 text-lg">
                Advanced AI-powered survey analysis with statistical insights & machine learning
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all ${
              currentStep === 'upload' ? 'bg-blue-600 text-white shadow-lg scale-105' : 
              uploadedData ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-300'
            }`}>
              <Upload className="h-5 w-5" />
              <span className="font-medium">Upload Data</span>
            </div>
            
            <div className={`w-12 h-1 rounded-full ${uploadedData ? 'bg-green-500' : 'bg-gray-300'}`} />
            
            <div className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all ${
              currentStep === 'preview' ? 'bg-blue-600 text-white shadow-lg scale-105' : 
              currentStep === 'results' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-300'
            }`}>
              <Database className="h-5 w-5" />
              <span className="font-medium">Data Preview</span>
            </div>
            
            <div className={`w-12 h-1 rounded-full ${currentStep === 'results' ? 'bg-green-500' : 'bg-gray-300'}`} />
            
            <div className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all ${
              currentStep === 'results' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white text-gray-600 border border-gray-300'
            }`}>
              <FileText className="h-5 w-5" />
              <span className="font-medium">AI Analysis</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {currentStep === 'upload' && (
            <div className="max-w-3xl mx-auto">
              <FileUpload onFileProcessed={handleFileProcessed} isProcessing={isProcessing} />
            </div>
          )}

          {currentStep === 'preview' && uploadedData && (
            <div className="space-y-6">
              <Card className="bg-gradient-to-r from-white to-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">Data Preview & Analysis Setup</CardTitle>
                  <CardDescription className="text-blue-600">
                    Review your data and configure AI analysis parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-blue-800">File: {uploadedData.fileName}</h3>
                      <p className="text-blue-600">Ready for AI-powered statistical analysis</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {uploadedData.totalRows.toLocaleString()} responses
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          {uploadedData.variables.length} variables
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <DataPreview data={uploadedData} onStartAnalysis={handleStartAnalysis} />
            </div>
          )}

          {currentStep === 'results' && uploadedData && (
            <div>
              {showPreview ? (
                <div className="space-y-6">
                  <Card className="bg-gradient-to-r from-white to-blue-50 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-800">Data Preview & Analysis Setup</CardTitle>
                      <CardDescription className="text-blue-600">
                        Review your data and configure AI analysis parameters
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-semibold text-blue-800">File: {uploadedData.fileName}</h3>
                          <p className="text-blue-600">Ready for AI-powered statistical analysis</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {uploadedData.totalRows.toLocaleString()} responses
                            </Badge>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              {uploadedData.variables.length} variables
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setShowPreview(false)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Back to Analysis
                          </button>
                          <button 
                            onClick={handleStartOver}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                          >
                            Start Over
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <DataPreview data={uploadedData} onStartAnalysis={handleStartAnalysis} />
                </div>
              ) : (
                <div>
                  <div className="text-center mb-8">
                    <Badge variant="default" className="mb-4 bg-green-600 text-white px-4 py-2 text-lg">
                      Analysis Ready
                    </Badge>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent">
                      AI-Powered Survey Analysis
                    </h2>
                    <p className="text-blue-600 mt-2">
                      Advanced statistical analysis with machine learning insights
                    </p>
                    <div className="flex justify-center gap-4 mt-4">
                      <button 
                        onClick={handleBackToPreview}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        View Data Preview
                      </button>
                      <button 
                        onClick={handleStartOver}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Start Over
                      </button>
                    </div>
                  </div>
                  
                  <ResultsDashboard data={uploadedData} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
