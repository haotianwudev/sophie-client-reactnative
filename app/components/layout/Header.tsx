import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../../types/navigation';
import ColorText from '../ui/ColorText';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightComponent?: ReactNode;
}

const Header = ({ title, subtitle, showBackButton, rightComponent }: HeaderProps) => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <View style={[styles.header, isDark && styles.darkHeader]}>
      {showBackButton ? (
        <View style={styles.backContainer}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={isDark ? '#FFFFFF' : '#111827'} 
            />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, isDark && styles.darkText]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.subtitle, isDark && styles.darkMutedText]}>{subtitle}</Text>
            )}
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={() => navigation.navigate('Home')}
          accessibilityLabel="Return to homepage"
          accessibilityHint="Double tap to go back to the homepage"
        >
          <Image 
            source={require('../../assets/images/agents/SOPHIE.png')}
            style={styles.logoImage}
          />
          <View>
            <View style={styles.titleContainer}>
              <ColorText style={styles.logoText} isDark={isDark} useGradient={true}>SOPHIE</ColorText>
              <Ionicons name="home-outline" size={14} color={isDark ? "#A78BFA" : "#8B5CF6"} style={styles.homeIcon} />
            </View>
            <Text style={[styles.logoSubtext, isDark && styles.darkMutedText]}>
              Your AI Stock Analyst • Tap to return home
            </Text>
          </View>
        </TouchableOpacity>
      )}
      
      {rightComponent && (
        <View style={styles.rightComponent}>
          {rightComponent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  darkHeader: {
    backgroundColor: '#121212',
    borderBottomColor: '#333333',
  },
  backContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 16,
  },
  homeIcon: {
    marginLeft: 4,
  },
  logoSubtext: {
    fontSize: 12,
    color: '#666666',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#AAAAAA',
  },
  rightComponent: {
    marginLeft: 'auto',
  },
});

export default Header; 