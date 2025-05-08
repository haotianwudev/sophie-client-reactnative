import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  isDark?: boolean;
}

// Map common icon names to MaterialCommunityIcons names
const iconMapping: Record<string, string> = {
  'brain': 'brain',
  'trending-up': 'trending-up',
  'graduation-cap': 'school',
  'line-chart': 'chart-line',
  'shield': 'shield',
  'users': 'account-group'
};

const FeatureCard = ({ title, description, icon, isDark = false }: FeatureCardProps) => {
  // Get the icon name from mapping or use the original if not found
  const iconName = iconMapping[icon] || icon;
  
  // Choose the icon color based on the feature
  const getIconColor = (iconName: string): string => {
    switch(iconName) {
      case 'brain':
        return '#8b5cf6'; // purple
      case 'trending-up':
        return '#3b82f6'; // blue
      case 'school':
        return '#f59e0b'; // amber
      case 'chart-line':
        return '#10b981'; // emerald
      case 'shield':
        return '#ef4444'; // red
      case 'account-group':
        return '#6366f1'; // indigo
      default:
        return '#6366f1'; // indigo as default
    }
  };
  
  return (
    <View style={[styles.card, isDark && styles.darkCard]}>
      <View style={[styles.iconContainer, { backgroundColor: getIconColor(iconName) + '20' }]}>
        <MaterialCommunityIcons 
          name={iconName as any} 
          size={22} 
          color={getIconColor(iconName)} 
        />
      </View>
      <Text style={[styles.title, isDark && styles.darkText]}>{title}</Text>
      <Text style={[styles.description, isDark && styles.darkMutedText]} numberOfLines={2}>
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#AAAAAA',
  },
});

export default FeatureCard; 