import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StockCardProps {
  ticker: string;
  name: string;
  price: number;
  change: number;
  sophieScore?: number;
  isDark?: boolean;
}

const StockCard = ({ ticker, name, price, change, sophieScore, isDark = false }: StockCardProps) => {
  const isPositive = change >= 0;
  
  // Calculate the score color
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#eab308'; // yellow
    return '#ef4444'; // red
  };
  
  return (
    <View style={[styles.card, isDark && styles.darkCard]}>
      <View style={styles.stockInfo}>
        <Text style={[styles.ticker, isDark && styles.darkText]}>{ticker}</Text>
        <Text style={[styles.name, isDark && styles.darkMutedText]} numberOfLines={1}>{name}</Text>
      </View>
      
      <View style={styles.priceInfo}>
        <Text style={[styles.price, isDark && styles.darkText]}>${price.toFixed(2)}</Text>
        <Text 
          style={[
            styles.change, 
            isPositive ? styles.positiveChange : styles.negativeChange
          ]}
        >
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </Text>
      </View>
      
      {sophieScore !== undefined && (
        <View style={[
          styles.scoreIndicator, 
          { backgroundColor: getScoreColor(sophieScore) }
        ]}>
          <Text style={styles.scoreText}>{Math.round(sophieScore)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: '#222222',
  },
  stockInfo: {
    flex: 2,
    marginRight: 8,
  },
  ticker: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    color: '#666666',
  },
  priceInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: '500',
  },
  positiveChange: {
    color: '#22c55e',
  },
  negativeChange: {
    color: '#ef4444',
  },
  scoreIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#AAAAAA',
  },
});

export default StockCard; 