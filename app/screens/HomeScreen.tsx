import React, { useState, useEffect, useCallback } from 'react';
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
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/layout/Header';
import StockCard from '../components/stock/StockCard';
import FeatureCard from '../components/ui/FeatureCard';
import Disclaimer from '../components/ui/Disclaimer';
import { HomeScreenNavigationProp } from '../types/navigation';
import { BATCH_STOCKS_QUERY, GET_TOP_TICKERS } from '../lib/graphql/queries';
import { getGraphQLUri } from '../lib/graphql/gql-config';
import { testGraphQLConnection } from '../lib/graphql/test-connection';
import ColorText from '../components/ui/ColorText';
import { getBookmarkedTickers, toggleBookmark } from '../utils/bookmarkHelper';
import { calculate3MonthChange } from '../utils/stockCalculations';

// Define interface for stock data
interface StockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  sophieScore?: number;
  isBookmarked?: boolean;
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

// Define tab options
enum TabOption {
  TRENDING = 'trending',
  BOOKMARKED = 'bookmarked',
  VIEW_ALL = 'view_all'
}

// Sophie features
const FEATURES = [
  { 
    id: 1, 
    title: 'AI-Powered Analysis', 
    description: 'Smart analysis using Large Language Models',
  },
  { 
    id: 2, 
    title: 'Investment Education', 
    description: 'Thorough methodological explanations',
  },
  { 
    id: 3, 
    title: 'Investment Masters', 
    description: 'Insights from Buffett and Munger philosophies',
  },
  { 
    id: 4, 
    title: 'Periodic Stock Reviews', 
    description: 'Not just one-time analysis! Update periodically.',
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
  
  // Bookmark related states
  const [bookmarkedTickers, setBookmarkedTickers] = useState<string[]>([]);
  const [bookmarkedStocks, setBookmarkedStocks] = useState<StockData[]>([]);
  const [activeTab, setActiveTab] = useState<TabOption>(TabOption.TRENDING);
  const showBookmarked = activeTab === TabOption.BOOKMARKED;
  
  // Get current date for GraphQL query
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  
  const endDate = today.toISOString().split('T')[0];
  const startDate = threeMonthsAgo.toISOString().split('T')[0];
  
  // Refresh bookmarks and bookmarked stocks when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshBookmarks = async () => {
        const bookmarks = await getBookmarkedTickers();
        setBookmarkedTickers(bookmarks);
        
        // If we're in bookmarked view and have bookmarks, refetch the bookmarked stocks
        if (showBookmarked && bookmarks.length > 0) {
          refetchBookmarked();
        } else if (showBookmarked && bookmarks.length === 0) {
          setBookmarkedStocks([]);
        }
        
        // Also update the bookmarked status in the trending stocks list
        setStocks(prevStocks => 
          prevStocks.map(stock => ({
            ...stock,
            isBookmarked: bookmarks.includes(stock.ticker)
          }))
        );
      };
      
      refreshBookmarks();
    }, [showBookmarked])
  );
  
  // Initial load of bookmarked tickers
  useEffect(() => {
    const loadBookmarks = async () => {
      const bookmarks = await getBookmarkedTickers();
      setBookmarkedTickers(bookmarks);
    };
    
    loadBookmarks();
  }, []);
  
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
  
  // Fetch data for bookmarked tickers
  const { 
    loading: loadingBookmarkedStocks, 
    error: bookmarkedStocksError, 
    data: bookmarkedStocksData,
    refetch: refetchBookmarked
  } = useQuery(BATCH_STOCKS_QUERY, {
    variables: { 
      tickers: bookmarkedTickers, 
      startDate, 
      endDate 
    },
    skip: bookmarkedTickers.length === 0, // Skip this query if no bookmarks
    onCompleted: (data) => {
      if (data?.batchStocks) {
        processBookmarkedStockData(data.batchStocks);
      }
    },
    onError: (error) => {
      console.error("Error fetching bookmarked stock data:", error);
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
      
      // Get latest price and calculate 3-month change using utility function
      const prices = stockData.prices;
      const sortedPrices = [...prices].sort((a, b) => 
        new Date(a.biz_date).getTime() - new Date(b.biz_date).getTime()
      );
      
      const latestPrice = sortedPrices.length > 0 ? sortedPrices[sortedPrices.length - 1] : null;
      
      // Skip if price data is invalid
      if (!latestPrice || !latestPrice.close) {
        console.log(`Invalid price data for ${ticker}, skipping`);
        return;
      }
      
      // Calculate percentage change using utility function
      const changePercent = calculate3MonthChange(prices);
      
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
      const sophieScore = tickerScores.get(ticker);
      
      // Check if the stock is bookmarked
      const isBookmarked = bookmarkedTickers.includes(ticker);
      
      // Create the validated stock data entry
      validStocks.push({
        ticker,
        name: companyNames[ticker] || stockData.company?.name || ticker,
        price: latestPrice.close,
        change: changePercent,
        sophieScore,
        isBookmarked
      });
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
  
  // Process bookmarked stock data from the API
  const processBookmarkedStockData = (batchResults: BatchStockResponse[]) => {
    const validStocks: StockData[] = [];
    
    bookmarkedTickers.forEach(ticker => {
      // Find matching stock data in the response
      const stockData = batchResults.find((stock) => 
        stock.ticker === ticker
      );
      
      // Skip if no data found
      if (!stockData || !stockData.prices || stockData.prices.length === 0) {
        console.log(`No data found for ${ticker}, skipping`);
        return;
      }
      
      // Get latest price and calculate change using utility function
      const prices = stockData.prices;
      const sortedPrices = [...prices].sort((a, b) => 
        new Date(a.biz_date).getTime() - new Date(b.biz_date).getTime()
      );
      
      const latestPrice = sortedPrices.length > 0 ? sortedPrices[sortedPrices.length - 1] : null;
      
      // Skip if price data is invalid
      if (!latestPrice || !latestPrice.close) {
        console.log(`Invalid price data for ${ticker}, skipping`);
        return;
      }
      
      // Calculate percentage change using utility function
      const changePercent = calculate3MonthChange(prices);
      
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
      
      // Get the score from the response
      const sophieScore = stockData.latestSophieAnalysis?.overall_score;
      
      // Create the validated stock data entry
      validStocks.push({
        ticker,
        name: companyNames[ticker] || stockData.company?.name || ticker,
        price: latestPrice.close,
        change: changePercent,
        sophieScore,
        isBookmarked: true
      });
    });
    
    // Only update state if we have valid stocks
    if (validStocks.length > 0) {
      setBookmarkedStocks(validStocks);
    }
  };
  
  // Handle bookmark toggle
  const handleToggleBookmark = async (ticker: string) => {
    await toggleBookmark(ticker);
    
    // Update local bookmarked tickers list
    const updatedBookmarks = await getBookmarkedTickers();
    setBookmarkedTickers(updatedBookmarks);
    
    // Update isBookmarked flag in stocks list
    setStocks(prevStocks => 
      prevStocks.map(stock => 
        stock.ticker === ticker 
          ? {...stock, isBookmarked: updatedBookmarks.includes(ticker)} 
          : stock
      )
    );
    
    // If the bookmarked stock is removed and we're in bookmarked view, refetch bookmarked stocks
    if (showBookmarked && !updatedBookmarks.includes(ticker)) {
      if (updatedBookmarks.length > 0) {
        refetchBookmarked();
      } else {
        setBookmarkedStocks([]);
      }
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

  // Determine current stocks list to display
  const currentStocks = showBookmarked ? bookmarkedStocks : stocks;
  const isLoadingStocks = showBookmarked 
    ? loadingBookmarkedStocks && bookmarkedTickers.length > 0
    : loadingTopTickers || (loading && topTickers.length > 0);
  const stocksError = showBookmarked ? bookmarkedStocksError : error || topTickersError;

  // Handle tab change
  const handleTabChange = (tab: TabOption) => {
    if (tab === TabOption.VIEW_ALL) {
      navigation.navigate('AllStockReviews');
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Header />
      <ScrollView style={styles.scrollView}>
        
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
        
        {/* AI Stock Reviews Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
            AI Stock Reviews
          </Text>
          
          {/* Tabs */}
          <View style={[styles.tabContainer, isDark && styles.darkTabContainer]}>
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === TabOption.TRENDING && styles.activeTab,
                activeTab === TabOption.TRENDING && (isDark ? styles.darkActiveTab : {})
              ]}
              onPress={() => handleTabChange(TabOption.TRENDING)}
            >
              <Ionicons 
                name="trending-up" 
                size={18} 
                color={activeTab === TabOption.TRENDING 
                  ? (isDark ? '#FFFFFF' : '#6D28D9') 
                  : (isDark ? '#AAAAAA' : '#666666')} 
                style={styles.tabIcon}
              />
              <Text 
                style={[
                  styles.tabText, 
                  activeTab === TabOption.TRENDING && styles.activeTabText,
                  isDark && (activeTab === TabOption.TRENDING ? styles.darkActiveTabText : styles.darkTabText)
                ]}
              >
                Trending
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === TabOption.BOOKMARKED && styles.activeTab,
                activeTab === TabOption.BOOKMARKED && (isDark ? styles.darkActiveTab : {})
              ]}
              onPress={() => handleTabChange(TabOption.BOOKMARKED)}
            >
              <Ionicons 
                name="bookmark" 
                size={18} 
                color={activeTab === TabOption.BOOKMARKED 
                  ? (isDark ? '#FFFFFF' : '#6D28D9') 
                  : (isDark ? '#AAAAAA' : '#666666')} 
                style={styles.tabIcon}
              />
              <Text 
                style={[
                  styles.tabText, 
                  activeTab === TabOption.BOOKMARKED && styles.activeTabText,
                  isDark && (activeTab === TabOption.BOOKMARKED ? styles.darkActiveTabText : styles.darkTabText)
                ]}
              >
                Bookmarked
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tab, 
                activeTab === TabOption.VIEW_ALL && styles.activeTab,
                activeTab === TabOption.VIEW_ALL && (isDark ? styles.darkActiveTab : {})
              ]}
              onPress={() => handleTabChange(TabOption.VIEW_ALL)}
            >
              <Ionicons 
                name="list" 
                size={18} 
                color={activeTab === TabOption.VIEW_ALL 
                  ? (isDark ? '#FFFFFF' : '#6D28D9') 
                  : (isDark ? '#AAAAAA' : '#666666')} 
                style={styles.tabIcon}
              />
              <Text 
                style={[
                  styles.tabText, 
                  activeTab === TabOption.VIEW_ALL && styles.activeTabText,
                  isDark && (activeTab === TabOption.VIEW_ALL ? styles.darkActiveTabText : styles.darkTabText)
                ]}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.stocksContainer}>
            {isLoadingStocks ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDark ? "#6366F1" : "#4F46E5"} />
                <Text style={[styles.loadingText, isDark && styles.darkText]}>Loading stocks...</Text>
              </View>
            ) : stocksError ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, isDark && styles.darkText]}>
                  Error loading stock data. Please try again later.
                </Text>
                <Text style={[styles.errorDetailText, isDark && styles.darkMutedText]}>
                  {stocksError?.message}
                </Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => showBookmarked ? refetchBookmarked() : refetch()}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : currentStocks.length > 0 ? (
              currentStocks.map(stock => (
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
                    isBookmarked={stock.isBookmarked}
                    onToggleBookmark={handleToggleBookmark}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, isDark && styles.darkText]}>
                  {showBookmarked 
                    ? "No bookmarked stocks yet. Bookmark some stocks to see them here." 
                    : "No stock data available at this time. Please try again later."}
                </Text>
                {showBookmarked && (
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => navigation.navigate('AllStockReviews')}
                  >
                    <Text style={styles.retryButtonText}>View All Stock Reviews</Text>
                  </TouchableOpacity>
                )}
                {!showBookmarked && (
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => refetch()}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                )}
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
    fontSize: 24,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  toggleLabel: {
    fontSize: 12,
    marginRight: 6,
    color: '#666666',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  darkViewAllButton: {
    backgroundColor: '#312E81',
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6D28D9',
    marginRight: 4,
  },
  darkViewAllButtonText: {
    color: '#A78BFA',
  },
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  darkTabContainer: {
    backgroundColor: '#1F2937',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#EDE9FE',
    borderBottomWidth: 2,
    borderBottomColor: '#6D28D9',
  },
  darkActiveTab: {
    backgroundColor: '#312E81',
    borderBottomColor: '#A78BFA',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  activeTabText: {
    color: '#6D28D9',
    fontWeight: 'bold',
  },
  darkTabText: {
    color: '#AAAAAA',
  },
  darkActiveTabText: {
    color: '#FFFFFF',
  },
});

export default HomeScreen; 