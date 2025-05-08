import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  useColorScheme 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useQuery, gql } from '@apollo/client';
import Header from '../components/layout/Header';
import SearchBar from '../components/search/SearchBar';
import StockCard from '../components/stock/StockCard';
import FeatureCard from '../components/ui/FeatureCard';
import { HomeScreenNavigationProp } from '../types/navigation';

// Mock trending stocks data (replace with actual API call later)
const TRENDING_STOCKS = [
  { ticker: 'AAPL', name: 'Apple Inc.', price: 184.92, change: 1.25, sophieScore: 85 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', price: 417.50, change: 2.5, sophieScore: 82 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 118.20, change: -0.75, sophieScore: 78 },
];

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

// GraphQL query for trending stocks (to be implemented)
const GET_TRENDING_STOCKS = gql`
  query GetTrendingStocks {
    trendingStocks {
      ticker
      name
      lastPrice
      priceChange
      sophieScore
    }
  }
`;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Later replace this with actual API data
  // const { loading, error, data } = useQuery(GET_TRENDING_STOCKS);
  
  const navigateToStock = (ticker: string) => {
    navigation.navigate('StockDetail', { ticker });
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
            {TRENDING_STOCKS.map(stock => (
              <TouchableOpacity 
                key={stock.ticker}
                onPress={() => navigateToStock(stock.ticker)}
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
            ))}
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
    gap: 12,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#AAAAAA',
  },
});

export default HomeScreen; 