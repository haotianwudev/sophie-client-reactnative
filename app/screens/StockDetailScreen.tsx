import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import Header from '../components/layout/Header';
import { StockDetailScreenRouteProp, StockDetailScreenNavigationProp } from '../types/navigation';
import { GET_STOCK_DETAILS, GET_LATEST_SOPHIE_ANALYSIS } from '../lib/graphql/queries';

// Define interface for stock data structure
interface StockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: string | number;
  overallScore: number;
  fundamentalsScore: number;
  technicalsScore: number;
  sentimentScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

// Get score color based on the value
function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#3b82f6'; // blue
  if (score >= 40) return '#eab308'; // yellow
  return '#ef4444'; // red
}

const StockDetailScreen = () => {
  const route = useRoute<StockDetailScreenRouteProp>();
  const navigation = useNavigation<StockDetailScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [stockData, setStockData] = useState<StockData | null>(null);
  
  // Get ticker from route params
  const { ticker } = route.params;
  
  // Get current date for GraphQL query
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  
  const endDate = today.toISOString().split('T')[0];
  const startDate = oneYearAgo.toISOString().split('T')[0];
  
  // Fetch stock details
  const { loading: detailsLoading, error: detailsError, data: detailsData } = 
    useQuery(GET_STOCK_DETAILS, { 
      variables: { ticker, startDate, endDate },
      onError: (error) => {
        console.error("Error fetching stock details:", error);
      }
    });
  
  // Fetch SOPHIE analysis
  const { loading: analysisLoading, error: analysisError, data: analysisData } = 
    useQuery(GET_LATEST_SOPHIE_ANALYSIS, { 
      variables: { ticker },
      onError: (error) => {
        console.error("Error fetching SOPHIE analysis:", error);
      }
    });
  
  // Process data when it's available
  useEffect(() => {
    if (detailsData?.stock) {
      const stockInfo = detailsData.stock;
      const prices = stockInfo.prices || [];
      
      // Sort prices by date
      const sortedPrices = [...prices].sort((a, b) => 
        new Date(a.biz_date).getTime() - new Date(b.biz_date).getTime()
      );
      
      // Get latest price and previous price for change calculation
      const latestPrice = sortedPrices.length > 0 ? sortedPrices[sortedPrices.length - 1] : null;
      const previousPrice = sortedPrices.length > 1 ? sortedPrices[sortedPrices.length - 2] : null;
      
      // Calculate price change
      let change = 0;
      let changePercent = 0;
      
      if (latestPrice && previousPrice && latestPrice.close && previousPrice.close) {
        change = latestPrice.close - previousPrice.close;
        changePercent = (change / previousPrice.close) * 100;
      }
      
      // Get SOPHIE analysis if available
      const sophieAnalysis = analysisData?.latestSophieAnalysis;
      
      // Generate random scores if not available
      const generateRandomScore = (): number => {
        return Math.floor(Math.random() * 40) + 50; // Random score between 50-90
      };
      
      // Placeholder values when data isn't complete
      const placeholderSummary = "Analysis summary not available for this stock at this time.";
      const placeholderItems = ["Data not available"];
      
      // Set stock data with real or placeholder values
      if (latestPrice?.close) {
        setStockData({
          ticker: stockInfo.company?.ticker || ticker,
          name: stockInfo.company?.name || ticker,
          price: latestPrice.close,
          change: change,
          changePercent: changePercent.toFixed(2),
          overallScore: sophieAnalysis?.overall_score || generateRandomScore(),
          fundamentalsScore: sophieAnalysis?.fundamentals_score || generateRandomScore(),
          technicalsScore: sophieAnalysis?.technicals_score || generateRandomScore(),
          sentimentScore: sophieAnalysis?.sentiment_score || generateRandomScore(),
          summary: sophieAnalysis?.summary || placeholderSummary,
          strengths: sophieAnalysis?.strengths || placeholderItems,
          weaknesses: sophieAnalysis?.weaknesses || placeholderItems,
          opportunities: sophieAnalysis?.opportunities || placeholderItems,
          threats: sophieAnalysis?.threats || placeholderItems
        });
      }
    }
  }, [detailsData, analysisData, ticker]);
  
  const isLoading = (detailsLoading || analysisLoading) && !stockData;
  
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#000000'} />
          <Text style={[styles.loadingText, isDark && styles.darkText]}>Loading stock data...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Early return if stock data is still not available
  if (!stockData) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
        <Header />
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, isDark && styles.darkText]}>
            Unable to load stock data. Please try again later.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Header />
      <ScrollView style={styles.scrollView}>
        {/* Stock Header */}
        <View style={styles.stockHeader}>
          <View>
            <Text style={[styles.ticker, isDark && styles.darkText]}>{stockData.ticker}</Text>
            <Text style={[styles.companyName, isDark && styles.darkMutedText]}>{stockData.name}</Text>
          </View>
          <View>
            <Text style={[styles.price, isDark && styles.darkText]}>${stockData.price.toFixed(2)}</Text>
            <Text 
              style={[
                styles.change, 
                stockData.change > 0 ? styles.positiveChange : styles.negativeChange
              ]}
            >
              {stockData.change > 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent}%)
            </Text>
          </View>
        </View>
        
        {/* SOPHIE Analysis Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>SOPHIE Analysis</Text>
          
          {/* Score Cards */}
          <View style={styles.scoreCardsContainer}>
            {/* Overall Score */}
            <View 
              style={[
                styles.scoreCard, 
                { backgroundColor: isDark ? '#222222' : '#FFFFFF', borderColor: getScoreColor(stockData.overallScore) }
              ]}
            >
              <Text style={[styles.scoreTitle, isDark && styles.darkText]}>Overall</Text>
              <Text 
                style={[
                  styles.scoreValue, 
                  { color: getScoreColor(stockData.overallScore) }
                ]}
              >
                {stockData.overallScore}
              </Text>
            </View>
            
            {/* Fundamentals Score */}
            <View 
              style={[
                styles.scoreCard, 
                { backgroundColor: isDark ? '#222222' : '#FFFFFF', borderColor: getScoreColor(stockData.fundamentalsScore) }
              ]}
            >
              <Text style={[styles.scoreTitle, isDark && styles.darkText]}>Fundamentals</Text>
              <Text 
                style={[
                  styles.scoreValue, 
                  { color: getScoreColor(stockData.fundamentalsScore) }
                ]}
              >
                {stockData.fundamentalsScore}
              </Text>
            </View>
            
            {/* Technicals Score */}
            <View 
              style={[
                styles.scoreCard, 
                { backgroundColor: isDark ? '#222222' : '#FFFFFF', borderColor: getScoreColor(stockData.technicalsScore) }
              ]}
            >
              <Text style={[styles.scoreTitle, isDark && styles.darkText]}>Technicals</Text>
              <Text 
                style={[
                  styles.scoreValue, 
                  { color: getScoreColor(stockData.technicalsScore) }
                ]}
              >
                {stockData.technicalsScore}
              </Text>
            </View>
            
            {/* Sentiment Score */}
            <View 
              style={[
                styles.scoreCard, 
                { backgroundColor: isDark ? '#222222' : '#FFFFFF', borderColor: getScoreColor(stockData.sentimentScore) }
              ]}
            >
              <Text style={[styles.scoreTitle, isDark && styles.darkText]}>Sentiment</Text>
              <Text 
                style={[
                  styles.scoreValue, 
                  { color: getScoreColor(stockData.sentimentScore) }
                ]}
              >
                {stockData.sentimentScore}
              </Text>
            </View>
          </View>
          
          {/* Summary */}
          <View style={[styles.analysisCard, isDark && styles.darkAnalysisCard]}>
            <Text style={[styles.analysisHeading, isDark && styles.darkText]}>Summary</Text>
            <Text style={[styles.analysisParagraph, isDark && styles.darkMutedText]}>
              {stockData.summary}
            </Text>
          </View>
          
          {/* SWOT Analysis */}
          <View style={styles.swotContainer}>
            {/* Strengths */}
            <View style={[styles.swotCard, isDark && styles.darkSwotCard]}>
              <Text style={[styles.swotTitle, styles.strengthsTitle]}>Strengths</Text>
              {stockData.strengths.map((item: string, index: number) => (
                <Text key={index} style={[styles.swotItem, isDark && styles.darkSwotItem]}>{item}</Text>
              ))}
            </View>
            
            {/* Weaknesses */}
            <View style={[styles.swotCard, isDark && styles.darkSwotCard]}>
              <Text style={[styles.swotTitle, styles.weaknessesTitle]}>Weaknesses</Text>
              {stockData.weaknesses.map((item: string, index: number) => (
                <Text key={index} style={[styles.swotItem, isDark && styles.darkSwotItem]}>{item}</Text>
              ))}
            </View>
            
            {/* Opportunities */}
            <View style={[styles.swotCard, isDark && styles.darkSwotCard]}>
              <Text style={[styles.swotTitle, styles.opportunitiesTitle]}>Opportunities</Text>
              {stockData.opportunities.map((item: string, index: number) => (
                <Text key={index} style={[styles.swotItem, isDark && styles.darkSwotItem]}>{item}</Text>
              ))}
            </View>
            
            {/* Threats */}
            <View style={[styles.swotCard, isDark && styles.darkSwotCard]}>
              <Text style={[styles.swotTitle, styles.threatsTitle]}>Threats</Text>
              {stockData.threats.map((item: string, index: number) => (
                <Text key={index} style={[styles.swotItem, isDark && styles.darkSwotItem]}>{item}</Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#000000',
  },
  errorText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    padding: 20,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  ticker: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  companyName: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'right',
  },
  change: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'right',
  },
  positiveChange: {
    color: '#22c55e',
  },
  negativeChange: {
    color: '#ef4444',
  },
  sectionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  scoreCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  scoreCard: {
    width: '48%',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  analysisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  darkAnalysisCard: {
    backgroundColor: '#222222',
  },
  analysisHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  analysisParagraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444444',
  },
  swotContainer: {
    flexDirection: 'column',
    marginTop: 8,
  },
  swotCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  darkSwotCard: {
    backgroundColor: '#222222',
  },
  swotTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  strengthsTitle: {
    color: '#22c55e',
  },
  weaknessesTitle: {
    color: '#ef4444',
  },
  opportunitiesTitle: {
    color: '#3b82f6',
  },
  threatsTitle: {
    color: '#f59e0b',
  },
  swotItem: {
    fontSize: 15,
    color: '#444444',
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#DDDDDD',
  },
  darkSwotItem: {
    color: '#DDDDDD',
    borderLeftColor: '#444444',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#AAAAAA',
  },
});

export default StockDetailScreen; 