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
import { gql, useQuery } from '@apollo/client';
import Header from '../components/layout/Header';
import { StockDetailScreenRouteProp, StockDetailScreenNavigationProp } from '../types/navigation';

// GraphQL queries for stock data (to be implemented with actual API)
const GET_STOCK_DETAILS = gql`
  query GetStockDetails($ticker: String!, $startDate: String!, $endDate: String!) {
    stock(ticker: $ticker) {
      ticker
      name
      prices(start_date: $startDate, end_date: $endDate) {
        biz_date
        close
      }
    }
  }
`;

const GET_LATEST_SOPHIE_ANALYSIS = gql`
  query GetLatestSophieAnalysis($ticker: String!) {
    latestSophieAnalysis(ticker: $ticker) {
      biz_date
      overall_score
      fundamentals_score
      technicals_score
      sentiment_score
      summary
      strengths
      weaknesses
      opportunities
      threats
    }
  }
`;

// Mock analysis data (replace with API data)
const MOCK_ANALYSIS = {
  ticker: 'AAPL',
  name: 'Apple Inc.',
  price: 184.92,
  change: 2.75,
  changePercent: 1.5,
  overallScore: 85,
  fundamentalsScore: 87,
  technicalsScore: 82,
  sentimentScore: 79,
  summary: 'Apple Inc. continues to show strong financial performance with robust product ecosystem and steady growth in services revenue. The company maintains healthy cash reserves and consistent shareholder returns.',
  strengths: [
    'Strong brand loyalty and ecosystem',
    'Robust services revenue growth',
    'Healthy balance sheet with significant cash reserves',
    'Consistent dividend and share repurchase program'
  ],
  weaknesses: [
    'Slowing hardware sales growth',
    'Increasing regulatory scrutiny',
    'High dependency on iPhone sales'
  ],
  opportunities: [
    'Expansion into new product categories',
    'Growth in emerging markets',
    'Developments in artificial intelligence and AR/VR'
  ],
  threats: [
    'Intense competition in all product categories',
    'Supply chain vulnerabilities',
    'Macroeconomic uncertainties'
  ]
};

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
  
  // Get ticker from route params
  const { ticker } = route.params;
  
  // Get current date for GraphQL query
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  
  const endDate = today.toISOString().split('T')[0];
  const startDate = oneYearAgo.toISOString().split('T')[0];
  
  // Later replace with actual API data
  // const { loading: detailsLoading, error: detailsError, data: detailsData } = 
  //   useQuery(GET_STOCK_DETAILS, { variables: { ticker, startDate, endDate } });
  
  // const { loading: analysisLoading, error: analysisError, data: analysisData } = 
  //   useQuery(GET_LATEST_SOPHIE_ANALYSIS, { variables: { ticker } });
  
  // Use mock data for now
  const stockData = MOCK_ANALYSIS;
  const isLoading = false;
  
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
              {stockData.strengths.map((item, index) => (
                <Text key={index} style={[styles.swotItem, isDark && styles.darkSwotItem]}>{item}</Text>
              ))}
            </View>
            
            {/* Weaknesses */}
            <View style={[styles.swotCard, isDark && styles.darkSwotCard]}>
              <Text style={[styles.swotTitle, styles.weaknessesTitle]}>Weaknesses</Text>
              {stockData.weaknesses.map((item, index) => (
                <Text key={index} style={[styles.swotItem, isDark && styles.darkSwotItem]}>{item}</Text>
              ))}
            </View>
            
            {/* Opportunities */}
            <View style={[styles.swotCard, isDark && styles.darkSwotCard]}>
              <Text style={[styles.swotTitle, styles.opportunitiesTitle]}>Opportunities</Text>
              {stockData.opportunities.map((item, index) => (
                <Text key={index} style={[styles.swotItem, isDark && styles.darkSwotItem]}>{item}</Text>
              ))}
            </View>
            
            {/* Threats */}
            <View style={[styles.swotCard, isDark && styles.darkSwotCard]}>
              <Text style={[styles.swotTitle, styles.threatsTitle]}>Threats</Text>
              {stockData.threats.map((item, index) => (
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
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  ticker: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  companyName: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  price: {
    fontSize: 24,
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  scoreCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scoreCard: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreTitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
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