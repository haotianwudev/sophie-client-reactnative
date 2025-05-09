import React from 'react';
import { Text, StyleSheet, TextStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

interface ColorTextProps {
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
  isDark?: boolean;
  useGradient?: boolean;
}

/**
 * ColorText component displays text with a special color or gradient
 * Can display text with either a solid color or a gradient from purple to pink
 */
const ColorText: React.FC<ColorTextProps> = ({
  style,
  children,
  isDark = false,
  useGradient = false,
}) => {
  // If gradient is not needed, just return colored text
  if (!useGradient) {
    return (
      <Text style={[
        styles.text, 
        isDark ? styles.darkText : styles.lightText,
        style
      ]}>
        {children}
      </Text>
    );
  }

  // For gradient text, use MaskedView with LinearGradient
  return (
    <MaskedView
      maskElement={
        <Text style={[styles.text, style]}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={isDark ? ['#A78BFA', '#EC4899'] : ['#8B5CF6', '#EC4899']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={StyleSheet.absoluteFill}
      >
        <Text style={[styles.text, style, {opacity: 0}]}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
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