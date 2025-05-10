import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Text,
  useColorScheme,
  TouchableOpacity
} from 'react-native';
import SentimentAnalysis from '../components/stock/SentimentAnalysis';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import { GET_STOCK_SENTIMENT, GET_STOCK_DETAILS } from '../lib/graphql/queries';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import Header from '../components/layout/Header';
import { StatusBar } from 'expo-status-bar';
import Disclaimer from '../components/ui/Disclaimer';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define navigation type
type RootStackParamList = {
  Home: undefined;
  StockDetail: { ticker: string };
  AllStockReviews: undefined;
  TechnicalAnalysis: { ticker: string };
  SentimentAnalysis: { ticker: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;
type Props = StackScreenProps<RootStackParamList, 'SentimentAnalysis'>;

const SentimentAnalysisScreen = ({ route, navigation }: Props) => {
  const { ticker } = route.params;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Fetch sentiment data
  const { data: sentimentData, loading: sentimentLoading, error: sentimentError } = useQuery(GET_STOCK_SENTIMENT, {
    variables: { ticker },
    fetchPolicy: 'cache-and-network',
  });

  // Fetch stock details with news
  const currentDate = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
  
  const startDate = threeMonthsAgo.toISOString().split('T')[0];
  const endDate = currentDate.toISOString().split('T')[0];
  
  const { data: stockDetails, loading: detailsLoading } = useQuery(GET_STOCK_DETAILS, {
    variables: { 
      ticker,
      startDate,
      endDate
    },
    fetchPolicy: 'cache-and-network',
  });

  const sentiment = sentimentData?.latestSentiment;
  const news = stockDetails?.stock?.news || [];
  const loading = sentimentLoading || detailsLoading;
  
  return (
    <SafeAreaView 
      style={[styles.container, isDark && styles.darkContainer]}
      edges={['top', 'right', 'left']}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Header />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {/* Stock ticker heading */}
        <View style={[styles.stockHeading, isDark && styles.darkStockHeading]}>
          <View style={styles.headingContent}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#000"} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.ticker, isDark && styles.darkText]}>{ticker}</Text>
              <Text style={[styles.sectionTitle, isDark && styles.darkMutedText]}>Sentiment Analysis</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <SentimentAnalysis 
            sentimentData={sentiment} 
            newsData={news}
            loading={loading} 
          />
        </View>
        
        {/* SafeAreaView for bottom content including disclaimer */}
        <SafeAreaView edges={['bottom']}>
          <Disclaimer />
        </SafeAreaView>
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
  scrollViewContent: {
    flexGrow: 1,
  },
  stockHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#FFFFFF',
  },
  darkStockHeading: {
    backgroundColor: '#121212',
    borderBottomColor: '#333333',
  },
  headingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  ticker: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#AAAAAA',
  },
  sectionContainer: {
    padding: 16,
  }
});

export default SentimentAnalysisScreen; 