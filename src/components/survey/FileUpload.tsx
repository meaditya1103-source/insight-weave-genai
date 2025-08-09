import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FileUploadProps {
  onFileProcessed: (data: any) => void;
  isProcessing: boolean;
}

export const FileUpload = ({ onFileProcessed, isProcessing }: FileUploadProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string>('');
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.match(/\.(csv|xlsx)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or XLSX file.",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    setUploadProgress(0);

    // Simulate file processing with progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Here you would integrate with your Python backend
      // For now, we'll simulate the processing
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Mock processed data
        const mockData = {
          fileName: file.name,
          totalRows: 1000,
          totalColumns: 15,
          missingValues: 45,
          variables: [
            { name: 'age', type: 'numeric', missing: 5 },
            { name: 'gender', type: 'categorical', missing: 2 },
            { name: 'income', type: 'numeric', missing: 12 },
            { name: 'satisfaction', type: 'categorical', missing: 8 }
          ]
        };
        
        onFileProcessed(mockData);
        
        toast({
          title: "File processed successfully",
          description: `${file.name} has been analyzed and cleaned.`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "There was an error processing your file.",
        variant: "destructive",
      });
      setUploadProgress(0);
    }
  }, [onFileProcessed, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Survey Data
        </CardTitle>
        <CardDescription>
          Upload your CSV or XLSX file containing survey responses for automated analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg">Drop your file here...</p>
            ) : (
              <>
                <p className="text-lg">
                  Drag & drop your survey file here, or{' '}
                  <Button variant="link" className="p-0 h-auto">
                    browse files
                  </Button>
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV and XLSX files up to 50MB
                </p>
              </>
            )}
          </div>
        </div>

        {fileName && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{fileName}</span>
              <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Processing includes:</p>
              <ul className="space-y-1">
                <li>• Automated data cleaning and imputation</li>
                <li>• Design weight application</li>
                <li>• Statistical parameter estimation</li>
                <li>• AI-powered insights generation</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};