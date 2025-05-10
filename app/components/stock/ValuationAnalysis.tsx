import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define types for signal options
type SignalType = 'bullish' | 'bearish' | 'neutral';

// Define the props for valuation data
interface ValuationData {
  valuation_method: string;
  intrinsic_value: number;
  market_cap: number;
  gap: number;
  signal: string;
  biz_date: string;
}

interface ValuationAnalysisProps {
  valuationData?: ValuationData[];
  loading?: boolean;
}

// Define method weights for different valuation methods
const METHOD_WEIGHTS: Record<string, number> = {
  "dcf": 0.35,
  "ev_ebitda": 0.20,
  "owner_earnings": 0.35,
  "residual_income": 0.10,
  "weighted": 1.0
};

// Define method descriptions
const METHOD_DESCRIPTIONS: Record<string, string> = {
  "dcf": "Projects future cash flows over 5 years with 5% growth and 10% discount rate. Calculates the present value of expected future cash flows.",
  "ev_ebitda": "Compares enterprise value to earnings before interest, taxes, depreciation & amortization using historical multiples.",
  "owner_earnings": "Warren Buffett's method: Net Income + Depreciation - Maintenance Capex, with a margin of safety applied.",
  "residual_income": "Based on book value plus excess returns over required cost of capital, focusing on economic profit.",
  "weighted": "Combines all methods: DCF (35%), Owner Earnings (35%), EV/EBITDA (20%), and Residual Income (10%)."
};

// Define method names for display
const METHOD_NAMES: Record<string, string> = {
  "dcf": "Discounted Cash Flow",
  "ev_ebitda": "EV/EBITDA Multiple",
  "owner_earnings": "Owner Earnings",
  "residual_income": "Residual Income",
  "weighted": "Weighted Average"
};

const ValuationAnalysis = ({ 
  valuationData,
  loading = false 
}: ValuationAnalysisProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Helper functions
  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };
  
  // Format percentage
  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
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
  
  // Calculate confidence (capped at 30% absolute gap)
  const getConfidence = (gap: number): number => {
    const absGap = Math.abs(gap);
    return Math.min(absGap, 0.3) / 0.3 * 100;
  };
  
  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.darkContainer]}>
        <Text style={[styles.loadingText, isDark && styles.darkText]}>
          Loading valuation analysis...
        </Text>
      </View>
    );
  }
  
  // Placeholder state
  if (!valuationData || valuationData.length === 0) {
    return (
      <View style={[styles.container, isDark && styles.darkContainer]}>
        <Text style={[styles.placeholder, isDark && styles.darkMutedText]}>
          Valuation analysis determines if a stock is fairly priced by comparing its current market price to its intrinsic value calculated through various methods like DCF and multiples.
        </Text>
      </View>
    );
  }
  
  // Find the weighted valuation and filter out for individual methods
  const weightedValuation = valuationData.find(v => v.valuation_method === "weighted");
  const methodValuations = valuationData.filter(v => v.valuation_method !== "weighted");
  
  // Calculate overall confidence
  const overallConfidence = weightedValuation ? getConfidence(weightedValuation.gap) : 0;
  
  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      {/* Overall valuation section */}
      {weightedValuation && (
        <View style={[styles.overallCard, isDark && styles.darkCard]}>
          <View style={styles.overallHeader}>
            <Text style={[styles.overallTitle, isDark && styles.darkText]}>
              Valuation Analysis
            </Text>
          </View>
          
          <View style={styles.dateContainer}>
            <Text style={[styles.dateLabel, isDark && styles.darkMutedText]}>
              Analysis Date:
            </Text>
            <Text style={[styles.dateValue, isDark && styles.darkText]}>
              {formatDateString(weightedValuation.biz_date)}
            </Text>
          </View>
          
          <Text style={[styles.overallDescription, isDark && styles.darkMutedText]}>
            Our valuation analysis combines multiple methodologies to determine whether a stock is fairly priced relative to its intrinsic value.
          </Text>
          
          <View style={styles.signalContainer}>
            <View style={[styles.signalBadge, { backgroundColor: getSignalColor(weightedValuation.signal) }]}>
              <Text style={styles.signalBadgeText}>
                {weightedValuation.signal.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.confidenceText, isDark && styles.darkMutedText]}>
              {Math.round(overallConfidence)}% confidence
            </Text>
          </View>
          
          <View style={styles.valuationSummary}>
            <View style={styles.valuationRow}>
              <View style={styles.valuationItem}>
                <Text style={[styles.itemLabel, isDark && styles.darkMutedText]}>
                  Intrinsic Value:
                </Text>
                <Text style={[styles.itemValue, isDark && styles.darkText]}>
                  {formatCurrency(weightedValuation.intrinsic_value)}
                </Text>
              </View>
              
              <View style={styles.valuationItem}>
                <Text style={[styles.itemLabel, isDark && styles.darkMutedText]}>
                  Market Value:
                </Text>
                <Text style={[styles.itemValue, isDark && styles.darkText]}>
                  {formatCurrency(weightedValuation.market_cap)}
                </Text>
              </View>
            </View>
            
            <View style={styles.gapHeader}>
              <Text style={[styles.gapLabel, isDark && styles.darkMutedText]}>
                Valuation Gap:
              </Text>
              <Text style={[styles.gapValue, { color: weightedValuation.gap >= 0 ? '#22c55e' : '#ef4444' }]}>
                {formatPercent(weightedValuation.gap)} {weightedValuation.gap >= 0 ? "Undervalued" : "Overvalued"}
              </Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${50 + (weightedValuation.gap * 100)}%`,
                      backgroundColor: weightedValuation.gap >= 0 ? '#22c55e' : '#ef4444'
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>
      )}
      
      {/* Individual valuation methods */}
      {methodValuations.map((valuation, index) => (
        <View 
          key={valuation.valuation_method}
          style={[
            styles.methodCard,
            isDark && styles.darkCard,
            { marginTop: index === 0 ? 16 : 12 }
          ]}
        >
          <View style={styles.methodHeader}>
            <Text style={[styles.methodTitle, isDark && styles.darkText]}>
              {METHOD_NAMES[valuation.valuation_method]}
            </Text>
            <View style={[styles.signalBadge, { backgroundColor: getSignalColor(valuation.signal) }]}>
              <Text style={styles.signalBadgeText}>
                {valuation.signal.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.methodDescription, isDark && styles.darkMutedText]}>
            {METHOD_DESCRIPTIONS[valuation.valuation_method]}
          </Text>
          
          <View style={styles.methodDetails}>
            <View style={styles.valuationRow}>
              <View style={styles.valuationItem}>
                <Text style={[styles.itemLabel, isDark && styles.darkMutedText]}>
                  Intrinsic Value:
                </Text>
                <Text style={[styles.itemValue, isDark && styles.darkText]}>
                  {formatCurrency(valuation.intrinsic_value)}
                </Text>
              </View>
              
              <View style={styles.valuationItem}>
                <Text style={[styles.itemLabel, isDark && styles.darkMutedText]}>
                  Market Value:
                </Text>
                <Text style={[styles.itemValue, isDark && styles.darkText]}>
                  {formatCurrency(valuation.market_cap)}
                </Text>
              </View>
            </View>
            
            <View style={styles.gapHeader}>
              <Text style={[styles.gapLabel, isDark && styles.darkMutedText]}>
                Valuation Gap:
              </Text>
              <Text style={[styles.gapValue, { color: valuation.gap >= 0 ? '#22c55e' : '#ef4444' }]}>
                {formatPercent(valuation.gap)} {valuation.gap >= 0 ? "Undervalued" : "Overvalued"}
              </Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${50 + (valuation.gap * 100)}%`,
                      backgroundColor: valuation.gap >= 0 ? '#22c55e' : '#ef4444'
                    }
                  ]} 
                />
              </View>
            </View>
            
            <Text style={[styles.methodWeight, isDark && styles.darkMutedText]}>
              Weight: {(METHOD_WEIGHTS[valuation.valuation_method] * 100)}% of weighted average calculation
            </Text>
          </View>
        </View>
      ))}
      
      {/* Methodology section */}
      <View style={[styles.methodologyCard, isDark && styles.darkCard]}>
        <Text style={[styles.methodologyTitle, isDark && styles.darkText]}>
          Methodology
        </Text>
        
        <Text style={[styles.methodologyDescription, isDark && styles.darkMutedText]}>
          Each valuation method calculates intrinsic value differently, considering various aspects of a company's financials.
          The weighted average combines all methods with appropriate weights to produce a balanced final estimate.
        </Text>
        
        <View style={styles.methodsList}>
          {Object.entries(METHOD_NAMES).map(([method, name]) => (
            <View key={method} style={styles.methodItem}>
              <Text style={[styles.methodItemName, isDark && styles.darkText]}>
                {name}:
              </Text>
              <Text style={[styles.methodItemDescription, isDark && styles.darkMutedText]}>
                {METHOD_DESCRIPTIONS[method]}
              </Text>
            </View>
          ))}
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
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  signalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  signalBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  confidenceText: {
    fontSize: 14,
    color: '#6b7280',
  },
  valuationSummary: {
    backgroundColor: 'rgba(243, 244, 246, 0.6)',
    borderRadius: 8,
    padding: 12,
  },
  valuationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  valuationItem: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  gapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gapLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  gapValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 4,
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
    borderRadius: 3,
  },
  methodsContainer: {
    marginBottom: 16,
  },
  methodCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  methodDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  methodDetails: {
    backgroundColor: 'rgba(243, 244, 246, 0.6)',
    borderRadius: 8,
    padding: 12,
  },
  methodWeight: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 12,
    fontStyle: 'italic',
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
  methodologyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  methodologyDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  methodsList: {
    marginBottom: 12,
  },
  methodItem: {
    marginBottom: 8,
  },
  methodItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  methodItemDescription: {
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

export default ValuationAnalysis; 