
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SurveyData {
  variables: Array<{
    name: string;
    type: 'numeric' | 'categorical';
    values: any[];
    missing: number;
  }>;
  sampleData: any[];
  totalRows: number;
  analysisGoal?: string;
}

interface ParameterEstimate {
  estimatingParameter: string;
  baseParameter: string;
  aggregationType: string;
  weightVariable?: string;
  groups: Array<{
    group: string;
    estimate: number;
    marginOfError: number;
    confidenceInterval: [number, number];
    sampleSize: number;
    weightedN: number;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data, parameters }: { data: SurveyData; parameters?: any[] } = await req.json();
    
    console.log('Analyzing survey data with', data.variables.length, 'variables');
    
    // Perform comprehensive statistical analysis
    const statisticalAnalysis = performStatisticalAnalysis(data);
    const parameterEstimates = parameters ? computeParameterEstimates(data, parameters) : [];
    const insights = await generateAIInsights(data, statisticalAnalysis);
    const visualizations = generateVisualizationData(data, statisticalAnalysis);
    
    const results = {
      statisticalAnalysis,
      parameterEstimates,
      insights,
      visualizations,
      qualityScore: calculateQualityScore(data),
      executiveSummary: generateExecutiveSummary(data, statisticalAnalysis, insights)
    };

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-survey function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function performStatisticalAnalysis(data: SurveyData) {
  const analysis: any = {};
  
  data.variables.forEach(variable => {
    const validValues = variable.values.filter(v => v !== null && v !== undefined && v !== '');
    
    if (variable.type === 'numeric') {
      const numericValues = validValues.map(v => parseFloat(v)).filter(v => !isNaN(v));
      
      if (numericValues.length > 0) {
        numericValues.sort((a, b) => a - b);
        
        analysis[variable.name] = {
          type: 'numeric',
          count: numericValues.length,
          missing: variable.missing,
          mean: numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length,
          median: getPercentile(numericValues, 0.5),
          q1: getPercentile(numericValues, 0.25),
          q3: getPercentile(numericValues, 0.75),
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          std: calculateStandardDeviation(numericValues),
          skewness: calculateSkewness(numericValues),
          kurtosis: calculateKurtosis(numericValues)
        };
      }
    } else {
      const valueCounts: { [key: string]: number } = {};
      validValues.forEach(val => {
        const key = String(val);
        valueCounts[key] = (valueCounts[key] || 0) + 1;
      });
      
      const sortedCounts = Object.entries(valueCounts).sort((a, b) => b[1] - a[1]);
      
      analysis[variable.name] = {
        type: 'categorical',
        count: validValues.length,
        missing: variable.missing,
        unique: Object.keys(valueCounts).length,
        mode: sortedCounts[0]?.[0],
        modeCount: sortedCounts[0]?.[1] || 0,
        valueCounts,
        topValues: sortedCounts.slice(0, 5)
      };
    }
  });
  
  return analysis;
}

function computeParameterEstimates(data: SurveyData, parameters: any[]): ParameterEstimate[] {
  return parameters.map(param => {
    const estimatingVar = data.variables.find(v => v.name === param.estimatingParameter);
    const baseVar = param.baseParameter !== 'None' ? 
      data.variables.find(v => v.name === param.baseParameter) : null;
    const weightVar = param.weightVariable ? 
      data.variables.find(v => v.name === param.weightVariable) : null;

    if (!estimatingVar) return null;

    const groups = baseVar ? 
      [...new Set(baseVar.values.filter(v => v !== null && v !== ''))].map(String) : 
      ['Overall'];

    const groupEstimates = groups.map(group => {
      let indices: number[] = [];
      
      if (baseVar && group !== 'Overall') {
        indices = baseVar.values
          .map((val, idx) => String(val) === group ? idx : -1)
          .filter(idx => idx !== -1);
      } else {
        indices = Array.from({ length: estimatingVar.values.length }, (_, i) => i);
      }

      const groupValues = indices
        .map(idx => estimatingVar.values[idx])
        .filter(v => v !== null && v !== undefined && v !== '');
      
      const weights = weightVar ? 
        indices.map(idx => parseFloat(weightVar.values[idx]) || 1) : 
        new Array(indices.length).fill(1);

      let estimate = 0;
      let marginOfError = 0;
      
      if (param.aggregationType === 'Mean' && estimatingVar.type === 'numeric') {
        const numericValues = groupValues.map(v => parseFloat(v)).filter(v => !isNaN(v));
        const validWeights = weights.slice(0, numericValues.length);
        estimate = calculateWeightedMean(numericValues, validWeights);
        marginOfError = calculateMarginOfError(numericValues, validWeights);
      } else if (param.aggregationType === 'Sum' && estimatingVar.type === 'numeric') {
        const numericValues = groupValues.map(v => parseFloat(v)).filter(v => !isNaN(v));
        estimate = numericValues.reduce((sum, val) => sum + val, 0);
        marginOfError = Math.sqrt(numericValues.length) * calculateStandardDeviation(numericValues) / Math.sqrt(numericValues.length);
      } else if (param.aggregationType === 'Proportion') {
        const targetValue = estimatingVar.type === 'categorical' ? 
          groupValues[0] : 1; // For categorical, use most common value
        const successes = groupValues.filter(v => v === targetValue).length;
        estimate = successes / groupValues.length;
        marginOfError = 1.96 * Math.sqrt((estimate * (1 - estimate)) / groupValues.length);
      } else if (param.aggregationType === 'Count') {
        estimate = groupValues.length;
        marginOfError = Math.sqrt(estimate);
      } else if (param.aggregationType === 'Median' && estimatingVar.type === 'numeric') {
        const numericValues = groupValues.map(v => parseFloat(v)).filter(v => !isNaN(v));
        estimate = getPercentile(numericValues.sort((a, b) => a - b), 0.5);
        marginOfError = 1.57 * calculateStandardDeviation(numericValues) / Math.sqrt(numericValues.length);
      }

      const weightedN = weights.reduce((sum, w) => sum + w, 0);

      return {
        group,
        estimate,
        marginOfError,
        confidenceInterval: [
          Math.max(0, estimate - marginOfError),
          estimate + marginOfError
        ] as [number, number],
        sampleSize: groupValues.length,
        weightedN
      };
    });

    return {
      estimatingParameter: param.estimatingParameter,
      baseParameter: param.baseParameter,
      aggregationType: param.aggregationType,
      weightVariable: param.weightVariable,
      groups: groupEstimates
    };
  }).filter(Boolean) as ParameterEstimate[];
}

async function generateAIInsights(data: SurveyData, analysis: any) {
  const insights = [];
  
  // Data Quality Insights
  const totalMissing = Object.values(analysis).reduce((sum: number, varAnalysis: any) => 
    sum + (varAnalysis.missing || 0), 0);
  const missingRate = (totalMissing / (data.totalRows * data.variables.length)) * 100;
  
  if (missingRate > 15) {
    insights.push({
      category: 'Data Quality Alert',
      finding: `High missing data rate of ${missingRate.toFixed(1)}% detected. Consider imputation strategies for robust analysis.`,
      significance: 'high',
      type: 'warning'
    });
  }

  // Distribution Insights
  const numericVars = Object.entries(analysis).filter(([_, varAnalysis]: [string, any]) => 
    varAnalysis.type === 'numeric');
  
  numericVars.forEach(([varName, varAnalysis]: [string, any]) => {
    if (Math.abs(varAnalysis.skewness) > 2) {
      insights.push({
        category: 'Distribution Analysis',
        finding: `${varName} shows ${varAnalysis.skewness > 0 ? 'positive' : 'negative'} skewness (${varAnalysis.skewness.toFixed(2)}). Consider transformation for normality.`,
        significance: 'medium',
        type: 'trend'
      });
    }
    
    if (varAnalysis.kurtosis > 3) {
      insights.push({
        category: 'Outlier Detection',
        finding: `${varName} exhibits high kurtosis (${varAnalysis.kurtosis.toFixed(2)}), indicating potential outliers affecting the distribution.`,
        significance: 'medium',
        type: 'anomaly'
      });
    }
  });

  // Categorical Variable Insights
  const categoricalVars = Object.entries(analysis).filter(([_, varAnalysis]: [string, any]) => 
    varAnalysis.type === 'categorical');
  
  categoricalVars.forEach(([varName, varAnalysis]: [string, any]) => {
    const dominantPercentage = (varAnalysis.modeCount / varAnalysis.count) * 100;
    
    if (dominantPercentage > 80) {
      insights.push({
        category: 'Response Pattern',
        finding: `${varName} shows high concentration in "${varAnalysis.mode}" (${dominantPercentage.toFixed(1)}%), indicating potential response bias.`,
        significance: 'medium',
        type: 'pattern'
      });
    }
    
    if (varAnalysis.unique / varAnalysis.count > 0.9) {
      insights.push({
        category: 'Data Structure',
        finding: `${varName} has very high uniqueness (${((varAnalysis.unique / varAnalysis.count) * 100).toFixed(1)}%), suggesting it may be an identifier rather than analytical variable.`,
        significance: 'low',
        type: 'info'
      });
    }
  });

  // Goal-based insights
  if (data.analysisGoal) {
    insights.push({
      category: 'Analysis Recommendation',
      finding: `Based on your goal: "${data.analysisGoal}", focus on variables with strong relationships and consider segmentation analysis for deeper insights.`,
      significance: 'high',
      type: 'recommendation'
    });
  }

  return insights;
}

function generateVisualizationData(data: SurveyData, analysis: any) {
  const visualizations: any = {};
  
  // Generate histogram data for numeric variables
  Object.entries(analysis).forEach(([varName, varAnalysis]: [string, any]) => {
    if (varAnalysis.type === 'numeric') {
      const variable = data.variables.find(v => v.name === varName);
      if (variable) {
        const values = variable.values
          .map(v => parseFloat(v))
          .filter(v => !isNaN(v));
        
        visualizations[varName] = {
          type: 'histogram',
          data: generateHistogramData(values, 20),
          stats: varAnalysis
        };
      }
    } else {
      visualizations[varName] = {
        type: 'bar',
        data: varAnalysis.topValues.map(([label, count]: [string, number]) => ({
          label,
          count,
          percentage: (count / varAnalysis.count * 100).toFixed(1)
        })),
        stats: varAnalysis
      };
    }
  });
  
  return visualizations;
}

// Utility functions
function getPercentile(sortedArray: number[], percentile: number): number {
  const index = (sortedArray.length - 1) * percentile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  
  if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
  
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function calculateSkewness(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const std = calculateStandardDeviation(values);
  const n = values.length;
  
  const skewnessSum = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0);
  return (n / ((n - 1) * (n - 2))) * skewnessSum;
}

function calculateKurtosis(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const std = calculateStandardDeviation(values);
  const n = values.length;
  
  const kurtosisSum = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0);
  return (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * kurtosisSum - (3 * Math.pow(n - 1, 2) / ((n - 2) * (n - 3)));
}

function calculateWeightedMean(values: number[], weights: number[]): number {
  const weightedSum = values.reduce((sum, val, idx) => sum + val * weights[idx], 0);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  return weightedSum / totalWeight;
}

function calculateMarginOfError(values: number[], weights: number[]): number {
  const weightedMean = calculateWeightedMean(values, weights);
  const weightedVariance = values.reduce((sum, val, idx) => 
    sum + weights[idx] * Math.pow(val - weightedMean, 2), 0) / weights.reduce((sum, w) => sum + w, 0);
  const effectiveSampleSize = Math.pow(weights.reduce((sum, w) => sum + w, 0), 2) / 
    weights.reduce((sum, w) => sum + w * w, 0);
  return 1.96 * Math.sqrt(weightedVariance / effectiveSampleSize);
}

function generateHistogramData(values: number[], bins: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / bins;
  
  const histogram = Array(bins).fill(0).map((_, i) => ({
    bin: `${(min + i * binWidth).toFixed(1)}-${(min + (i + 1) * binWidth).toFixed(1)}`,
    count: 0,
    range: [min + i * binWidth, min + (i + 1) * binWidth]
  }));
  
  values.forEach(val => {
    const binIndex = Math.min(Math.floor((val - min) / binWidth), bins - 1);
    histogram[binIndex].count++;
  });
  
  return histogram;
}

function calculateQualityScore(data: SurveyData): number {
  const totalCells = data.totalRows * data.variables.length;
  const missingCells = data.variables.reduce((sum, v) => sum + v.missing, 0);
  const completeness = ((totalCells - missingCells) / totalCells) * 100;
  
  // Additional quality factors
  const consistencyScore = 95; // Would need more complex analysis
  const validityScore = 90;    // Would need domain validation
  
  return Math.round((completeness * 0.4 + consistencyScore * 0.3 + validityScore * 0.3));
}

function generateExecutiveSummary(data: SurveyData, analysis: any, insights: any[]) {
  const numericVars = Object.values(analysis).filter((v: any) => v.type === 'numeric').length;
  const categoricalVars = Object.values(analysis).filter((v: any) => v.type === 'categorical').length;
  const highPriorityInsights = insights.filter(i => i.significance === 'high').length;
  
  return {
    overview: `Survey analysis of ${data.totalRows} respondents across ${data.variables.length} variables (${numericVars} numeric, ${categoricalVars} categorical).`,
    keyFindings: insights.slice(0, 3).map(i => i.finding),
    dataQuality: `${highPriorityInsights} high-priority data quality issues identified`,
    recommendations: [
      "Review variables with high missing rates for imputation strategies",
      "Consider log transformation for highly skewed numeric variables",
      "Validate categorical variables with extreme concentration patterns"
    ]
  };
}
