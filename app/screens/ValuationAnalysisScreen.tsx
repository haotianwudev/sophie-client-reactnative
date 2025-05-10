import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Text,
  useColorScheme,
  TouchableOpacity
} from 'react-native';
import ValuationAnalysis from '../components/stock/ValuationAnalysis';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@apollo/client';
import { GET_STOCK_VALUATIONS } from '../lib/graphql/queries';
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
  ValuationAnalysis: { ticker: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;
type Props = StackScreenProps<RootStackParamList, 'ValuationAnalysis'>;

const ValuationAnalysisScreen = ({ route }: Props) => {
  const { ticker } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Fetch valuation data
  const { loading, error, data } = useQuery(GET_STOCK_VALUATIONS, {
    variables: { ticker },
  });

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Header />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={isDark ? '#FFFFFF' : '#000000'} 
            />
          </TouchableOpacity>
          
          <Text style={[styles.title, isDark && styles.darkText]}>
            Valuation Analysis
          </Text>
          
          <ValuationAnalysis 
            valuationData={data?.latestValuations}
            loading={loading}
          />
          
          <Disclaimer />
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
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  darkText: {
    color: '#FFFFFF',
  },
});

export default ValuationAnalysisScreen; 