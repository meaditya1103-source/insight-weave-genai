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
        
        // Process the actual file to get real data
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const csvText = e.target?.result as string;
            
            // Handle different encodings and clean the text
            const cleanText = csvText
              .replace(/^\uFEFF/, '') // Remove BOM
              .replace(/\r\n/g, '\n')
              .replace(/\r/g, '\n');
            
            const lines = cleanText.trim().split('\n');
            if (lines.length < 2) {
              throw new Error('CSV file must have at least a header and one data row');
            }

            // Parse CSV properly handling quotes and commas
            const parseCSVLine = (line: string): string[] => {
              const result: string[] = [];
              let current = '';
              let inQuotes = false;
              let i = 0;

              while (i < line.length) {
                const char = line[i];
                
                if (char === '"') {
                  if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i += 2;
                  } else {
                    inQuotes = !inQuotes;
                    i++;
                  }
                } else if (char === ',' && !inQuotes) {
                  result.push(current.trim());
                  current = '';
                  i++;
                } else {
                  current += char;
                  i++;
                }
              }
              
              result.push(current.trim());
              return result;
            };

            const headers = parseCSVLine(lines[0]);
            const totalRows = lines.length - 1;
            
            // Parse all data for accurate statistics
            const allData: any[] = [];
            for (let i = 1; i < lines.length; i++) {
              const values = parseCSVLine(lines[i]);
              const row: any = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              allData.push(row);
            }

            // Get sample data (first 10 records)
            const sampleData = allData.slice(0, 10);

            // Analyze variables with all data
            const variables = headers.map(header => {
              let missing = 0;
              let numericCount = 0;
              const values: any[] = [];
              
              allData.forEach(row => {
                const value = row[header];
                if (!value || value === '' || value === null || value === undefined) {
                  missing++;
                } else {
                  values.push(value);
                  if (!isNaN(Number(value)) && value !== '' && value !== null) {
                    numericCount++;
                  }
                }
              });

              const isNumeric = numericCount > values.length * 0.5 && values.length > 0;
              const uniqueValues = [...new Set(values.filter(v => v !== '' && v !== null))].length;

              if (isNumeric) {
                const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
                return {
                  name: header,
                  type: 'numeric',
                  missing,
                  uniqueValues,
                  mean: numericValues.length > 0 ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length : 0,
                  min: numericValues.length > 0 ? Math.min(...numericValues) : 0,
                  max: numericValues.length > 0 ? Math.max(...numericValues) : 0
                };
              } else {
                return {
                  name: header,
                  type: 'categorical',
                  missing,
                  uniqueValues
                };
              }
            });

            const totalMissing = variables.reduce((sum, v) => sum + v.missing, 0);

            const processedData = {
              fileName: file.name,
              totalRows,
              totalColumns: headers.length,
              missingValues: totalMissing,
              variables,
              sampleData
            };
            
            onFileProcessed(processedData);
            
            toast({
              title: "File processed successfully",
              description: `${file.name} analyzed: ${processedData.totalRows} rows, ${processedData.totalColumns} columns`,
            });
          } catch (error) {
            toast({
              title: "Processing failed",
              description: "Error reading CSV file. Please check format.",
              variant: "destructive",
            });
          }
        };
        
        reader.readAsText(file);
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