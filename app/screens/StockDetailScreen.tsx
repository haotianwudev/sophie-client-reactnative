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
import { 
  GET_STOCK_DETAILS, 
  GET_LATEST_SOPHIE_ANALYSIS, 
  GET_LATEST_AGENT_SIGNAL,
  GET_STOCK_TECHNICALS,
  GET_STOCK_SENTIMENT,
  GET_STOCK_FUNDAMENTALS,
  GET_STOCK_VALUATIONS
} from '../lib/graphql/queries';
import StockAnalysisSummary from '../components/stock/StockAnalysisSummary';
import InvestmentMasterAnalysis, { AgentSignal } from '../components/stock/InvestmentMasterAnalysis';
import DetailedAnalysisTabs from '../components/stock/DetailedAnalysisTabs';
import StockInfoSections from '../components/stock/StockInfoSections';
import Disclaimer from '../components/ui/Disclaimer';
import { Ionicons } from '@expo/vector-icons';
import { getBookmarkedTickers, toggleBookmark } from '../utils/bookmarkHelper';
import { calculate3MonthChange, sortPricesByDate } from '../utils/stockCalculations';

// Define interface for stock data structure
interface StockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: string | number;
}

// Define tabs for analysis view
enum AnalysisTab {
  SOPHIE = 'SOPHIE',
  MASTERS = 'MASTERS'
}

const StockDetailScreen = () => {
  const route = useRoute<StockDetailScreenRouteProp>();
  const navigation = useNavigation<StockDetailScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [activeTab, setActiveTab] = useState<AnalysisTab>(AnalysisTab.SOPHIE);
  const [currentMaster, setCurrentMaster] = useState<string>('warren_buffett');
  const [masterData, setMasterData] = useState<Record<string, AgentSignal>>({});
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Get ticker from route params
  const { ticker } = route.params;
  
  // Check if the stock is bookmarked
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      const bookmarks = await getBookmarkedTickers();
      setIsBookmarked(bookmarks.includes(ticker));
    };
    
    checkBookmarkStatus();
  }, [ticker]);
  
  // Handle bookmark toggle
  const handleToggleBookmark = async () => {
    await toggleBookmark(ticker);
    const bookmarks = await getBookmarkedTickers();
    setIsBookmarked(bookmarks.includes(ticker));
  };
  
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
  const { loading: sophieLoading, error: sophieError, data: sophieData } = 
    useQuery(GET_LATEST_SOPHIE_ANALYSIS, { 
      variables: { ticker },
      onError: (error) => {
        console.error("Error fetching SOPHIE analysis:", error);
      }
    });
  
  // Fetch Warren Buffett analysis
  const { loading: buffettLoading, error: buffettError, data: buffettData } = 
    useQuery(GET_LATEST_AGENT_SIGNAL, { 
      variables: { ticker, agent: "warren_buffett" },
      onError: (error) => {
        console.error("Error fetching Warren Buffett analysis:", error);
      }
    });
  
  // Fetch Charlie Munger analysis
  const { loading: mungerLoading, error: mungerError, data: mungerData } = 
    useQuery(GET_LATEST_AGENT_SIGNAL, { 
      variables: { ticker, agent: "charlie_munger" },
      onError: (error) => {
        console.error("Error fetching Charlie Munger analysis:", error);
      }
    });
  
  // Fetch Cathie Wood analysis
  const { loading: woodLoading, error: woodError, data: woodData } = 
    useQuery(GET_LATEST_AGENT_SIGNAL, { 
      variables: { ticker, agent: "cathie_wood" },
      onError: (error) => {
        console.error("Error fetching Cathie Wood analysis:", error);
      }
    });
  
  // Fetch Stanley Druckenmiller analysis
  const { loading: druckenmillerLoading, error: druckenmillerError, data: druckenmillerData } = 
    useQuery(GET_LATEST_AGENT_SIGNAL, { 
      variables: { ticker, agent: "stanley_druckenmiller" },
      onError: (error) => {
        console.error("Error fetching Stanley Druckenmiller analysis:", error);
      }
    });
  
  // Fetch Ben Graham analysis
  const { loading: grahamLoading, error: grahamError, data: grahamData } = 
    useQuery(GET_LATEST_AGENT_SIGNAL, { 
      variables: { ticker, agent: "ben_graham" },
      onError: (error) => {
        console.error("Error fetching Ben Graham analysis:", error);
      }
    });
  
  // Fetch technical analysis data
  const { loading: technicalsLoading, error: technicalsError, data: technicalsData } = 
    useQuery(GET_STOCK_TECHNICALS, { 
      variables: { ticker },
      onError: (error) => {
        console.error("Error fetching technicals analysis:", error);
      }
    });
  
  // Fetch sentiment analysis data
  const { loading: sentimentLoading, error: sentimentError, data: sentimentData } = 
    useQuery(GET_STOCK_SENTIMENT, { 
      variables: { ticker },
      onError: (error) => {
        console.error("Error fetching sentiment analysis:", error);
      }
    });
  
  // Fetch fundamental analysis data
  const { loading: fundamentalsLoading, error: fundamentalsError, data: fundamentalsData } = 
    useQuery(GET_STOCK_FUNDAMENTALS, { 
      variables: { ticker },
      onError: (error) => {
        console.error("Error fetching fundamentals analysis:", error);
      }
    });
  
  // Fetch valuation data
  const { loading: valuationsLoading, error: valuationsError, data: valuationsData } = 
    useQuery(GET_STOCK_VALUATIONS, { 
      variables: { ticker },
      onError: (error) => {
        console.error("Error fetching valuations data:", error);
      }
    });
  
  // Process stock data when it's available
  useEffect(() => {
    if (detailsData?.stock) {
      const stockInfo = detailsData.stock;
      const prices = stockInfo.prices || [];
      
      // Calculate 3-month change using utility function
      const changePercent = calculate3MonthChange(prices);
      
      // Get latest price from sorted prices
      const sortedPrices = sortPricesByDate(prices);
      const latestPrice = sortedPrices.length > 0 ? sortedPrices[sortedPrices.length - 1] : null;
      
      // Set stock data with real values
      if (latestPrice?.close) {
        setStockData({
          ticker: stockInfo.company?.ticker || ticker,
          name: stockInfo.company?.name || ticker,
          price: latestPrice.close,
          change: changePercent,
          changePercent: changePercent.toFixed(2)
        });
      }
    }
  }, [detailsData, ticker]);
  
  // Process master data when available
  useEffect(() => {
    const newMasterData: Record<string, AgentSignal> = { ...masterData };
    
    if (buffettData?.latestAgentSignal) {
      newMasterData['warren_buffett'] = buffettData.latestAgentSignal;
    }
    
    if (mungerData?.latestAgentSignal) {
      newMasterData['charlie_munger'] = mungerData.latestAgentSignal;
    }
    
    if (woodData?.latestAgentSignal) {
      newMasterData['cathie_wood'] = woodData.latestAgentSignal;
    }
    
    if (druckenmillerData?.latestAgentSignal) {
      newMasterData['stanley_druckenmiller'] = druckenmillerData.latestAgentSignal;
    }
    
    if (grahamData?.latestAgentSignal) {
      newMasterData['ben_graham'] = grahamData.latestAgentSignal;
    }
    
    if (Object.keys(newMasterData).length > 0) {
      setMasterData(newMasterData);
      
      // Initialize currentMaster if not already set
      if (!masterData[currentMaster] && newMasterData[Object.keys(newMasterData)[0]]) {
        setCurrentMaster(Object.keys(newMasterData)[0]);
      }
    }
  }, [buffettData, mungerData, woodData, druckenmillerData, grahamData]);
  
  const isLoading = (detailsLoading || sophieLoading) && !stockData;
  const isMasterLoading = (
    buffettLoading || 
    mungerLoading || 
    woodLoading || 
    druckenmillerLoading || 
    grahamLoading
  ) && Object.keys(masterData).length === 0;
  
  const isDetailedAnalysisLoading = technicalsLoading || sentimentLoading || fundamentalsLoading || valuationsLoading;
  
  // Prepare SOPHIE analysis data for the component
  const sophieAnalysis = sophieData?.latestSophieAnalysis;
  
  // Map API signals to more specific strength values for the radar chart
  const mapToStrengthLevel = (signal: string): string => {
    if (!signal) return 'neutral';
    
    // For now, just use the base signal levels
    // This could be extended with more nuanced mapping based on confidence values
    switch(signal.toLowerCase()) {
      case 'bullish': 
        return 'bullish'; // Or 'strong_bullish' based on confidence
      case 'bearish': 
        return 'bearish'; // Or 'strong_bearish' based on confidence
      case 'neutral': 
        return 'neutral';
      default: 
        return 'neutral';
    }
  };
  
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
  
  const handleTabChange = (tab: AnalysisTab) => {
    setActiveTab(tab);
  };
  
  const handleMasterChange = (master: string) => {
    setCurrentMaster(master);
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
      <ScrollView 
        style={[styles.container, isDark && styles.darkContainer]}
        showsVerticalScrollIndicator={false}
      >
        {detailsLoading ? (
          <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#111827'} />
        ) : detailsError ? (
          <Text style={[styles.errorText, isDark && styles.darkText]}>
            Error loading stock details
          </Text>
        ) : detailsData?.stock ? (
          <>
            <StockInfoSections
              company={detailsData.stock.company}
              financialMetrics={detailsData.stock.financialMetricsLatest}
              prices={detailsData.stock.prices}
              price={stockData.price}
              change={stockData.change}
              changePercent={stockData.changePercent}
              ticker={stockData.ticker}
              name={stockData.name}
              isBookmarked={isBookmarked}
              onToggleBookmark={handleToggleBookmark}
            />
            
            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === AnalysisTab.SOPHIE && styles.activeTab,
                  isDark && styles.darkTab,
                  activeTab === AnalysisTab.SOPHIE && isDark && styles.darkActiveTab
                ]}
                onPress={() => handleTabChange(AnalysisTab.SOPHIE)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === AnalysisTab.SOPHIE && styles.activeTabText,
                    isDark && styles.darkTabText
                  ]}
                >
                  SOPHIE
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === AnalysisTab.MASTERS && styles.activeTab,
                  isDark && styles.darkTab,
                  activeTab === AnalysisTab.MASTERS && isDark && styles.darkActiveTab
                ]}
                onPress={() => handleTabChange(AnalysisTab.MASTERS)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === AnalysisTab.MASTERS && styles.activeTabText,
                    isDark && styles.darkTabText
                  ]}
                >
                  Investment Masters
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Analysis Content */}
            <View style={styles.sectionContainer}>
              {activeTab === AnalysisTab.SOPHIE ? (
                <>
                  {/* SOPHIE Analysis */}
                  <StockAnalysisSummary 
                    sophieData={sophieAnalysis || defaultSophieData}
                    loading={sophieLoading && !sophieAnalysis}
                  />
                  
                  {/* Detailed Analysis Tabs */}
                  <DetailedAnalysisTabs
                    technicalData={technicalsData?.latestTechnicals}
                    sentimentData={sentimentData?.latestSentiment}
                    fundamentalData={fundamentalsData?.latestFundamentals}
                    valuationData={valuationsData?.latestValuations}
                    loading={isDetailedAnalysisLoading}
                    ticker={stockData?.ticker}
                  />
                </>
              ) : (
                // Investment Masters Analysis
                <InvestmentMasterAnalysis 
                  currentAgent={currentMaster ? masterData[currentMaster] : null}
                  allAgentSignals={masterData}
                  loading={isMasterLoading}
                  onSelectAgent={handleMasterChange}
                />
              )}
            </View>
            
            {/* Disclaimer */}
            <Disclaimer />
          </>
        ) : (
          <Text style={[styles.errorText, isDark && styles.darkText]}>
            Error loading stock details
          </Text>
        )}
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
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  activeTab: {
    backgroundColor: '#4f46e5',
  },
  darkTab: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  darkActiveTab: {
    backgroundColor: '#4f46e5',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  darkTabText: {
    color: '#d1d5db',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  priceSection: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  bookmarkButton: {
    padding: 4,
    alignSelf: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeLabel: {
    fontSize: 10,
    marginLeft: 2,
    color: '#666666',
  },
});

export default StockDetailScreen;
