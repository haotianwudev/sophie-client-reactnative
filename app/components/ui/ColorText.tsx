import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface ColorTextProps {
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
  isDark?: boolean;
}

/**
 * ColorText component displays text with a special color
 * A simpler alternative to gradient text for SOPHIE title
 */
const ColorText: React.FC<ColorTextProps> = ({
  style,
  children,
  isDark = false,
}) => {
  return (
    <Text style={[
      styles.text, 
      isDark ? styles.darkText : styles.lightText,
      style
    ]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontWeight: 'bold',
  },
  lightText: {
    color: '#8B5CF6', // purple-600 color
  },
  darkText: {
    color: '#A78BFA', // purple-400 color (lighter for dark mode)
  }
});

export default ColorText; 