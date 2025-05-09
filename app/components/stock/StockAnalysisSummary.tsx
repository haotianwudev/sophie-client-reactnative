import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  useColorScheme,
  TouchableOpacity
} from 'react-native';
import { base64ToImageSource } from '../../utils/imageHelpers';

// Base64 encoded SOPHIE logo (purple gradient with "S" initial)
const SOPHIE_LOGO = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFRyYW5zZm9ybT0icm90YXRlKDEzNSkiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM3ZTIyY2UiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZGI0NmJkIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+UzwvdGV4dD48L3N2Zz4=';

// Base64 encoded placeholder (lighter purple gradient with "S" initial)
const SOPHIE_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFRyYW5zZm9ybT0icm90YXRlKDEzNSkiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2NzNhYjciIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjOWMyN2IwIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMTAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+UzwvdGV4dD48L3N2Zz4=';

interface SophieAnalysisProps {
  sophieData: {
    signal: string;
    confidence: number;
    overall_score: number;
    reasoning: string;
    short_term_outlook: string;
    medium_term_outlook: string;
    long_term_outlook: string;
    bullish_factors: string[];
    bearish_factors: string[];
    risks: string[];
    model_name: string;
    model_display_name: string;
  };
  loading?: boolean;
}

// Get signal color based on the value
const getSignalColor = (signal: string): string => {
  switch(signal?.toLowerCase()) {
    case 'bullish': return '#22c55e'; // green
    case 'bearish': return '#ef4444'; // red
    case 'neutral': return '#f59e0b'; // yellow
    default: return '#6b7280'; // gray
  }
};

// Get comment bubble style
const getCommentBubbleStyle = (signal: string, isDark: boolean) => {
  const baseStyles = {
    backgroundColor: isDark ? '#222222' : '#f8f9fa',
    borderColor: isDark ? '#333333' : '#e2e8f0',
    textColor: isDark ? '#ffffff' : '#111827'
  };

  switch (signal.toLowerCase()) {
    case 'bullish':
      return {
        backgroundColor: isDark ? '#052e16' : '#dcfce7',
        borderColor: isDark ? '#16a34a' : '#22c55e',
        textColor: isDark ? '#4ade80' : '#166534'
      };
    case 'bearish':
      return {
        backgroundColor: isDark ? '#450a0a' : '#fee2e2',
        borderColor: isDark ? '#dc2626' : '#ef4444',
        textColor: isDark ? '#f87171' : '#991b1b'
      };
    case 'neutral':
      return {
        backgroundColor: isDark ? '#451a03' : '#fef3c7',
        borderColor: isDark ? '#d97706' : '#f59e0b',
        textColor: isDark ? '#fbbf24' : '#92400e'
      };
    default:
      return baseStyles;
  }
};

// Get score color based on the value
const getScoreColor = (score: number): string => {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#3b82f6'; // blue
  if (score >= 40) return '#f59e0b'; // yellow
  return '#ef4444'; // red
};

export const StockAnalysisSummary = ({ sophieData, loading = false }: SophieAnalysisProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const commentStyle = getCommentBubbleStyle(sophieData.signal, isDark);

  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.darkContainer]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, isDark && styles.darkText]}>Loading SOPHIE Analysis...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      {/* Header with SOPHIE logo and score */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={base64ToImageSource(SOPHIE_LOGO)}
            style={styles.sophieImage}
            defaultSource={base64ToImageSource(SOPHIE_PLACEHOLDER)}
          />
          <View>
            <Text style={[styles.sophieTitle, isDark && styles.darkText]}>SOPHIE</Text>
            <Text style={[styles.confidenceText, isDark && styles.darkMutedText]}>
              Confidence: {sophieData.confidence}%
            </Text>
          </View>
        </View>
        <View style={styles.scoreContainer}>
          <View style={[
            styles.scoreBox, 
            { 
              borderColor: getScoreColor(sophieData.overall_score),
              backgroundColor: isDark ? '#222222' : '#FFFFFF'
            }
          ]}>
            <Text style={[styles.scoreText, { color: getScoreColor(sophieData.overall_score) }]}>
              {sophieData.overall_score}
            </Text>
          </View>
          <Text style={[styles.scoreLabel, isDark && styles.darkMutedText]}>SOPHIE SCORE</Text>
        </View>
      </View>

      {/* Main analysis */}
      <View style={[
        styles.reasoningContainer, 
        { 
          backgroundColor: commentStyle.backgroundColor,
          borderColor: commentStyle.borderColor 
        }
      ]}>
        <Text style={[styles.reasoningText, { color: commentStyle.textColor }]}>
          {sophieData.reasoning}
        </Text>
      </View>

      {/* Outlook sections */}
      <View style={styles.outlookContainer}>
        {/* Short term outlook */}
        <View style={[styles.outlookCard, isDark && styles.darkCard]}>
          <Text style={[styles.outlookTitle, isDark && styles.darkText]}>Short Term</Text>
          <Text style={[styles.outlookContent, isDark && styles.darkMutedText]}>
            {sophieData.short_term_outlook}
          </Text>
        </View>

        {/* Medium term outlook */}
        <View style={[styles.outlookCard, isDark && styles.darkCard]}>
          <Text style={[styles.outlookTitle, isDark && styles.darkText]}>Medium Term</Text>
          <Text style={[styles.outlookContent, isDark && styles.darkMutedText]}>
            {sophieData.medium_term_outlook}
          </Text>
        </View>

        {/* Long term outlook */}
        <View style={[styles.outlookCard, isDark && styles.darkCard]}>
          <Text style={[styles.outlookTitle, isDark && styles.darkText]}>Long Term</Text>
          <Text style={[styles.outlookContent, isDark && styles.darkMutedText]}>
            {sophieData.long_term_outlook}
          </Text>
        </View>
      </View>

      {/* Factors section */}
      <View style={styles.factorsContainer}>
        {/* Bullish factors */}
        <View style={[styles.factorCard, isDark && styles.darkCard]}>
          <Text style={[styles.factorTitle, styles.bullishTitle]}>Bullish Factors</Text>
          {sophieData.bullish_factors.map((factor, index) => (
            <Text key={index} style={[styles.factorItem, isDark && styles.darkFactorItem]}>
              • {factor}
            </Text>
          ))}
        </View>

        {/* Bearish factors */}
        <View style={[styles.factorCard, isDark && styles.darkCard]}>
          <Text style={[styles.factorTitle, styles.bearishTitle]}>Bearish Factors</Text>
          {sophieData.bearish_factors.map((factor, index) => (
            <Text key={index} style={[styles.factorItem, isDark && styles.darkFactorItem]}>
              • {factor}
            </Text>
          ))}
        </View>

        {/* Risks */}
        <View style={[styles.factorCard, isDark && styles.darkCard]}>
          <Text style={[styles.factorTitle, styles.risksTitle]}>Risks</Text>
          {sophieData.risks.map((risk, index) => (
            <Text key={index} style={[styles.factorItem, isDark && styles.darkFactorItem]}>
              • {risk}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  darkContainer: {
    backgroundColor: '#222222',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sophieImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  sophieTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7e22ce', // purple-600
  },
  confidenceText: {
    fontSize: 12,
    color: '#6b7280', // gray-500
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreBox: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280', // gray-500
    marginTop: 4,
    textAlign: 'center',
  },
  reasoningContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  reasoningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  outlookContainer: {
    marginBottom: 16,
  },
  outlookCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  darkCard: {
    backgroundColor: '#333333',
  },
  outlookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  outlookContent: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  factorsContainer: {
    marginBottom: 16,
  },
  factorCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  factorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bullishTitle: {
    color: '#22c55e', // green-600
  },
  bearishTitle: {
    color: '#ef4444', // red-600
  },
  risksTitle: {
    color: '#f59e0b', // yellow-500
  },
  factorItem: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
    paddingLeft: 8,
  },
  darkFactorItem: {
    color: '#d1d5db',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#000000',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#9ca3af', // gray-400
  },
});

export default StockAnalysisSummary; 