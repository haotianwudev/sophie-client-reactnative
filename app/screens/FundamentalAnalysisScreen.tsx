import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Text,
  useColorScheme,
  TouchableOpacity
} from 'react-native';
import FundamentalAnalysis from '../components/stock/FundamentalAnalysis';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import { GET_STOCK_FUNDAMENTALS } from '../lib/graphql/queries';
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
  FundamentalAnalysis: { ticker: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;
type Props = StackScreenProps<RootStackParamList, 'FundamentalAnalysis'>;

const FundamentalAnalysisScreen = ({ route, navigation }: Props) => {
  const { ticker } = route.params;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Fetch fundamental data
  const { data, loading, error } = useQuery(GET_STOCK_FUNDAMENTALS, {
    variables: { ticker },
    fetchPolicy: 'cache-and-network',
  });

  const fundamentalData = data?.latestFundamentals;
  
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
              <Text style={[styles.sectionTitle, isDark && styles.darkMutedText]}>Fundamental Analysis</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <FundamentalAnalysis 
            fundamentalData={fundamentalData} 
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

export default FundamentalAnalysisScreen; 