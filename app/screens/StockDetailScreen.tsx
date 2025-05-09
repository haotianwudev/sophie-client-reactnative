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
import StockAnalysisSummary from '../components/stock/StockAnalysisSummary';

// Define interface for stock data structure
interface StockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: string | number;
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
      
      // Set stock data with real values
      if (latestPrice?.close) {
        setStockData({
          ticker: stockInfo.company?.ticker || ticker,
          name: stockInfo.company?.name || ticker,
          price: latestPrice.close,
          change: change,
          changePercent: changePercent.toFixed(2)
        });
      }
    }
  }, [detailsData, ticker]);
  
  const isLoading = (detailsLoading || analysisLoading) && !stockData;
  
  // Prepare SOPHIE analysis data for the component
  const sophieAnalysis = analysisData?.latestSophieAnalysis;
  
  // Default SOPHIE data when no data is available
  const defaultSophieData = {
    signal: "neutral",
    confidence: 60,
    overall_score: 55,
    reasoning: `This stock presents a mixed picture. Please review detailed market data for more informed analysis.`,
    short_term_outlook: "Neutral with caution recommended",
    medium_term_outlook: "Potential for improvement based on upcoming catalysts",
    long_term_outlook: "Consider within a diversified portfolio",
    bullish_factors: ["Strong financials", "Market leadership", "Innovation potential"],
    bearish_factors: ["Valuation concerns", "Competitive pressures", "Regulatory risks"],
    risks: ["Market volatility", "Sector rotation", "Macroeconomic headwinds"],
    model_name: "sophie",
    model_display_name: "SOPHIE"
  };
  
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
        
        {/* Disclaimer */}
        <View style={[styles.disclaimerContainer, isDark && styles.darkDisclaimerContainer]}>
          <Text style={[styles.disclaimerText, isDark && styles.darkMutedText]}>
            <Text style={styles.disclaimerBold}>Disclaimer:</Text> SOPHIE analysis is for educational purposes only,
            intended for people to learn more about finance, but not giving financial advice.
            All suggestions are generated by AI models.
          </Text>
        </View>
        
        {/* SOPHIE Analysis Section */}
        <View style={styles.sectionContainer}>
          <StockAnalysisSummary 
            sophieData={sophieAnalysis || defaultSophieData}
            loading={analysisLoading && !sophieAnalysis}
          />
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
  disclaimerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  darkDisclaimerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
  },
  disclaimerBold: {
    fontWeight: 'bold',
  },
  sectionContainer: {
    padding: 16,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#AAAAAA',
  },
});

export default StockDetailScreen; 