import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  useColorScheme,
  Linking,
  TouchableOpacity
} from 'react-native';
import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Define the props for sentiment data
interface SentimentData {
  biz_date: string;
  overall_signal: string;
  confidence: number;
  insider_total: number;
  insider_bullish: number;
  insider_bearish: number;
  insider_value_total: number;
  insider_value_bullish: number;
  insider_value_bearish: number;
  insider_weight: number;
  news_total: number;
  news_bullish: number;
  news_bearish: number;
  news_neutral: number;
  news_weight: number;
  weighted_bullish: number;
  weighted_bearish: number;
}

interface NewsItem {
  title: string;
  date: string;
  source: string;
  url: string;
  sentiment: string;
}

interface SentimentAnalysisProps {
  sentimentData?: SentimentData;
  newsData?: NewsItem[];
  loading?: boolean;
}

const SentimentAnalysis = ({ 
  sentimentData,
  newsData = [],
  loading = false 
}: SentimentAnalysisProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Helper functions
  // Get signal color based on value
  const getSignalColor = (signal: string): string => {
    switch(signal?.toLowerCase()) {
      case 'bullish':
      case 'positive':
        return '#22c55e'; // green
      case 'bearish':
      case 'negative':
        return '#ef4444'; // red
      case 'neutral': 
        return '#f59e0b'; // yellow
      default: 
        return '#6b7280'; // gray
    }
  };
  
  // Format large numbers (e.g., 1500000 -> 1.5M)
  const formatLargeNumber = (num: number) => {
    if (Math.abs(num) >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    } else if (Math.abs(num) >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    } else if (Math.abs(num) >= 1e3) {
      return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toLocaleString();
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

  // Calculate percentages for visualization
  const calculatePercentages = () => {
    if (!sentimentData) return { bullishPercentage: 50, bearishPercentage: 50 };
    
    const bullishPercentage = Math.round(
      (sentimentData.weighted_bullish / (sentimentData.weighted_bullish + sentimentData.weighted_bearish)) * 100
    );
    const bearishPercentage = 100 - bullishPercentage;
    
    return { bullishPercentage, bearishPercentage };
  };

  const { bullishPercentage, bearishPercentage } = calculatePercentages();
  
  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.darkContainer]}>
        <Text style={[styles.loadingText, isDark && styles.darkText]}>
          Loading sentiment analysis...
        </Text>
      </View>
    );
  }
  
  // Placeholder state
  if (!sentimentData) {
    return (
      <View style={[styles.container, isDark && styles.darkContainer]}>
        <Text style={[styles.placeholder, isDark && styles.darkMutedText]}>
          Sentiment analysis evaluates investor psychology and market perception through news, social media, and insider activity. It provides insights into market mood and how it might affect stock prices.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      {/* Overall Sentiment Section */}
      <View style={[styles.section, isDark && styles.darkSection]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            Overall Sentiment
          </Text>
          <Text style={[styles.dateText, isDark && styles.darkMutedText]}>
            {formatDateString(sentimentData.biz_date)}
          </Text>
        </View>
        
        <Text style={[styles.description, isDark && styles.darkMutedText]}>
          Sentiment analysis evaluates market perception through insider trading patterns (30% weight) and news sentiment (70% weight) to gauge overall market outlook on the stock.
        </Text>
        
        <View style={styles.signalContainer}>
          <View style={styles.signalIndicator}>
            <View style={[styles.signalDot, { backgroundColor: getSignalColor(sentimentData.overall_signal) }]} />
            <Text style={[styles.signalText, { color: getSignalColor(sentimentData.overall_signal) }]}>
              {sentimentData.overall_signal.toUpperCase()}
            </Text>
            <Text style={[styles.confidenceText, isDark && styles.darkMutedText]}>
              with {Math.round(sentimentData.confidence)}% confidence
            </Text>
          </View>
        </View>
        
        {/* Sentiment ratio bar */}
        <View style={styles.ratioContainer}>
          <View style={styles.ratioLabels}>
            <Text style={[styles.ratioLabel, isDark && styles.darkText]}>
              Bullish ({bullishPercentage}%)
            </Text>
            <Text style={[styles.ratioLabel, isDark && styles.darkText]}>
              Bearish ({bearishPercentage}%)
            </Text>
          </View>
          <View style={styles.ratioBar}>
            <View 
              style={[
                styles.ratioBullish, 
                { width: `${bullishPercentage}%` }
              ]} 
            />
            <View 
              style={[
                styles.ratioBearish, 
                { width: `${bearishPercentage}%` }
              ]} 
            />
          </View>
        </View>
      </View>
      
      {/* Insider Trading Section */}
      <View style={[styles.section, isDark && styles.darkSection]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            Insider Trading
          </Text>
          <Ionicons 
            name="information-circle-outline" 
            size={18} 
            color={isDark ? "#a3a3a3" : "#6b7280"} 
          />
        </View>
        
        <Text style={[styles.description, isDark && styles.darkMutedText]}>
          Insider trading activity represents purchases and sales by company executives, directors, and major shareholders. Strong insider buying often indicates confidence in the company's future.
        </Text>
        
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, styles.bullishCard, isDark && styles.darkBullishCard]}>
            <Text style={[styles.metricLabel, isDark && styles.darkMutedText]}>
              Bullish Transactions
            </Text>
            <Text style={[styles.metricValue, isDark && styles.darkText]}>
              {sentimentData.insider_bullish}
            </Text>
            <Text style={styles.metricSubvalue}>
              {formatLargeNumber(sentimentData.insider_value_bullish)}
            </Text>
          </View>
          
          <View style={[styles.metricCard, styles.bearishCard, isDark && styles.darkBearishCard]}>
            <Text style={[styles.metricLabel, isDark && styles.darkMutedText]}>
              Bearish Transactions
            </Text>
            <Text style={[styles.metricValue, isDark && styles.darkText]}>
              {sentimentData.insider_bearish}
            </Text>
            <Text style={styles.metricSubvalue}>
              {formatLargeNumber(sentimentData.insider_value_bearish)}
            </Text>
          </View>
        </View>
        
        <View style={[styles.summaryCard, isDark && styles.darkSummaryCard]}>
          <Text style={[styles.summaryText, isDark && styles.darkText]}>
            Latest Insider Transactions: {sentimentData.insider_total}
          </Text>
          <Text style={[styles.summaryText, isDark && styles.darkText]}>
            Net Transaction Value: {' '}
            <Text style={{ color: sentimentData.insider_value_total >= 0 ? '#22c55e' : '#ef4444' }}>
              {formatLargeNumber(sentimentData.insider_value_total)}
            </Text>
          </Text>
        </View>
      </View>
      
      {/* News Sentiment Section */}
      <View style={[styles.section, isDark && styles.darkSection]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            News Sentiment
          </Text>
          <Ionicons 
            name="information-circle-outline" 
            size={18} 
            color={isDark ? "#a3a3a3" : "#6b7280"} 
          />
        </View>
        
        <Text style={[styles.description, isDark && styles.darkMutedText]}>
          News sentiment analyzes recent articles for positive, negative, or neutral tones about the company. Media perception can significantly influence market sentiment.
        </Text>
        
        <View style={styles.newsMetricsGrid}>
          <View style={[styles.newsMetricCard, styles.bullishCard, isDark && styles.darkBullishCard]}>
            <Text style={[styles.metricLabel, isDark && styles.darkMutedText]}>
              Bullish
            </Text>
            <Text style={[styles.metricValue, isDark && styles.darkText]}>
              {sentimentData.news_bullish}
            </Text>
          </View>
          
          <View style={[styles.newsMetricCard, styles.bearishCard, isDark && styles.darkBearishCard]}>
            <Text style={[styles.metricLabel, isDark && styles.darkMutedText]}>
              Bearish
            </Text>
            <Text style={[styles.metricValue, isDark && styles.darkText]}>
              {sentimentData.news_bearish}
            </Text>
          </View>
          
          <View style={[styles.newsMetricCard, styles.neutralCard, isDark && styles.darkNeutralCard]}>
            <Text style={[styles.metricLabel, isDark && styles.darkMutedText]}>
              Neutral
            </Text>
            <Text style={[styles.metricValue, isDark && styles.darkText]}>
              {sentimentData.news_neutral}
            </Text>
          </View>
        </View>
        
        <View style={[styles.summaryCard, isDark && styles.darkSummaryCard]}>
          <Text style={[styles.summaryText, isDark && styles.darkText]}>
            Total News Articles: {sentimentData.news_total}
          </Text>
        </View>
      </View>
      
      {/* Latest News Section */}
      {newsData && newsData.length > 0 && (
        <View style={[styles.section, isDark && styles.darkSection]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
              Latest News
            </Text>
          </View>
          
          <View style={styles.newsList}>
            {newsData.slice(0, 5).map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.newsItem, isDark && styles.darkNewsItem]}
                onPress={() => Linking.openURL(item.url)}
              >
                <View style={styles.newsHeader}>
                  {item.sentiment && (
                    <View 
                      style={[
                        styles.sentimentBadge, 
                        { backgroundColor: getSignalColor(item.sentiment) }
                      ]}
                    >
                      <Text style={styles.sentimentBadgeText}>
                        {item.sentiment.toLowerCase() === 'positive' ? 'BULLISH' : 
                         item.sentiment.toLowerCase() === 'negative' ? 'BEARISH' : 
                         item.sentiment.toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.newsDate, isDark && styles.darkMutedText]}>
                    {formatDateString(item.date)}
                  </Text>
                </View>
                
                <Text style={[styles.newsTitle, isDark && styles.darkText]}>
                  {item.title}
                </Text>
                
                <Text style={[styles.newsSource, isDark && styles.darkMutedText]}>
                  {item.source}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#222222',
  },
  section: {
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
  darkSection: {
    backgroundColor: '#333333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  signalContainer: {
    marginBottom: 16,
  },
  signalIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  signalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  confidenceText: {
    fontSize: 14,
    color: '#6b7280',
  },
  ratioContainer: {
    marginBottom: 8,
  },
  ratioLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ratioLabel: {
    fontSize: 14,
    color: '#111827',
  },
  ratioBar: {
    flexDirection: 'row',
    height: 8,
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  ratioBullish: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  ratioBearish: {
    height: '100%',
    backgroundColor: '#ef4444',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricCard: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
  },
  bullishCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  darkBullishCard: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  bearishCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  darkBearishCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  neutralCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  darkNeutralCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  metricLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  metricSubvalue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  newsMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  newsMetricCard: {
    width: '31%',
    padding: 12,
    borderRadius: 8,
  },
  summaryCard: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  darkSummaryCard: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  summaryText: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  newsList: {
    marginTop: 8,
  },
  newsItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
  },
  darkNewsItem: {
    borderColor: '#4b5563',
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sentimentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sentimentBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  newsDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  newsSource: {
    fontSize: 12,
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
    padding: 12,
    lineHeight: 20,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#9ca3af',
  },
});

export default SentimentAnalysis; 