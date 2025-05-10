import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface CollapsibleCardProps {
  title?: string;
  initiallyExpanded?: boolean;
  children: React.ReactNode;
  titleStyle?: TextStyle;
  containerStyle?: ViewStyle;
  collapsedContainerStyle?: ViewStyle;
  expandedContainerStyle?: ViewStyle;
  isDark?: boolean;
}

const CollapsibleCard = ({ 
  title, 
  initiallyExpanded = false, 
  children, 
  titleStyle, 
  containerStyle, 
  collapsedContainerStyle,
  expandedContainerStyle,
  isDark = false 
}: CollapsibleCardProps) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const arrowAnim = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  // Animate arrow when expanded/collapsed state changes
  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    
    Animated.timing(arrowAnim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Arrow rotation based on expanded state
  const arrowRotation = arrowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  return (
    <View style={[
      styles.container,
      isDark && styles.darkContainer,
      containerStyle
    ]}>
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={toggleExpanded}
        style={[
          styles.header,
          expanded ? expandedContainerStyle : collapsedContainerStyle
        ]}
      >
        {title && (
          <Text style={[
            styles.title, 
            isDark && styles.darkTitle,
            titleStyle
          ]}>
            {title}
          </Text>
        )}
        <Animated.View
          style={{
            transform: [{ rotate: arrowRotation }]
          }}
        >
          <Ionicons 
            name="chevron-down" 
            size={22} 
            color={isDark ? '#AAAAAA' : '#666666'} 
          />
        </Animated.View>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  darkContainer: {
    backgroundColor: '#222222',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  darkTitle: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
});

export default CollapsibleCard; 