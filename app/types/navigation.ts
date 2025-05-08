import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  StockDetail: { ticker: string };
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type StockDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StockDetail'>;
export type StockDetailScreenRouteProp = RouteProp<RootStackParamList, 'StockDetail'>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 