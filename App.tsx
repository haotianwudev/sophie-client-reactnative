import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './app/lib/graphql/apollo-client';

// Import screens
import HomeScreen from './app/screens/HomeScreen';
import StockDetailScreen from './app/screens/StockDetailScreen';
import AllStockReviewsScreen from './app/screens/AllStockReviewsScreen';
import TechnicalAnalysisScreen from './app/screens/TechnicalAnalysisScreen';
import SentimentAnalysisScreen from './app/screens/SentimentAnalysisScreen';
import FundamentalAnalysisScreen from './app/screens/FundamentalAnalysisScreen';

// Create stack navigator
type RootStackParamList = {
  Home: undefined;
  StockDetail: { ticker: string };
  AllStockReviews: undefined;
  TechnicalAnalysis: { ticker: string };
  SentimentAnalysis: { ticker: string };
  FundamentalAnalysis: { ticker: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="StockDetail" component={StockDetailScreen} />
            <Stack.Screen name="AllStockReviews" component={AllStockReviewsScreen} />
            <Stack.Screen name="TechnicalAnalysis" component={TechnicalAnalysisScreen} />
            <Stack.Screen name="SentimentAnalysis" component={SentimentAnalysisScreen} />
            <Stack.Screen name="FundamentalAnalysis" component={FundamentalAnalysisScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ApolloProvider>
  );
}
