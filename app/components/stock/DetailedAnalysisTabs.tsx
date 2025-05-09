import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  useColorScheme,
  ScrollView
} from 'react-native';
import AnalysisRadarChart from './AnalysisRadarChart';

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
      
      {/* Radar Chart with title */}
      <View style={styles.radarSection}>
        <AnalysisRadarChart
          technical={technicalStrength}
          sentiment={sentimentStrength}
          fundamental={fundamentalStrength}
          valuation={valuationStrength}
          width={260}
          height={260}
        />
      </View>
      
      {/* Section title */}
      <View style={styles.sectionTitleContainer}>
        <Text style={[styles.sectionSubtitle, isDark && styles.darkMutedText]}>
          Scroll horizontally to view all analyses
        </Text>
      </View>

      {/* Horizontally scrollable analysis cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast"
        snapToInterval={290} // Width of card + margin
        snapToAlignment="start"
      >
        {/* Technical Analysis Card */}
        <View 
          style={[
            styles.analysisCard, 
            isDark && styles.darkCard,
            { borderTopColor: getSignalColor(technicalSignal) }
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, isDark && styles.darkText]}>
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
            <View style={styles.cardContent}>
              <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                Confidence: {technicalData.confidence}%
              </Text>
              <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                Date: {technicalData.biz_date}
              </Text>
              
              <Text style={[styles.subSectionTitle, { color: getSignalColor(technicalData.trend_signal) }]}>
                Trend Analysis: {technicalData.trend_signal.toUpperCase()} 
              </Text>
              <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                Trend score: {technicalData.trend_score}, ADX: {technicalData.adx}
              </Text>

              <Text style={[styles.subSectionTitle, { color: getSignalColor(technicalData.momentum_signal) }]}>
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

        {/* Sentiment Analysis Card */}
        <View 
          style={[
            styles.analysisCard, 
            isDark && styles.darkCard,
            { borderTopColor: getSignalColor(sentimentSignal) }
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, isDark && styles.darkText]}>
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
            <View style={styles.cardContent}>
              <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                Confidence: {sentimentData.confidence}%
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
                Bullish: {sentimentData.news_bullish}, Bearish: {sentimentData.news_bearish}
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

        {/* Fundamental Analysis Card */}
        <View 
          style={[
            styles.analysisCard, 
            isDark && styles.darkCard,
            { borderTopColor: getSignalColor(fundamentalSignal) }
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, isDark && styles.darkText]}>
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
            <View style={styles.cardContent}>
              <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                Confidence: {fundamentalData.confidence}%
              </Text>
              <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                Date: {fundamentalData.biz_date}
              </Text>
              
              <Text style={[styles.subSectionTitle, isDark && styles.darkText]}>
                Growth Metrics
              </Text>
              <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                Revenue growth: {fundamentalData.revenue_growth}%, EPS growth: {fundamentalData.eps_growth}%
              </Text>
              
              <Text style={[styles.subSectionTitle, isDark && styles.darkText]}>
                Profitability
              </Text>
              <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                Gross margin: {fundamentalData.gross_margin}%, Operating margin: {fundamentalData.operating_margin}%
              </Text>
              <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                ROE: {fundamentalData.roe}%, ROA: {fundamentalData.roa}%
              </Text>
            </View>
          ) : (
            <Text style={[styles.placeholder, isDark && styles.darkMutedText]}>
              {defaultContent.fundamental}
            </Text>
          )}
        </View>

        {/* Valuation Analysis Card */}
        <View 
          style={[
            styles.analysisCard, 
            isDark && styles.darkCard,
            { borderTopColor: getSignalColor(valuationSignal) }
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, isDark && styles.darkText]}>
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
            <View style={styles.cardContent}>
              <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                Date: {valuationData[0].biz_date}
              </Text>
              
              {valuationData.map((val, index) => (
                <View key={index} style={styles.valuationItem}>
                  <Text style={[styles.subSectionTitle, isDark && styles.darkText]}>
                    {val.metric_name}
                  </Text>
                  <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                    Value: {val.value} ({val.signal.toUpperCase()})
                  </Text>
                  <Text style={[styles.contentText, isDark && styles.darkMutedText]}>
                    Peers: {val.peer_avg}, Sector: {val.sector_avg}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.placeholder, isDark && styles.darkMutedText]}>
              {defaultContent.valuation}
            </Text>
          )}
        </View>
      </ScrollView>
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
  sectionTitleContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  scrollContainer: {
    paddingBottom: 12,
  },
  analysisCard: {
    width: 280,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    marginRight: 10,
    borderTopWidth: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  darkCard: {
    backgroundColor: '#333333',
  },
  cardHeader: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  cardContent: {
    padding: 12,
  },
  signalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  signalBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  contentText: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 4,
  },
  darkMutedText: {
    color: '#9ca3af',
  },
  placeholder: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    padding: 12,
  },
  darkText: {
    color: '#FFFFFF',
  },
  radarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#000000',
  },
  valuationItem: {
    marginBottom: 8,
  },
});

export default DetailedAnalysisTabs; 