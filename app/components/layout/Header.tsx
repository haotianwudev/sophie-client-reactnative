import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../../types/navigation';

const Header = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <View style={[styles.header, isDark && styles.darkHeader]}>
      <TouchableOpacity 
        style={styles.logoContainer}
        onPress={() => navigation.navigate('Home')}
      >
        <View style={styles.logoCircle}>
          {/* Replace with actual logo image when available */}
          <Text style={styles.logoPlaceholder}>S</Text>
        </View>
        <View>
          <Text style={[styles.logoText, isDark && styles.darkText]}>SOPHIE</Text>
          <Text style={[styles.logoSubtext, isDark && styles.darkMutedText]}>
            Stock/Option Portfolio Helper
          </Text>
        </View>
      </TouchableOpacity>
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoPlaceholder: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
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
});

export default Header; 