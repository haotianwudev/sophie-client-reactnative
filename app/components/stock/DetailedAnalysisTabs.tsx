import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  useColorScheme,
  ScrollView,
  Animated
} from 'react-native';
import AnalysisRadarChart from './AnalysisRadarChart';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

// Define navigation type
type RootStackParamList = {
  Home: undefined;
  StockDetail: { ticker: string };
  AllStockReviews: undefined;
  TechnicalAnalysis: { ticker: string };
  SentimentAnalysis: { ticker: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Define props for the component
interface DetailedAnalysisTabsProps {
  technicalData?: any;
  sentimentData?: any;
  fundamentalData?: any;
  valuationData?: any;
  loading?: boolean;
  ticker?: string;
}

const DetailedAnalysisTabs = ({ 
  technicalData, 
  sentimentData, 
  fundamentalData, 
  valuationData,
  loading = false,
  ticker
}: DetailedAnalysisTabsProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation<NavigationProp>();
  
  // Animated value for scroll indicator
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = React.useState(0);
  const [containerWidth, setContainerWidth] = React.useState(0);

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
    <View 
      style={[styles.container, isDark && styles.darkContainer]}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      
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

      {/* Horizontal scroll indicator */}
      <View style={styles.scrollIndicatorContainer}>
        {containerWidth > 0 && contentWidth > 0 && (
          <Animated.View 
            style={[
              styles.scrollIndicator, 
              isDark && styles.darkScrollIndicator,
              {
                width: `${(containerWidth / contentWidth) * 100}%`,
                transform: [
                  {
                    translateX: scrollX.interpolate({
                      inputRange: [0, contentWidth - containerWidth],
                      outputRange: [0, containerWidth - (containerWidth * containerWidth / contentWidth)],
                      extrapolate: 'clamp'
                    })
                  }
                ]
              }
            ]} 
          />
        )}
      </View>

      {/* Horizontally scrollable analysis cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast"
        snapToInterval={290} // Width of card + margin
        snapToAlignment="start"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onContentSizeChange={(width) => {
          setContentWidth(width);
        }}
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
              
              {/* Simplified horizontal subsection summaries */}
              <View style={styles.subsectionsContainer}>
                {/* Trend */}
                <View style={[
                  styles.subsectionSimple, 
                  isDark && styles.darkSubsectionSimple,
                  {borderLeftColor: getSignalColor(technicalData.trend_signal)}
                ]}>
                  <View style={styles.subsectionHeader}>
                    <Feather name="trending-up" size={14} color={isDark ? "#e5e7eb" : "#111827"} />
                    <Text style={[styles.subsectionTitle, isDark && styles.darkText]}>
                      Trend: <Text style={{color: getSignalColor(technicalData.trend_signal)}}>{technicalData.trend_signal.toUpperCase()}</Text>
                    </Text>
                  </View>
                </View>
                
                {/* Momentum */}
                <View style={[
                  styles.subsectionSimple, 
                  isDark && styles.darkSubsectionSimple,
                  {borderLeftColor: getSignalColor(technicalData.momentum_signal)}
                ]}>
                  <View style={styles.subsectionHeader}>
                    <MaterialCommunityIcons name="lightning-bolt" size={14} color={isDark ? "#e5e7eb" : "#111827"} />
                    <Text style={[styles.subsectionTitle, isDark && styles.darkText]}>
                      Momentum: <Text style={{color: getSignalColor(technicalData.momentum_signal)}}>{technicalData.momentum_signal.toUpperCase()}</Text>
                    </Text>
                  </View>
                </View>
                
                {/* Mean Reversion */}
                <View style={[
                  styles.subsectionSimple, 
                  isDark && styles.darkSubsectionSimple,
                  {borderLeftColor: getSignalColor(technicalData.mr_signal)}
                ]}>
                  <View style={styles.subsectionHeader}>
                    <MaterialCommunityIcons name="repeat" size={14} color={isDark ? "#e5e7eb" : "#111827"} />
                    <Text style={[styles.subsectionTitle, isDark && styles.darkText]}>
                      Mean Rev: <Text style={{color: getSignalColor(technicalData.mr_signal)}}>{technicalData.mr_signal.toUpperCase()}</Text>
                    </Text>
                  </View>
                </View>
                
                {/* Volatility */}
                <View style={[
                  styles.subsectionSimple, 
                  isDark && styles.darkSubsectionSimple,
                  {borderLeftColor: getSignalColor(technicalData.volatility_signal)}
                ]}>
                  <View style={styles.subsectionHeader}>
                    <MaterialCommunityIcons name="chart-bar" size={14} color={isDark ? "#e5e7eb" : "#111827"} />
                    <Text style={[styles.subsectionTitle, isDark && styles.darkText]}>
                      Volatility: <Text style={{color: getSignalColor(technicalData.volatility_signal)}}>{technicalData.volatility_signal.toUpperCase()}</Text>
                    </Text>
                  </View>
                </View>
                
                {/* Statistical */}
                <View style={[
                  styles.subsectionSimple, 
                  isDark && styles.darkSubsectionSimple,
                  {borderLeftColor: getSignalColor(technicalData.stat_arb_signal)}
                ]}>
                  <View style={styles.subsectionHeader}>
                    <FontAwesome name="arrows-v" size={14} color={isDark ? "#e5e7eb" : "#111827"} />
                    <Text style={[styles.subsectionTitle, isDark && styles.darkText]}>
                      Statistical: <Text style={{color: getSignalColor(technicalData.stat_arb_signal)}}>{technicalData.stat_arb_signal.toUpperCase()}</Text>
                    </Text>
                  </View>
                </View>
              </View>
              
              {ticker && (
                <TouchableOpacity 
                  style={[styles.viewMoreButton, isDark && styles.darkViewMoreButton]}
                  onPress={() => navigation.navigate('TechnicalAnalysis', { ticker })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewMoreText, isDark && styles.darkViewMoreText]}>
                    View Detailed Analysis
                  </Text>
                  <Ionicons 
                    name="chevron-forward" 
                    size={16} 
                    color={isDark ? '#FFFFFF' : '#4B5563'} 
                  />
                </TouchableOpacity>
              )}
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
              
              {ticker && (
                <TouchableOpacity 
                  style={[styles.viewMoreButton, isDark && styles.darkViewMoreButton]}
                  onPress={() => navigation.navigate('SentimentAnalysis', { ticker })}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewMoreText, isDark && styles.darkViewMoreText]}>
                    View Detailed Analysis
                  </Text>
                  <Ionicons 
                    name="chevron-forward" 
                    size={16} 
                    color={isDark ? '#FFFFFF' : '#4B5563'} 
                  />
                </TouchableOpacity>
              )}
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
  scrollIndicatorContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  scrollIndicator: {
    width: '30%',
    height: '100%',
    backgroundColor: '#9ca3af',
    borderRadius: 3,
  },
  darkScrollIndicator: {
    backgroundColor: '#4b5563',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  darkViewMoreButton: {
    backgroundColor: '#374151',
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginRight: 4,
  },
  darkViewMoreText: {
    color: '#FFFFFF',
  },
  subsectionsContainer: {
    marginVertical: 10,
  },
  subsectionSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 10,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderRadius: 4,
    backgroundColor: '#f9fafb',
  },
  darkSubsectionSimple: {
    backgroundColor: '#333333',
  },
  subsectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 6,
  },
});

export default DetailedAnalysisTabs; 