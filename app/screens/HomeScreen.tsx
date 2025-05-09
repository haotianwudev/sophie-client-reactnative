import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  useColorScheme,
  ActivityIndicator,
  Button,
  Platform,
  Animated,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/layout/Header';
import SearchBar from '../components/search/SearchBar';
import StockCard from '../components/stock/StockCard';
import FeatureCard from '../components/ui/FeatureCard';
import Disclaimer from '../components/ui/Disclaimer';
import { HomeScreenNavigationProp } from '../types/navigation';
import { BATCH_STOCKS_QUERY, GET_TOP_TICKERS } from '../lib/graphql/queries';
import { getGraphQLUri } from '../lib/graphql/gql-config';
import { testGraphQLConnection } from '../lib/graphql/test-connection';
import ColorText from '../components/ui/ColorText';

// Define interface for stock data
interface StockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  sophieScore?: number;
}

// Define interface for batch stock response from API
interface BatchStockResponse {
  ticker: string;
  company?: {
    name: string;
  };
  prices: {
    biz_date: string;
    close: number;
  }[];
  latestSophieAnalysis?: {
    overall_score: number;
  };
}

// Define interface for top ticker response
interface TopTickerResponse {
  ticker: string;
  score: number;
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
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [topTickers, setTopTickers] = useState<string[]>([]);
  const [tickerScores, setTickerScores] = useState<Map<string, number>>(new Map());
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const arrowAnim = React.useRef(new Animated.Value(0)).current;
  
  // Get current date for GraphQL query
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  
  const endDate = today.toISOString().split('T')[0];
  const startDate = threeMonthsAgo.toISOString().split('T')[0];
  
  // Test connection on initial load
  useEffect(() => {
    runConnectionTest();
  }, []);
  
  // Fetch top tickers first
  const { 
    loading: loadingTopTickers, 
    error: topTickersError, 
    data: topTickersData 
  } = useQuery(GET_TOP_TICKERS, {
    onCompleted: (data) => {
      if (data?.coveredTickers && data.coveredTickers.length > 0) {
        // Store the top tickers with their scores
        const topTickersWithScores = data.coveredTickers
          .slice(0, 5) // Get top 5 tickers
          .map((item: TopTickerResponse) => ({
            ticker: item.ticker,
            score: item.score
          }));
        
        // Extract just the ticker symbols for the batch query
        const tickers = topTickersWithScores.map((item: {ticker: string; score: number}) => item.ticker);
        setTopTickers(tickers);
        
        // Store the scores in a separate state to access them later
        const scoreMap = new Map<string, number>();
        topTickersWithScores.forEach((item: {ticker: string; score: number}) => {
          scoreMap.set(item.ticker, item.score);
        });
        setTickerScores(scoreMap);
        
        console.log("Top tickers fetched:", tickers);
      }
    },
    onError: (error) => {
      console.error("Error fetching top tickers:", error);
      // Fallback to a default list if we can't get the top tickers
      setTopTickers(["AAPL", "MSFT", "NVDA", "TSLA", "AMZN"]);
    }
  });
  
  // Arrow animation effect
  useEffect(() => {
    const animateArrow = () => {
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => animateArrow());
    };
    
    animateArrow();
    
    return () => {
      arrowAnim.stopAnimation();
    };
  }, []);
  
  // Arrow animation transform interpolations
  const arrowUpTransform = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3]
  });
  
  const arrowDownTransform = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3]
  });
  
  // Function to test GraphQL connection
  const runConnectionTest = async () => {
    setTestingConnection(true);
    const success = await testGraphQLConnection();
    setConnectionStatus(success);
    setTestingConnection(false);
    console.log(`GraphQL connection test: ${success ? 'SUCCESS' : 'FAILED'}`);
  };
  
  // Use Apollo Client to fetch stock data when topTickers changes
  const { loading, error, data, refetch } = useQuery(BATCH_STOCKS_QUERY, {
    variables: { 
      tickers: topTickers, 
      startDate, 
      endDate 
    },
    skip: topTickers.length === 0, // Skip this query if we don't have tickers yet
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
  const processStockData = (batchResults: BatchStockResponse[]) => {
    const validStocks: StockData[] = [];
    
    topTickers.forEach(ticker => {
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
      
      // Company name mapping for consistency
      const companyNames: Record<string, string> = {
        'AAPL': 'Apple Inc.',
        'MSFT': 'Microsoft Corporation',
        'NVDA': 'NVIDIA Corporation',
        'TSLA': 'Tesla, Inc.',
        'AMZN': 'Amazon.com, Inc.',
        'GOOGL': 'Alphabet Inc.',
        'META': 'Meta Platforms, Inc.'
      };
      
      // Get the score directly from the tickerScores map
      // This ensures we're using the scores from the coveredTickers query
      const sophieScore = tickerScores.get(ticker);
      
      // Create the validated stock data entry
      validStocks.push({
        ticker,
        name: companyNames[ticker] || stockData.company?.name || ticker,
        price: latestPrice.close,
        change: changePercent,
        sophieScore
      });
      
      // Debug log to ensure correct scores
      console.log(`Stock ${ticker}: Name=${companyNames[ticker]}, Score=${sophieScore}`);
    });
    
    // Only update state if we have valid stocks
    if (validStocks.length > 0) {
      // Sort the valid stocks to match the order of topTickers array
      const sortedStocks = [...validStocks].sort((a, b) => {
        return topTickers.indexOf(a.ticker) - topTickers.indexOf(b.ticker);
      });
      
      setStocks(sortedStocks);
    }
  };
  
  // Connection diagnostic component
  const renderConnectionDiagnostic = () => {
    if (connectionStatus === false) {
      return (
        <View style={styles.diagnosticContainer}>
          <Text style={[styles.diagnosticText, isDark && styles.darkText]}>
            Unable to connect to GraphQL server: {getGraphQLUri()}
          </Text>
          <Text style={[styles.diagnosticSubText, isDark && styles.darkMutedText]}>
            Platform: {Platform.OS} | OS Version: {Platform.Version}
          </Text>
          <View style={styles.diagnosticButtonContainer}>
            <Button 
              title={testingConnection ? "Testing..." : "Test Connection"}
              onPress={runConnectionTest}
              disabled={testingConnection}
              color="#3b82f6"
            />
            <Button 
              title="Retry Data Fetch"
              onPress={() => refetch()}
              disabled={loading}
              color="#10b981"
            />
          </View>
        </View>
      );
    }
    return null;
  };
  
  const toggleIntroVisibility = () => {
    if (showIntro) {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowIntro(false));
    } else {
      setShowIntro(true);
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
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
        
        {/* Connection diagnostic */}
        {renderConnectionDiagnostic()}
        
        {/* Collapsible SOPHIE Card */}
        {showIntro ? (
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={toggleIntroVisibility}
            accessibilityLabel="Hide SOPHIE introduction and features"
            accessibilityHint="Double tap to collapse the card"
          >
            <Animated.View style={[
              styles.card,
              isDark && styles.darkCard,
              { opacity: fadeAnim }
            ]}>
              {/* Hero Section */}
              <View style={styles.heroSection}>
                <View style={styles.heroTitleContainer}>
                  <Image 
                    source={require('../assets/images/agents/SOPHIE.png')}
                    style={{ 
                      width: 40, 
                      height: 40, 
                      marginRight: 12, 
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: isDark ? "#0EA5E9" : "#38BDF8"
                    }}
                  />
                  <ColorText style={styles.heroTitle} isDark={isDark}>
                    SOPHIE
                  </ColorText>
                </View>
                <Text style={[styles.heroSubtitle, isDark && styles.darkText]}>
                  Stock/Option Portfolio Helper for Investment and Education
                </Text>
                <Text style={[styles.heroDescription, isDark && styles.darkMutedText]}>
                  Your AI-powered financial analyst help you learn stock analysis from investment masters.
                </Text>
              </View>
              
              {/* Features Section */}
              <View style={styles.featuresContainer}>
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
              
              {/* SOPHIE Family Section */}
              <View style={styles.sophieFamilyContainer}>
                <View style={styles.imageContainer}>
                  <Image 
                    source={require('../assets/images/misc/sophie_family.png')}
                    style={[styles.sophieFamilyImage, isDark && { borderColor: '#333333', borderWidth: 1 }]}
                    resizeMode="cover"
                  />
                </View>
                <Text style={[styles.imageCaption, isDark && styles.darkMutedText]}>
                  Learn investment philosophy from legends like Warren Buffett and Charlie Munger
                </Text>
              </View>
              
              <View style={styles.expandCollapseIndicator}>
                <Animated.View 
                  style={{
                    transform: [{ translateY: arrowUpTransform }]
                  }}
                >
                  <View style={[styles.arrowUp, isDark && { borderBottomColor: '#888888' }]} />
                </Animated.View>
              </View>
            </Animated.View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.collapsedCard, isDark && styles.darkCollapsedCard]} 
            onPress={toggleIntroVisibility}
            accessibilityLabel="Show SOPHIE introduction and features"
            accessibilityHint="Double tap to expand the card"
          >
            <View style={styles.collapsedTitleContainer}>
              <Image 
                source={require('../assets/images/agents/SOPHIE.png')}
                style={{ 
                  width: 32, 
                  height: 32, 
                  marginRight: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: isDark ? "#0EA5E9" : "#38BDF8"
                }}
              />
              <ColorText style={styles.collapsedCardTitle} isDark={isDark}>
                SOPHIE
              </ColorText>
            </View>
            <Animated.View 
              style={{
                transform: [{ translateY: arrowDownTransform }]
              }}
            >
              <View style={[styles.arrowDown, isDark && { borderTopColor: '#888888' }]} />
            </Animated.View>
          </TouchableOpacity>
        )}
        
        {/* Trending Stocks Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Trending Stocks</Text>
          <View style={styles.stocksContainer}>
            {loadingTopTickers || (loading && topTickers.length > 0) ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDark ? "#6366F1" : "#4F46E5"} />
                <Text style={[styles.loadingText, isDark && styles.darkText]}>Loading stocks...</Text>
              </View>
            ) : error || topTickersError ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, isDark && styles.darkText]}>
                  Error loading stock data. Please try again later.
                </Text>
                <Text style={[styles.errorDetailText, isDark && styles.darkMutedText]}>
                  {error?.message || topTickersError?.message}
                </Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => refetch()}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
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
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => refetch()}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        {/* Disclaimer added to the bottom of Home Screen */}
        <Disclaimer />
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
  diagnosticContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFEDD5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F97316',
  },
  diagnosticText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9A3412',
    marginBottom: 8,
  },
  diagnosticSubText: {
    fontSize: 12,
    color: '#9A3412',
    marginBottom: 12,
  },
  diagnosticButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    paddingBottom: 16,
  },
  darkCard: {
    backgroundColor: '#222222',
  },
  collapsedCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  darkCollapsedCard: {
    backgroundColor: '#222222',
  },
  collapsedCardTitle: {
    fontSize: 24,
  },
  collapsedCardSubtitle: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#888888',
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  heroTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
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
    marginBottom: 8,
  },
  tapToHideText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#888888',
    marginTop: 8,
  },
  expandCollapseIndicator: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  arrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderTopWidth: 12,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#666666',
  },
  arrowUp: {
    width: 0, 
    height: 0,
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderBottomWidth: 12,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#666666',
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#AAAAAA',
  },
  featuresContainer: {
    paddingHorizontal: 16,
  },
  collapsedTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  investmentMastersContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  investmentMastersImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
  },
  imageCaption: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  darkInvestmentMastersContainer: {
    backgroundColor: '#222222',
  },
  sophieFamilyContainer: {
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
    padding: 0,
  },
  sophieFamilyImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
  },
  familySectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
});

export default HomeScreen; 