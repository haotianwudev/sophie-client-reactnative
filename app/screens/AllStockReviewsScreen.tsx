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
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/layout/Header';
import StockCard from '../components/stock/StockCard';
import Disclaimer from '../components/ui/Disclaimer';
import { AllStockReviewsScreenNavigationProp } from '../types/navigation';
import { GET_ALL_COVERED_STOCKS, BATCH_STOCKS_QUERY } from '../lib/graphql/queries';
import { getBookmarkedTickers, toggleBookmark } from '../utils/bookmarkHelper';

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

// Define interface for covered ticker response
interface CoveredTickerResponse {
  ticker: string;
  score: number;
}

const AllStockReviewsScreen = () => {
  const navigation = useNavigation<AllStockReviewsScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [allTickers, setAllTickers] = useState<string[]>([]);
  const [tickerScores, setTickerScores] = useState<Map<string, number>>(new Map());
  const [bookmarkedTickers, setBookmarkedTickers] = useState<string[]>([]);
  
  // Load bookmarked tickers on initial load
  useEffect(() => {
    const loadBookmarks = async () => {
      const bookmarks = await getBookmarkedTickers();
      setBookmarkedTickers(bookmarks);
    };
    
    loadBookmarks();
  }, []);
  
  // Get current date for GraphQL query
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  
  const endDate = today.toISOString().split('T')[0];
  const startDate = threeMonthsAgo.toISOString().split('T')[0];
  
  // Fetch all covered tickers
  const { 
    loading: loadingAllTickers, 
    error: allTickersError, 
    data: allTickersData 
  } = useQuery(GET_ALL_COVERED_STOCKS, {
    onCompleted: (data) => {
      if (data?.coveredTickers && data.coveredTickers.length > 0) {
        // Sort tickers alphabetically
        const sortedTickersData = [...data.coveredTickers].sort((a, b) => 
          a.ticker.localeCompare(b.ticker)
        );
        
        // Extract just the ticker symbols for the batch query
        const tickers = sortedTickersData.map((item: CoveredTickerResponse) => item.ticker);
        setAllTickers(tickers);
        
        // Store the scores in a separate state to access them later
        const scoreMap = new Map<string, number>();
        sortedTickersData.forEach((item: CoveredTickerResponse) => {
          scoreMap.set(item.ticker, item.score);
        });
        setTickerScores(scoreMap);
        
        console.log("All tickers fetched:", tickers);
      }
    },
    onError: (error) => {
      console.error("Error fetching all tickers:", error);
    }
  });
  
  // Use Apollo Client to fetch stock data when allTickers changes
  const { loading, error, data, refetch } = useQuery(BATCH_STOCKS_QUERY, {
    variables: { 
      tickers: allTickers, 
      startDate, 
      endDate 
    },
    skip: allTickers.length === 0, // Skip this query if we don't have tickers yet
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
    
    allTickers.forEach(ticker => {
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
      // Sort the valid stocks alphabetically by ticker
      const sortedStocks = [...validStocks].sort((a, b) => {
        return a.ticker.localeCompare(b.ticker);
      });
      
      setStocks(sortedStocks);
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
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Header />
      
      <ScrollView style={styles.scrollView}>
        {/* Title */}
        <Text style={[styles.pageTitle, isDark && styles.darkText]}>
          All Stock Reviews
        </Text>
        
        {/* Stocks List */}
        <View style={styles.stocksContainer}>
          {loadingAllTickers || (loading && allTickers.length > 0) ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={isDark ? "#6366F1" : "#4F46E5"} />
              <Text style={[styles.loadingText, isDark && styles.darkText]}>Loading stocks...</Text>
            </View>
          ) : error || allTickersError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, isDark && styles.darkText]}>
                Error loading stock data. Please try again later.
              </Text>
              <Text style={[styles.errorDetailText, isDark && styles.darkMutedText]}>
                {error?.message || allTickersError?.message}
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
                  isBookmarked={stock.isBookmarked}
                  onToggleBookmark={handleToggleBookmark}
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
        
        {/* Disclaimer */}
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
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    color: '#000000',
  },
  stocksContainer: {
    paddingHorizontal: 16,
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
});

export default AllStockReviewsScreen; 