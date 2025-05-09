import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  useColorScheme,
  ScrollView
} from 'react-native';
import AnalysisRadarChart from './AnalysisRadarChart';

// Define the tab enum
export enum AnalysisDetailTab {
  TECHNICAL = 'TECHNICAL',
  SENTIMENT = 'SENTIMENT',
  FUNDAMENTAL = 'FUNDAMENTAL',
  VALUATION = 'VALUATION'
}

// Define props for the component
interface DetailedAnalysisTabsProps {
  technicalData?: any;
  sentimentData?: any;
  fundamentalData?: any;
  valuationData?: any;
  loading?: boolean;
}

const DetailedAnalysisTabs = ({ 
  technicalData, 
  sentimentData, 
  fundamentalData, 
  valuationData,
  loading = false
}: DetailedAnalysisTabsProps) => {
  const [activeTab, setActiveTab] = useState<AnalysisDetailTab>(AnalysisDetailTab.TECHNICAL);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Get signal color based on value
  const getSignalColor = (signal: string): string => {
    switch(signal?.toLowerCase()) {
      case 'bullish': return '#22c55e'; // green
      case 'bearish': return '#ef4444'; // red
      case 'neutral': return '#f59e0b'; // yellow
      default: return '#6b7280'; // gray
    }
  };

  // Determine signals for each analysis type
  const technicalSignal = technicalData?.signal || 'neutral';
  const sentimentSignal = sentimentData?.overall_signal || 'neutral';
  const fundamentalSignal = fundamentalData?.overall_signal || 'neutral';
  
  // For valuation, check if we have data and determine overall signal
  const getValuationSignal = (): string => {
    if (!valuationData || !Array.isArray(valuationData) || valuationData.length === 0) return 'neutral';
    
    // Count signals to determine overall
    const signals = valuationData.map(v => v.signal);
    const bullishCount = signals.filter(s => s?.toLowerCase() === 'bullish').length;
    const bearishCount = signals.filter(s => s?.toLowerCase() === 'bearish').length;
    
    if (bullishCount > bearishCount) return 'bullish';
    if (bearishCount > bullishCount) return 'bearish';
    return 'neutral';
  };
  
  const valuationSignal = getValuationSignal();

  // Map signal to strength level for radar chart
  const mapSignalToStrength = (signal: string, confidence?: number): string => {
    if (!signal) return 'neutral';
    
    // Default confidence if not provided
    confidence = confidence || 60;
    
    // Map to more granular strength based on signal and confidence
    switch(signal.toLowerCase()) {
      case 'bullish': 
        return confidence > 75 ? 'strong_bullish' : 'bullish';
      case 'bearish': 
        return confidence > 75 ? 'strong_bearish' : 'bearish';
      case 'neutral': 
        return 'neutral';
      default: 
        return 'neutral';
    }
  };
  
  // Get signals for radar chart
  const technicalStrength = mapSignalToStrength(technicalSignal, technicalData?.confidence);
  const sentimentStrength = mapSignalToStrength(sentimentSignal, sentimentData?.confidence);
  const fundamentalStrength = mapSignalToStrength(fundamentalSignal, fundamentalData?.confidence);
  const valuationStrength = mapSignalToStrength(valuationSignal);

  // Default content for each tab when data is missing
  const defaultContent = {
    technical: "Technical analysis examines price movements and trends using chart patterns and statistical indicators. It helps identify potential entry and exit points based on historical price behavior.",
    sentiment: "Sentiment analysis evaluates investor psychology and market perception through news, social media, and insider activity. It provides insights into market mood and how it might affect stock prices.",
    fundamental: "Fundamental analysis evaluates a company's financial health, profitability, growth prospects, and business model. It helps identify companies with strong underlying business performance.",
    valuation: "Valuation analysis determines if a stock is fairly priced by comparing its current market price to its intrinsic value calculated through various methods like DCF and multiples."
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.darkContainer]}>
        <Text style={[styles.loadingText, isDark && styles.darkText]}>
          Loading detailed analysis...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Detailed Analysis</Text>
      
      {/* Radar Chart with title */}
      <View style={styles.radarSection}>
        <Text style={[styles.radarTitle, isDark && styles.darkText]}>Analysis Strength</Text>
        <AnalysisRadarChart
          technical={technicalStrength}
          sentiment={sentimentStrength}
          fundamental={fundamentalStrength}
          valuation={valuationStrength}
          width={260}
          height={260}
        />
      </View>
      
      {/* Tabs */}      
      <View style={styles.tabButtonsContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === AnalysisDetailTab.TECHNICAL && styles.activeTabButton,
            isDark && styles.darkTabButton,
            activeTab === AnalysisDetailTab.TECHNICAL && isDark && styles.darkActiveTabButton,
            { borderLeftColor: getSignalColor(technicalSignal) }
          ]} 
          onPress={() => setActiveTab(AnalysisDetailTab.TECHNICAL)}
        >
          <View style={styles.tabButtonContent}>
            <Text 
              style={[
                styles.tabButtonText, 
                activeTab === AnalysisDetailTab.TECHNICAL && styles.activeTabButtonText,
                isDark && styles.darkTabButtonText
              ]}
            >
              Technical
            </Text>
          </View>
          <View 
            style={[
              styles.signalIndicator, 
              { backgroundColor: getSignalColor(technicalSignal) }
            ]} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === AnalysisDetailTab.SENTIMENT && styles.activeTabButton,
            isDark && styles.darkTabButton,
            activeTab === AnalysisDetailTab.SENTIMENT && isDark && styles.darkActiveTabButton,
            { borderLeftColor: getSignalColor(sentimentSignal) }
          ]} 
          onPress={() => setActiveTab(AnalysisDetailTab.SENTIMENT)}
        >
          <View style={styles.tabButtonContent}>
            <Text 
              style={[
                styles.tabButtonText, 
                activeTab === AnalysisDetailTab.SENTIMENT && styles.activeTabButtonText,
                isDark && styles.darkTabButtonText
              ]}
            >
              Sentiment
            </Text>
          </View>
          <View 
            style={[
              styles.signalIndicator, 
              { backgroundColor: getSignalColor(sentimentSignal) }
            ]} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === AnalysisDetailTab.FUNDAMENTAL && styles.activeTabButton,
            isDark && styles.darkTabButton,
            activeTab === AnalysisDetailTab.FUNDAMENTAL && isDark && styles.darkActiveTabButton,
            { borderLeftColor: getSignalColor(fundamentalSignal) }
          ]} 
          onPress={() => setActiveTab(AnalysisDetailTab.FUNDAMENTAL)}
        >
          <View style={styles.tabButtonContent}>
            <Text 
              style={[
                styles.tabButtonText, 
                activeTab === AnalysisDetailTab.FUNDAMENTAL && styles.activeTabButtonText,
                isDark && styles.darkTabButtonText
              ]}
            >
              Fundamental
            </Text>
          </View>
          <View 
            style={[
              styles.signalIndicator, 
              { backgroundColor: getSignalColor(fundamentalSignal) }
            ]} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === AnalysisDetailTab.VALUATION && styles.activeTabButton,
            isDark && styles.darkTabButton,
            activeTab === AnalysisDetailTab.VALUATION && isDark && styles.darkActiveTabButton,
            { borderLeftColor: getSignalColor(valuationSignal) }
          ]} 
          onPress={() => setActiveTab(AnalysisDetailTab.VALUATION)}
        >
          <View style={styles.tabButtonContent}>
            <Text 
              style={[
                styles.tabButtonText, 
                activeTab === AnalysisDetailTab.VALUATION && styles.activeTabButtonText,
                isDark && styles.darkTabButtonText
              ]}
            >
              Valuation
            </Text>
          </View>
          <View 
            style={[
              styles.signalIndicator, 
              { backgroundColor: getSignalColor(valuationSignal) }
            ]} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Tab Content */}
      <View style={[styles.tabContent, isDark && styles.darkTabContent]}>
        {activeTab === AnalysisDetailTab.TECHNICAL && (
          <View>
            <View style={styles.tabContentHeader}>
              <Text style={[styles.tabContentTitle, isDark && styles.darkText]}>
                Technical Analysis
              </Text>
              <View 
                style={[
                  styles.signalBadge, 
                  { backgroundColor: getSignalColor(technicalSignal) }
                ]}
              >
                <Text style={styles.signalBadgeText}>
                  {technicalSignal.toUpperCase()}
                </Text>
              </View>
            </View>

            {technicalData ? (
              <View style={styles.contentSection}>
                <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                  Technical analysis confidence: {technicalData.confidence}%
                </Text>
                <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                  Date: {technicalData.biz_date}
                </Text>
                
                <Text style={[styles.subSectionTitle, { color: getSignalColor(technicalData.trend_signal) }, isDark && styles.darkText]}>
                  Trend Analysis: {technicalData.trend_signal.toUpperCase()} 
                </Text>
                <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                  Trend score: {technicalData.trend_score}, ADX: {technicalData.adx}
                </Text>

                <Text style={[styles.subSectionTitle, { color: getSignalColor(technicalData.momentum_signal) }, isDark && styles.darkText]}>
                  Momentum: {technicalData.momentum_signal.toUpperCase()}
                </Text>
                <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                  Momentum score: {technicalData.momentum_score}, 
                  1M: {technicalData.mom_1m}%, 3M: {technicalData.mom_3m}%
                </Text>
              </View>
            ) : (
              <Text style={[styles.placeholder, isDark && styles.darkMutedText]}>
                {defaultContent.technical}
              </Text>
            )}
          </View>
        )}
        
        {activeTab === AnalysisDetailTab.SENTIMENT && (
          <View>
            <View style={styles.tabContentHeader}>
              <Text style={[styles.tabContentTitle, isDark && styles.darkText]}>
                Sentiment Analysis
              </Text>
              <View 
                style={[
                  styles.signalBadge, 
                  { backgroundColor: getSignalColor(sentimentSignal) }
                ]}
              >
                <Text style={styles.signalBadgeText}>
                  {sentimentSignal.toUpperCase()}
                </Text>
              </View>
            </View>

            {sentimentData ? (
              <View style={styles.contentSection}>
                <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                  Sentiment confidence: {sentimentData.confidence}%
                </Text>
                <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                  Date: {sentimentData.biz_date}
                </Text>
                
                <Text style={[styles.subSectionTitle, isDark && styles.darkText]}>
                  News Sentiment
                </Text>
                <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                  Total news: {sentimentData.news_total} articles
                </Text>
                <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                  Bullish: {sentimentData.news_bullish}, Bearish: {sentimentData.news_bearish}, Neutral: {sentimentData.news_neutral}
                </Text>
                
                <Text style={[styles.subSectionTitle, isDark && styles.darkText]}>
                  Insider Activity
                </Text>
                <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                  Insider transactions: {sentimentData.insider_total}
                </Text>
                <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                  Bullish: {sentimentData.insider_bullish}, Bearish: {sentimentData.insider_bearish}
                </Text>
              </View>
            ) : (
              <Text style={[styles.placeholder, isDark && styles.darkMutedText]}>
                {defaultContent.sentiment}
              </Text>
            )}
          </View>
        )}
        
        {activeTab === AnalysisDetailTab.FUNDAMENTAL && (
          <View>
            <View style={styles.tabContentHeader}>
              <Text style={[styles.tabContentTitle, isDark && styles.darkText]}>
                Fundamental Analysis
              </Text>
              <View 
                style={[
                  styles.signalBadge, 
                  { backgroundColor: getSignalColor(fundamentalSignal) }
                ]}
              >
                <Text style={styles.signalBadgeText}>
                  {fundamentalSignal.toUpperCase()}
                </Text>
              </View>
            </View>

            {fundamentalData ? (
              <View style={styles.contentSection}>
                <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                  Fundamental confidence: {fundamentalData.confidence}%
                </Text>
                <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                  Date: {fundamentalData.biz_date}
                </Text>
                
                <Text style={[styles.subSectionTitle, { color: getSignalColor(fundamentalData.profitability_signal) }, isDark && styles.darkText]}>
                  Profitability: {fundamentalData.profitability_signal.toUpperCase()}
                </Text>
                <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                  ROE: {fundamentalData.return_on_equity}%, Net Margin: {fundamentalData.net_margin}%
                </Text>
                
                <Text style={[styles.subSectionTitle, { color: getSignalColor(fundamentalData.growth_signal) }, isDark && styles.darkText]}>
                  Growth: {fundamentalData.growth_signal.toUpperCase()}
                </Text>
                <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                  Revenue Growth: {fundamentalData.revenue_growth}%, 
                  Earnings Growth: {fundamentalData.earnings_growth}%
                </Text>
                
                <Text style={[styles.subSectionTitle, { color: getSignalColor(fundamentalData.health_signal) }, isDark && styles.darkText]}>
                  Financial Health: {fundamentalData.health_signal.toUpperCase()}
                </Text>
                <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                  Current Ratio: {fundamentalData.current_ratio}, 
                  Debt/Equity: {fundamentalData.debt_to_equity}
                </Text>
              </View>
            ) : (
              <Text style={[styles.placeholder, isDark && styles.darkMutedText]}>
                {defaultContent.fundamental}
              </Text>
            )}
          </View>
        )}
        
        {activeTab === AnalysisDetailTab.VALUATION && (
          <View>
            <View style={styles.tabContentHeader}>
              <Text style={[styles.tabContentTitle, isDark && styles.darkText]}>
                Valuation Analysis
              </Text>
              <View 
                style={[
                  styles.signalBadge, 
                  { backgroundColor: getSignalColor(valuationSignal) }
                ]}
              >
                <Text style={styles.signalBadgeText}>
                  {valuationSignal.toUpperCase()}
                </Text>
              </View>
            </View>

            {valuationData && Array.isArray(valuationData) && valuationData.length > 0 ? (
              <ScrollView style={styles.contentSection}>
                {valuationData.map((valuation, index) => (
                  <View key={index} style={styles.valuationItem}>
                    <View style={styles.valuationHeader}>
                      <Text style={[styles.valuationMethod, isDark && styles.darkText]}>
                        {valuation.valuation_method}
                      </Text>
                      <View 
                        style={[
                          styles.miniSignalBadge, 
                          { backgroundColor: getSignalColor(valuation.signal) }
                        ]}
                      >
                        <Text style={styles.miniSignalText}>
                          {valuation.signal.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                      Intrinsic Value: ${parseFloat(valuation.intrinsic_value).toFixed(2)}
                    </Text>
                    <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                      Market Cap: ${parseFloat(valuation.market_cap).toFixed(2)}B
                    </Text>
                    <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                      Gap: {parseFloat(valuation.gap).toFixed(2)}%
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={[styles.placeholder, isDark && styles.darkMutedText]}>
                {defaultContent.valuation}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  darkContainer: {
    backgroundColor: '#222222',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000000',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: '#000000',
  },
  tabButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  tabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#4f46e5',
    borderLeftColor: 'transparent',
  },
  darkTabButton: {
    backgroundColor: '#374151',
  },
  darkActiveTabButton: {
    backgroundColor: '#4f46e5',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  darkTabButtonText: {
    color: '#d1d5db',
  },
  signalIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tabContent: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  darkTabContent: {
    backgroundColor: '#374151',
  },
  tabContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tabContentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  signalBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  signalBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentSection: {
    marginBottom: 12,
  },
  contentText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
  },
  valuationItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  valuationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  valuationMethod: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  miniSignalBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  miniSignalText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  placeholder: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#000000',
    alignSelf: 'center',
    padding: 20,
  },
  darkText: {
    color: '#ffffff',
  },
  darkMutedText: {
    color: '#9ca3af',
  },
  radarSection: {
    marginBottom: 16,
  },
  radarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
  },
});

export default DetailedAnalysisTabs; 