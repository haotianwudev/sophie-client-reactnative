import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FeatureCardProps {
  title: string;
  description: string;
  isDark?: boolean;
}

const FeatureCard = ({ title, description, isDark = false }: FeatureCardProps) => {
  return (
    <View style={[styles.card, isDark && styles.darkCard]}>
      <Text style={[styles.title, isDark && styles.darkText]}>{title}</Text>
      <Text style={[styles.description, isDark && styles.darkMutedText]} numberOfLines={3}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
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
  darkCard: {
    backgroundColor: '#222222',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#AAAAAA',
  },
});

export default FeatureCard; 