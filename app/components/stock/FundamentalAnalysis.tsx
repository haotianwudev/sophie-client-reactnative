import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define types for signal options
type SignalType = 'bullish' | 'bearish' | 'neutral';

// Define the props for fundamental data
interface FundamentalData {
  biz_date: string;
  overall_signal: string;
  confidence: number;
  profitability_score: number;
  profitability_signal: string;
  growth_score: number;
  growth_signal: string;
  health_score: number;
  health_signal: string;
  valuation_score: number;
  valuation_signal: string;
  return_on_equity: number;
  net_margin: number;
  operating_margin: number;
  revenue_growth: number;
  earnings_growth: number;
  book_value_growth: number;
  current_ratio: number;
  debt_to_equity: number;
  free_cash_flow_per_share: number;
  earnings_per_share: number;
  pe_ratio: number;
  pb_ratio: number;
  ps_ratio: number;
}

interface FundamentalAnalysisProps {
  fundamentalData?: FundamentalData;
  loading?: boolean;
}

// Define constants for metric descriptions and thresholds
const DIMENSION_DESCRIPTIONS = {
  profitability: "Measures how effectively a company generates profits from its assets and operations. Considers Return on Equity, Net Margin, and Operating Margin.",
  growth: "Examines a company's expansion trajectory. Analyzes Revenue Growth, Earnings Growth, and Book Value Growth rates.",
  health: "Assesses financial stability and risk. Evaluates Current Ratio, Debt-to-Equity, and Free Cash Flow conversion.",
  valuation: "Determines if a stock is fairly priced. Examines Price-to-Earnings, Price-to-Book, and Price-to-Sales ratios."
};

const METRIC_DESCRIPTIONS = {
  // Profitability
  return_on_equity: "Measures how efficiently a company uses shareholders' equity to generate profit. Threshold: >15% is strong.",
  net_margin: "The percentage of revenue that remains as profit after all expenses. Threshold: >20% is healthy.",
  operating_margin: "Profit from operations as a percentage of revenue, before interest and taxes. Threshold: >15% is efficient.",
  
  // Growth
  revenue_growth: "Year-over-year percentage increase in company sales. Threshold: >10% is strong.",
  earnings_growth: "Year-over-year percentage increase in company profits. Threshold: >10% is strong.",
  book_value_growth: "Year-over-year percentage increase in company equity value. Threshold: >10% is strong.",
  
  // Health
  current_ratio: "Measures ability to pay short-term obligations (current assets / current liabilities). Threshold: >1.5 indicates good liquidity.",
  debt_to_equity: "Ratio of total debt to shareholders' equity, indicating financial leverage. Threshold: <0.5 is conservative.",
  fcf_conversion: "Ratio of free cash flow to earnings, indicating quality of earnings. Threshold: >0.8 (80% of earnings) is healthy.",
  
  // Valuation
  pe_ratio: "Stock price divided by earnings per share. Threshold: <25 is reasonable, higher values may indicate overvaluation.",
  pb_ratio: "Stock price divided by book value per share. Threshold: <3 is reasonable, higher values may indicate overvaluation.",
  ps_ratio: "Stock price divided by revenue per share. Threshold: <5 is reasonable, higher values may indicate overvaluation."
};

const THRESHOLDS = {
  // Profitability
  return_on_equity: 0.15,
  net_margin: 0.20,
  operating_margin: 0.15,
  
  // Growth
  revenue_growth: 0.10,
  earnings_growth: 0.10,
  book_value_growth: 0.10,
  
  // Health
  current_ratio: 1.5,
  debt_to_equity: 0.5,
  fcf_conversion: 0.8,
  
  // Valuation
  pe_ratio: 25,
  pb_ratio: 3,
  ps_ratio: 5,
};

const FundamentalAnalysis = ({ 
  fundamentalData,
  loading = false 
}: FundamentalAnalysisProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Helper functions
  // Format percentage values
  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  // Format ratio values
  const formatRatio = (value: number): string => {
    return value.toFixed(2);
  };
  
  // Format date string
  const formatDateString = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get signal color based on value
  const getSignalColor = (signal: string): string => {
    switch(signal?.toLowerCase()) {
      case 'bullish': return '#22c55e'; // green
      case 'bearish': return '#ef4444'; // red
      case 'neutral': return '#f59e0b'; // yellow
      default: return '#6b7280'; // gray
    }
  };
  
  // Get color based on value comparison to threshold
  const getComparisonColor = (value: number, threshold: number, isHigherBetter: boolean): string => {
    if (isHigherBetter) {
      return value >= threshold ? '#22c55e' : '#ef4444';
    } else {
      return value <= threshold ? '#22c55e' : '#ef4444';
    }
  };
  
  // Calculate free cash flow conversion if data is available
  const calculateFcfConversion = (): number => {
    if (!fundamentalData || !fundamentalData.free_cash_flow_per_share || !fundamentalData.earnings_per_share) {
      return 0;
    }
    return fundamentalData.free_cash_flow_per_share / fundamentalData.earnings_per_share;
  };
  
  // Initialize fcf conversion 
  const fcfConversion = calculateFcfConversion();
  
  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.darkContainer]}>
        <Text style={[styles.loadingText, isDark && styles.darkText]}>
          Loading fundamental analysis...
        </Text>
      </View>
    );
  }
  
  // Placeholder state
  if (!fundamentalData) {
    return (
      <View style={[styles.container, isDark && styles.darkContainer]}>
        <Text style={[styles.placeholder, isDark && styles.darkMutedText]}>
          Fundamental analysis evaluates a company's financial health, profitability, growth prospects, and business model. It helps identify companies with strong underlying business performance.
        </Text>
      </View>
    );
  }
  
  // Organize metrics for display
  const profitabilityMetrics = [
    { name: "Return on Equity", value: fundamentalData.return_on_equity, format: formatPercent, threshold: THRESHOLDS.return_on_equity, description: METRIC_DESCRIPTIONS.return_on_equity, isHigherBetter: true },
    { name: "Net Margin", value: fundamentalData.net_margin, format: formatPercent, threshold: THRESHOLDS.net_margin, description: METRIC_DESCRIPTIONS.net_margin, isHigherBetter: true },
    { name: "Operating Margin", value: fundamentalData.operating_margin, format: formatPercent, threshold: THRESHOLDS.operating_margin, description: METRIC_DESCRIPTIONS.operating_margin, isHigherBetter: true },
  ];
  
  const growthMetrics = [
    { name: "Revenue Growth", value: fundamentalData.revenue_growth, format: formatPercent, threshold: THRESHOLDS.revenue_growth, description: METRIC_DESCRIPTIONS.revenue_growth, isHigherBetter: true },
    { name: "Earnings Growth", value: fundamentalData.earnings_growth, format: formatPercent, threshold: THRESHOLDS.earnings_growth, description: METRIC_DESCRIPTIONS.earnings_growth, isHigherBetter: true },
    { name: "Book Value Growth", value: fundamentalData.book_value_growth, format: formatPercent, threshold: THRESHOLDS.book_value_growth, description: METRIC_DESCRIPTIONS.book_value_growth, isHigherBetter: true },
  ];
  
  const healthMetrics = [
    { name: "Current Ratio", value: fundamentalData.current_ratio, format: formatRatio, threshold: THRESHOLDS.current_ratio, description: METRIC_DESCRIPTIONS.current_ratio, isHigherBetter: true },
    { name: "Debt-to-Equity", value: fundamentalData.debt_to_equity, format: formatRatio, threshold: THRESHOLDS.debt_to_equity, description: METRIC_DESCRIPTIONS.debt_to_equity, isHigherBetter: false },
    { name: "FCF Conversion", value: fcfConversion, format: formatRatio, threshold: THRESHOLDS.fcf_conversion, description: METRIC_DESCRIPTIONS.fcf_conversion, isHigherBetter: true },
  ];
  
  const valuationMetrics = [
    { name: "P/E Ratio", value: fundamentalData.pe_ratio, format: formatRatio, threshold: THRESHOLDS.pe_ratio, description: METRIC_DESCRIPTIONS.pe_ratio, isHigherBetter: false },
    { name: "P/B Ratio", value: fundamentalData.pb_ratio, format: formatRatio, threshold: THRESHOLDS.pb_ratio, description: METRIC_DESCRIPTIONS.pb_ratio, isHigherBetter: false },
    { name: "P/S Ratio", value: fundamentalData.ps_ratio, format: formatRatio, threshold: THRESHOLDS.ps_ratio, description: METRIC_DESCRIPTIONS.ps_ratio, isHigherBetter: false },
  ];
  
  // Render a metric row with value and description
  const renderMetricRow = (metric: any) => {
    const formattedValue = metric.format(metric.value);
    const comparisonColor = getComparisonColor(
      metric.value, 
      metric.threshold, 
      metric.isHigherBetter
    );
    
    return (
      <View key={metric.name} style={styles.metricRow}>
        <View style={styles.metricHeader}>
          <Text style={[styles.metricName, isDark && styles.darkText]}>
            {metric.name}
          </Text>
          <Text style={[styles.metricValue, { color: comparisonColor }]}>
            {formattedValue}
          </Text>
        </View>
        <Text style={[styles.metricDescription, isDark && styles.darkMutedText]}>
          {metric.description}
        </Text>
      </View>
    );
  };
  
  // Render a dimension card with metrics
  const renderDimensionCard = (
    title: string, 
    metrics: any[], 
    score: number, 
    signal: string, 
    description: string
  ) => (
    <View style={[styles.dimensionCard, isDark && styles.darkCard]}>
      <View style={styles.dimensionHeader}>
        <Text style={[styles.dimensionTitle, isDark && styles.darkText]}>{title}</Text>
        <View style={styles.signalContainer}>
          <Text style={[styles.signalText, { color: getSignalColor(signal) }]}>
            {signal.toUpperCase()}
          </Text>
          <Text style={[styles.scoreText, isDark && styles.darkMutedText]}>
            ({score}/3 metrics)
          </Text>
        </View>
      </View>
      
      <Text style={[styles.dimensionDescription, isDark && styles.darkMutedText]}>
        {description}
      </Text>
      
      <View style={styles.metricsContainer}>
        {metrics.map(renderMetricRow)}
      </View>
      
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${(score / 3) * 100}%` }]} />
        </View>
      </View>
    </View>
  );
  
  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      {/* Overall Fundamental Signal */}
      <View style={[styles.overallCard, isDark && styles.darkCard]}>
        <View style={styles.overallHeader}>
          <Text style={[styles.overallTitle, isDark && styles.darkText]}>
            Fundamental Analysis
          </Text>
        </View>
        
        <View style={styles.dateContainer}>
          <Text style={[styles.dateLabel, isDark && styles.darkMutedText]}>
            Analysis Date:
          </Text>
          <Text style={[styles.dateValue, isDark && styles.darkText]}>
            {formatDateString(fundamentalData.biz_date)}
          </Text>
        </View>
        
        <Text style={[styles.overallDescription, isDark && styles.darkMutedText]}>
          Ideal for long-term investment decisions based on company financial strength and business quality rather than short-term price movements
        </Text>
        
        {/* Overall signal and confidence */}
        <View style={styles.signalBoxContainer}>
          <View style={styles.signalBox}>
            <Text style={[styles.signalBoxValue, { color: getSignalColor(fundamentalData.overall_signal) }]}>
              {fundamentalData.overall_signal.toUpperCase()}
            </Text>
            <Text style={[styles.signalBoxLabel, isDark && styles.darkMutedText]}>
              {fundamentalData.confidence}% confidence
            </Text>
          </View>
          
          {/* Dimension summary grid */}
          <View style={styles.dimensionGrid}>
            <View style={[styles.dimensionGridItem, isDark && styles.darkGridItem]}>
              <Text style={[
                styles.dimensionGridValue, 
                { color: getSignalColor(fundamentalData.profitability_signal) }
              ]}>
                {fundamentalData.profitability_signal.toUpperCase()}
              </Text>
              <Text style={[styles.dimensionGridLabel, isDark && styles.darkMutedText]}>
                Profitability
              </Text>
            </View>
            
            <View style={[styles.dimensionGridItem, isDark && styles.darkGridItem]}>
              <Text style={[
                styles.dimensionGridValue, 
                { color: getSignalColor(fundamentalData.growth_signal) }
              ]}>
                {fundamentalData.growth_signal.toUpperCase()}
              </Text>
              <Text style={[styles.dimensionGridLabel, isDark && styles.darkMutedText]}>
                Growth
              </Text>
            </View>
            
            <View style={[styles.dimensionGridItem, isDark && styles.darkGridItem]}>
              <Text style={[
                styles.dimensionGridValue, 
                { color: getSignalColor(fundamentalData.health_signal) }
              ]}>
                {fundamentalData.health_signal.toUpperCase()}
              </Text>
              <Text style={[styles.dimensionGridLabel, isDark && styles.darkMutedText]}>
                Financial Health
              </Text>
            </View>
            
            <View style={[styles.dimensionGridItem, isDark && styles.darkGridItem]}>
              <Text style={[
                styles.dimensionGridValue, 
                { color: getSignalColor(fundamentalData.valuation_signal) }
              ]}>
                {fundamentalData.valuation_signal.toUpperCase()}
              </Text>
              <Text style={[styles.dimensionGridLabel, isDark && styles.darkMutedText]}>
                Valuation
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Detail Cards - 2x2 grid on large screens */}
      <View style={styles.detailCardsContainer}>
        {renderDimensionCard(
          "Profitability", 
          profitabilityMetrics, 
          fundamentalData.profitability_score, 
          fundamentalData.profitability_signal,
          DIMENSION_DESCRIPTIONS.profitability
        )}
        
        {renderDimensionCard(
          "Growth", 
          growthMetrics, 
          fundamentalData.growth_score, 
          fundamentalData.growth_signal,
          DIMENSION_DESCRIPTIONS.growth
        )}
        
        {renderDimensionCard(
          "Financial Health", 
          healthMetrics, 
          fundamentalData.health_score, 
          fundamentalData.health_signal,
          DIMENSION_DESCRIPTIONS.health
        )}
        
        {renderDimensionCard(
          "Valuation", 
          valuationMetrics, 
          fundamentalData.valuation_score, 
          fundamentalData.valuation_signal,
          DIMENSION_DESCRIPTIONS.valuation
        )}
      </View>
      
      {/* Methodology Section */}
      <View style={[styles.methodologyCard, isDark && styles.darkCard]}>
        <View style={styles.methodologySection}>
          <Text style={[styles.methodologyTitle, isDark && styles.darkText]}>
            Methodology:
          </Text>
          <View style={styles.methodologyList}>
            <Text style={[styles.methodologyItem, isDark && styles.darkMutedText]}>
              • Profitability (33% weight): Measures how effectively a company generates profit
            </Text>
            <Text style={[styles.methodologyItem, isDark && styles.darkMutedText]}>
              • Growth (33% weight): Examines a company's expansion rates across revenue, earnings, and book value
            </Text>
            <Text style={[styles.methodologyItem, isDark && styles.darkMutedText]}>
              • Financial Health (17% weight): Assesses stability, risk levels, and cash flow quality
            </Text>
            <Text style={[styles.methodologyItem, isDark && styles.darkMutedText]}>
              • Valuation (17% weight): Determines if the current stock price is reasonably valued
            </Text>
          </View>
        </View>
        
        <View style={styles.signalGenSection}>
          <Text style={[styles.methodologyTitle, isDark && styles.darkText]}>
            Signal Generation:
          </Text>
          <View style={styles.signalGenList}>
            <View style={styles.signalGenItem}>
              <Text style={[styles.bullishText, { color: '#22c55e' }]}>Bullish: </Text>
              <Text style={[styles.signalGenDescription, isDark && styles.darkMutedText]}>
                More bullish than bearish dimensions
              </Text>
            </View>
            <View style={styles.signalGenItem}>
              <Text style={[styles.bearishText, { color: '#ef4444' }]}>Bearish: </Text>
              <Text style={[styles.signalGenDescription, isDark && styles.darkMutedText]}>
                More bearish than bullish dimensions
              </Text>
            </View>
            <View style={styles.signalGenItem}>
              <Text style={[styles.neutralText, { color: '#f59e0b' }]}>Neutral: </Text>
              <Text style={[styles.signalGenDescription, isDark && styles.darkMutedText]}>
                Equal bullish and bearish dimensions
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  darkContainer: {
    backgroundColor: '#222222',
  },
  overallCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  darkCard: {
    backgroundColor: '#333333',
  },
  overallHeader: {
    marginBottom: 6,
  },
  overallTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  overallDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  signalBoxContainer: {
    marginBottom: 8,
  },
  signalBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  signalBoxValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  signalBoxLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  dimensionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dimensionGridItem: {
    width: '48%',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  darkGridItem: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  dimensionGridValue: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  dimensionGridLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailCardsContainer: {
    marginBottom: 16,
  },
  dimensionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dimensionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dimensionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  scoreText: {
    fontSize: 12,
    color: '#6b7280',
  },
  dimensionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  metricsContainer: {
    marginBottom: 12,
  },
  metricRow: {
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metricName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBackground: {
    height: 6,
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6d28d9',
    borderRadius: 3,
  },
  methodologyCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  methodologySection: {
    marginBottom: 16,
  },
  methodologyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  methodologyList: {
    marginBottom: 8,
  },
  methodologyItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    lineHeight: 20,
  },
  signalGenSection: {},
  signalGenList: {},
  signalGenItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullishText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bearishText: {
    fontSize: 14,
    fontWeight: '500',
  },
  neutralText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signalGenDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#000000',
  },
  placeholder: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    padding: 16,
    lineHeight: 20,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#9ca3af',
  },
});

export default FundamentalAnalysis; 