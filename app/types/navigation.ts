import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  StockDetail: { ticker: string };
  AllStockReviews: undefined;
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type StockDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StockDetail'>;
export type StockDetailScreenRouteProp = RouteProp<RootStackParamList, 'StockDetail'>;
export type AllStockReviewsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AllStockReviews'>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 