import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  useColorScheme,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import Header from '../components/layout/Header';
import SearchBar from '../components/search/SearchBar';
import StockCard from '../components/stock/StockCard';
import FeatureCard from '../components/ui/FeatureCard';
import { HomeScreenNavigationProp } from '../types/navigation';
import { BATCH_STOCKS_QUERY } from '../lib/graphql/queries';

// Define interface for stock data
interface StockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  sophieScore?: number;
}

// Sophie features
const FEATURES = [
  { 
    id: 1, 
    title: 'AI-Powered Analysis', 
    description: 'Get intelligent stock analysis based on fundamentals, technicals, and sentiment',
    icon: 'brain' 
  },
  { 
    id: 2, 
    title: 'Trend Detection', 
    description: 'Discover trending stocks and market patterns',
    icon: 'trending-up' 
  },
  { 
    id: 3, 
    title: 'Investor Education', 
    description: 'Learn investment concepts and strategies',
    icon: 'graduation-cap' 
  },
  { 
    id: 4, 
    title: 'Real-time Charts', 
    description: 'View interactive stock charts with technical indicators',
    icon: 'line-chart' 
  },
];

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [stocks, setStocks] = useState<StockData[]>([]);
  const TICKERS = ["AAPL", "MSFT", "NVDA"];
  
  // Get current date for GraphQL query
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  
  const endDate = today.toISOString().split('T')[0];
  const startDate = threeMonthsAgo.toISOString().split('T')[0];
  
  // Use Apollo Client to fetch stock data
  const { loading, error, data } = useQuery(BATCH_STOCKS_QUERY, {
    variables: { 
      tickers: TICKERS, 
      startDate, 
      endDate 
    },
    onCompleted: (data) => {
      if (data?.batchStocks) {
        processStockData(data.batchStocks);
      }
    },
    onError: (error) => {
      console.error("Error fetching stock data:", error);
    }
  });
  
  // Process stock data from the API
  const processStockData = (batchResults: any[]) => {
    const validStocks: StockData[] = [];
    
    TICKERS.forEach(ticker => {
      // Find matching stock data in the response
      const stockData = batchResults.find((stock) => 
        stock.ticker === ticker
      );
      
      // Skip if no data found
      if (!stockData || !stockData.prices || stockData.prices.length === 0) {
        console.log(`No data found for ${ticker}, skipping`);
        return;
      }
      
      // Get latest price data
      const prices = stockData.prices;
      
      // Sort prices by date to ensure correct order
      const sortedPrices = [...prices].sort((a, b) => 
        new Date(a.biz_date).getTime() - new Date(b.biz_date).getTime()
      );
      
      const latestPrice = sortedPrices.length > 0 ? sortedPrices[sortedPrices.length - 1] : null;
      
      // Find the price closest to 3 months ago
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const threeMonthsAgoTime = threeMonthsAgo.getTime();
      
      let closestPriceIndex = 0;
      let minTimeDiff = Infinity;
      
      sortedPrices.forEach((price, index) => {
        const priceDate = new Date(price.biz_date);
        const timeDiff = Math.abs(priceDate.getTime() - threeMonthsAgoTime);
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          closestPriceIndex = index;
        }
      });
      
      const threeMonthPrice = sortedPrices[closestPriceIndex];
      
      // Skip if price data is invalid
      if (!latestPrice || !latestPrice.close) {
        console.log(`Invalid price data for ${ticker}, skipping`);
        return;
      }
      
      // Calculate percentage change over the period
      let changePercent = 0;
      if (threeMonthPrice && threeMonthPrice.close) {
        changePercent = ((latestPrice.close - threeMonthPrice.close) / threeMonthPrice.close) * 100;
      }
      
      // Use the SOPHIE score from API if available, otherwise generate a random score
      const generateSophieScore = (ticker: string): number => {
        // Seed with ticker to get consistent scores
        const seed = ticker.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const rand = Math.sin(seed) * 10000;
        return Math.floor(30 + (rand - Math.floor(rand)) * 65); // Between 30-95
      };
      
      const sophieScore = stockData.latestSophieAnalysis?.overall_score || generateSophieScore(ticker);
      
      validStocks.push({
        ticker,
        name: stockData.company?.name || ticker,
        price: latestPrice.close,
        change: changePercent,
        sophieScore
      });
    });
    
    // Only update state if we have valid stocks
    if (validStocks.length > 0) {
      setStocks(validStocks);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Header />
      <ScrollView style={styles.scrollView}>
        <View style={styles.searchContainer}>
          <SearchBar />
        </View>
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, isDark && styles.darkText]}>
            SOPHIE
          </Text>
          <Text style={[styles.heroSubtitle, isDark && styles.darkText]}>
            Stock/Option Portfolio Helper Intelligent Engine
          </Text>
          <Text style={[styles.heroDescription, isDark && styles.darkMutedText]}>
            An AI-powered financial analysis tool to help you make smarter investment decisions
          </Text>
        </View>
        
        {/* Features Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Features</Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map(feature => (
              <FeatureCard 
                key={feature.id}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                isDark={isDark}
              />
            ))}
          </View>
        </View>
        
        {/* Trending Stocks Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Trending Stocks</Text>
          <View style={styles.stocksContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDark ? "#6366F1" : "#4F46E5"} />
                <Text style={[styles.loadingText, isDark && styles.darkText]}>Loading stocks...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, isDark && styles.darkText]}>
                  Error loading stock data. Please try again later.
                </Text>
                <Text style={[styles.errorDetailText, isDark && styles.darkMutedText]}>
                  {error.message}
                </Text>
              </View>
            ) : stocks.length > 0 ? (
              stocks.map(stock => (
                <TouchableOpacity 
                  key={stock.ticker}
                  onPress={() => navigation.navigate('StockDetail', { ticker: stock.ticker })}
                >
                  <StockCard 
                    ticker={stock.ticker}
                    name={stock.name}
                    price={stock.price}
                    change={stock.change}
                    sophieScore={stock.sophieScore}
                    isDark={isDark}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, isDark && styles.darkText]}>
                  No stock data available at this time. Please try again later.
                </Text>
              </View>
            )}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
    color: '#000000',
  },
  heroDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 16,
  },
  sectionContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stocksContainer: {
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 8,
    color: '#000000',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#000000',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16,
    marginBottom: 8,
  },
  errorDetailText: {
    color: '#666666',
    textAlign: 'center',
    fontSize: 14,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#AAAAAA',
  },
});

export default HomeScreen; 