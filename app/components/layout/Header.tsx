import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../../types/navigation';
import ColorText from '../ui/ColorText';
import { Ionicons } from '@expo/vector-icons';

const Header = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <View style={[styles.header, isDark && styles.darkHeader]}>
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
});

export default Header; 