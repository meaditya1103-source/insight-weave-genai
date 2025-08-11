
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Variable {
  name: string;
  type: 'numeric' | 'categorical';
}

interface ParameterLog {
  id: string;
  estimatingParameter: string;
  baseParameter: string;
  aggregationType: string;
  weightVariable?: string;
}

interface ParameterEstimationSetupProps {
  variables: Variable[];
  onGenerateEstimates: (parameters: ParameterLog[]) => void;
  isGenerating: boolean;
}

export const ParameterEstimationSetup = ({ 
  variables, 
  onGenerateEstimates, 
  isGenerating 
}: ParameterEstimationSetupProps) => {
  const { toast } = useToast();
  const [parameterLogs, setParameterLogs] = useState<ParameterLog[]>([]);
  const [currentParameter, setCurrentParameter] = useState({
    estimatingParameter: '',
    baseParameter: 'None',
    aggregationType: '',
    weightVariable: ''
  });

  const numericVariables = variables.filter(v => v.type === 'numeric');
  const categoricalVariables = variables.filter(v => v.type === 'categorical');
  const allVariables = [...numericVariables, ...categoricalVariables];

  const getRecommendedAggregation = (varName: string) => {
    const variable = variables.find(v => v.name === varName);
    if (!variable) return '';
    
    // Simple heuristic for recommendations
    if (variable.type === 'numeric') {
      if (varName.toLowerCase().includes('rating') || varName.toLowerCase().includes('score')) {
        return 'Mean';
      } else if (varName.toLowerCase().includes('total') || varName.toLowerCase().includes('amount')) {
        return 'Sum';
      } else {
        return 'Mean';
      }
    } else {
      return 'Proportion';
    }
  };

  const aggregationOptions = currentParameter.estimatingParameter ? 
    variables.find(v => v.name === currentParameter.estimatingParameter)?.type === 'numeric' 
      ? ['Mean', 'Sum', 'Median', 'Count']
      : ['Proportion', 'Count']
    : [];

  const handleAddLog = () => {
    if (!currentParameter.estimatingParameter || !currentParameter.aggregationType) {
      toast({
        title: "Missing Parameters",
        description: "Please select both estimating parameter and aggregation type.",
        variant: "destructive",
      });
      return;
    }

    const newLog: ParameterLog = {
      id: Date.now().toString(),
      estimatingParameter: currentParameter.estimatingParameter,
      baseParameter: currentParameter.baseParameter,
      aggregationType: currentParameter.aggregationType,
      weightVariable: currentParameter.weightVariable || undefined
    };

    setParameterLogs([...parameterLogs, newLog]);
    setCurrentParameter({
      estimatingParameter: '',
      baseParameter: 'None',
      aggregationType: '',
      weightVariable: ''
    });

    toast({
      title: "Parameter Added",
      description: "Parameter estimation log created successfully.",
    });
  };

  const handleRemoveLog = (id: string) => {
    setParameterLogs(parameterLogs.filter(log => log.id !== id));
  };

  const handleGenerateEstimates = () => {
    if (parameterLogs.length === 0) {
      toast({
        title: "No Parameters",
        description: "Please add at least one parameter estimation log.",
        variant: "destructive",
      });
      return;
    }

    onGenerateEstimates(parameterLogs);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Parameter Estimation Setup
        </CardTitle>
        <CardDescription>
          Configure parameters for weighted statistical estimation with stratification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Parameter Selection Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20">
          <div>
            <label className="text-sm font-medium mb-2 block">Estimating Parameter</label>
            <Select 
              value={currentParameter.estimatingParameter} 
              onValueChange={(value) => {
                setCurrentParameter({
                  ...currentParameter, 
                  estimatingParameter: value,
                  aggregationType: getRecommendedAggregation(value)
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select variable" />
              </SelectTrigger>
              <SelectContent>
                {allVariables.map(variable => (
                  <SelectItem key={variable.name} value={variable.name}>
                    {variable.name} ({variable.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Base Parameter (Grouping)</label>
            <Select 
              value={currentParameter.baseParameter} 
              onValueChange={(value) => setCurrentParameter({...currentParameter, baseParameter: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None (Overall)</SelectItem>
                {categoricalVariables.map(variable => (
                  <SelectItem key={variable.name} value={variable.name}>
                    {variable.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Aggregation Type</label>
            <Select 
              value={currentParameter.aggregationType} 
              onValueChange={(value) => setCurrentParameter({...currentParameter, aggregationType: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {aggregationOptions.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                    {option === getRecommendedAggregation(currentParameter.estimatingParameter) && 
                      <Badge variant="secondary" className="ml-2 text-xs">Recommended</Badge>
                    }
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Weight Variable</label>
            <Select 
              value={currentParameter.weightVariable} 
              onValueChange={(value) => setCurrentParameter({...currentParameter, weightVariable: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select weights" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (Equal weights)</SelectItem>
                {numericVariables.map(variable => (
                  <SelectItem key={variable.name} value={variable.name}>
                    {variable.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleAddLog} 
          className="w-full"
          disabled={!currentParameter.estimatingParameter || !currentParameter.aggregationType}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Estimation Log
        </Button>

        {/* Parameter Logs */}
        {parameterLogs.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Parameter Estimation Log ({parameterLogs.length})</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {parameterLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{log.aggregationType}</Badge>
                      <span className="font-medium">{log.estimatingParameter}</span>
                      {log.baseParameter !== 'None' && (
                        <>
                          <span className="text-muted-foreground">grouped by</span>
                          <Badge variant="secondary">{log.baseParameter}</Badge>
                        </>
                      )}
                    </div>
                    {log.weightVariable && (
                      <div className="text-sm text-muted-foreground">
                        Weighted by: {log.weightVariable}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLog(log.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button 
          onClick={handleGenerateEstimates}
          disabled={parameterLogs.length === 0 || isGenerating}
          size="lg"
          className="w-full"
        >
          <Calculator className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating Estimates...' : 'Generate Estimates'}
        </Button>
      </CardContent>
    </Card>
  );
};
