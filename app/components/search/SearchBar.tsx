import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  useColorScheme,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../../types/navigation';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const handleSearch = () => {
    if (searchQuery.trim().length > 0) {
      // Assuming the search is for a stock ticker
      navigation.navigate('StockDetail', { ticker: searchQuery.trim().toUpperCase() });
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={[
        styles.searchBar,
        isDark && styles.darkSearchBar,
        Platform.OS === 'ios' && styles.iosShadow,
      ]}>
        <TextInput
          style={[styles.input, isDark && styles.darkInput]}
          placeholder="Search for stocks..."
          placeholderTextColor={isDark ? '#888888' : '#999999'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  darkSearchBar: {
    backgroundColor: '#333333',
    borderColor: '#444444',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    height: '100%',
  },
  darkInput: {
    color: '#FFFFFF',
  },
  searchButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#6366F1',
    borderRadius: 6,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  iosShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }
});

export default SearchBar; 