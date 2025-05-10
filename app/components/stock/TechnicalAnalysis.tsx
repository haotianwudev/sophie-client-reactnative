import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  useColorScheme
} from 'react-native';
import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Define the props for technical data
interface TechnicalData {
  signal: string;
  confidence: number;
  biz_date: string;
  trend_signal: string;
  trend_score: number;
  trend_confidence: number;
  adx: number;
  di_plus: number;
  di_minus: number;
  ema_8: number;
  ema_21: number;
  ema_55: number;
  
  mr_signal: string;
  mr_score: number;
  mr_confidence: number;
  z_score: number;
  bb_upper: number;
  bb_lower: number;
  rsi_14: number;
  rsi_28: number;
  
  momentum_signal: string;
  momentum_score: number;
  momentum_confidence: number;
  mom_1m: number;
  mom_3m: number;
  mom_6m: number;
  volume_ratio: number;
  
  volatility_signal: string;
  volatility_score: number;
  volatility_confidence: number;
  hist_vol_21d: number;
  vol_regime: number;
  vol_z_score: number;
  atr_ratio: number;
  
  stat_arb_signal: string;
  stat_arb_score: number;
  stat_arb_confidence: number;
  hurst_exp: number;
  skewness: number;
  kurtosis: number;
}

interface TechnicalAnalysisProps {
  technicalData?: TechnicalData;
  loading?: boolean;
}

const TechnicalAnalysis = ({ 
  technicalData,
  loading = false 
}: TechnicalAnalysisProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Helper functions
  // Get signal color based on value
  const getSignalColor = (signal: string): string => {
    switch(signal?.toLowerCase()) {
      case 'bullish': return '#22c55e'; // green
      case 'bearish': return '#ef4444'; // red
      case 'neutral': return '#f59e0b'; // yellow
      default: return '#6b7280'; // gray
    }
  };
  
  // Get signal text color class
  const getSignalTextColor = (signal: string): string => {
    switch(signal?.toLowerCase()) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      case 'neutral': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };
  
  // Format percent values
  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  };
  
  // Get color for momentum values
  const getMomentumColor = (value: number): string => {
    if (value > 0.1) return 'text-green-500';
    if (value < -0.1) return 'text-red-500';
    return '';
  };
  
  // Get color for RSI
  const getRSIColor = (value: number): string => {
    if (value > 70) return 'text-red-500';
    if (value < 30) return 'text-green-500';
    return '';
  };
  
  // Get color for Z-Score
  const getZScoreColor = (value: number): string => {
    if (value > 2) return 'text-red-500';
    if (value < -2) return 'text-green-500';
    return '';
  };
  
  // Get color for Hurst Exponent
  const getHurstColor = (value: number): string => {
    if (value > 0.6) return 'text-green-500';
    if (value < 0.4) return 'text-red-500';
    return '';
  };
  
  // Get Hurst Exponent description
  const getHurstExponentDescription = (value: number): string => {
    if (value > 0.6) return 'trending';
    if (value < 0.4) return 'mean-reverting';
    return 'random walk';
  };
  
  // Get standard value color
  const getValueColor = (value: number): string => {
    if (value > 0.5) return 'text-green-500';
    if (value < -0.5) return 'text-red-500';
    return '';
  };
  
  // Format date string
  const formatDateString = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get icon based on strategy
  const getStrategyIcon = (strategy: string) => {
    switch(strategy) {
      case 'trend': 
        return <Feather name="trending-up" size={20} color={isDark ? "#e5e7eb" : "#111827"} />;
      case 'mr': 
        return <MaterialCommunityIcons name="repeat" size={20} color={isDark ? "#e5e7eb" : "#111827"} />;
      case 'momentum': 
        return <MaterialCommunityIcons name="lightning-bolt" size={20} color={isDark ? "#e5e7eb" : "#111827"} />;
      case 'volatility': 
        return <MaterialCommunityIcons name="chart-bar" size={20} color={isDark ? "#e5e7eb" : "#111827"} />;
      case 'stat_arb': 
        return <FontAwesome name="arrows-v" size={20} color={isDark ? "#e5e7eb" : "#111827"} />;
      default: 
        return <Ionicons name="information-circle" size={20} color={isDark ? "#e5e7eb" : "#111827"} />;
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.darkContainer]}>
        <Text style={[styles.loadingText, isDark && styles.darkText]}>
          Loading technical analysis...
        </Text>
      </View>
    );
  }
  
  // Placeholder state
  if (!technicalData) {
    return (
      <View style={[styles.container, isDark && styles.darkContainer]}>
        <Text style={[styles.placeholder, isDark && styles.darkMutedText]}>
          Technical analysis examines price movements and trends using chart patterns 
          and statistical indicators. It helps identify potential entry and exit points 
          based on historical price behavior.
        </Text>
      </View>
    );
  }
  
  // StrategyCard component
  const StrategyCard = ({ 
    title, 
    signal, 
    confidence, 
    score,
    icon,
    indicators,
    tooltipContent
  }: { 
    title: string;
    signal: string;
    confidence: number;
    score: number;
    icon: React.ReactNode;
    indicators: {label: string; value: string; tooltip?: string; colorClass?: string}[];
    tooltipContent: string;
  }) => (
    <View style={[styles.strategyCard, isDark && styles.darkCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, isDark && styles.darkIconContainer]}>
            {icon}
          </View>
          <Text style={[styles.cardTitle, isDark && styles.darkText]}>{title}</Text>
        </View>
      </View>
      
      <View style={styles.signalContainer}>
        <Text style={[styles.signalText, {color: getSignalColor(signal)}]}>
          {signal.toUpperCase()}
        </Text>
        <Text style={[styles.confidenceText, isDark && styles.darkMutedText]}>
          ({confidence}% confidence)
        </Text>
      </View>
      
      <Text style={[styles.tooltipText, isDark && styles.darkMutedText]}>
        {tooltipContent}
      </Text>
      
      <View style={styles.indicatorsGrid}>
        {indicators.map((indicator, index) => (
          <View key={index} style={styles.indicatorItem}>
            <Text style={[styles.indicatorLabel, isDark && styles.darkText]}>
              {indicator.label}
            </Text>
            <Text style={[
              styles.indicatorValue, 
              isDark && styles.darkText,
              indicator.colorClass ? {color: indicator.colorClass.includes('green') ? '#22c55e' : 
                                            indicator.colorClass.includes('red') ? '#ef4444' : 
                                            indicator.colorClass.includes('blue') ? '#3b82f6' : 
                                            indicator.colorClass.includes('yellow') ? '#f59e0b' : 
                                            '#6b7280'} : null
            ]}>
              {indicator.value}
            </Text>
            {indicator.tooltip && (
              <Text style={[styles.tooltipText, isDark && styles.darkMutedText]}>
                {indicator.tooltip}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
  
  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.overallSignalContainer}>
        <View style={styles.dateContainer}>
          <Text style={[styles.dateLabel, isDark && styles.darkMutedText]}>Analysis Date:</Text>
          <Text style={[styles.dateValue, isDark && styles.darkText]}>
            {formatDateString(technicalData.biz_date)}
          </Text>
        </View>
        
        <View style={styles.signalWrapper}>
          <View style={[styles.signalDot, {backgroundColor: getSignalColor(technicalData.signal)}]} />
          <Text style={[styles.signalCaption, {color: getSignalColor(technicalData.signal)}]}>
            {technicalData.signal.toUpperCase()}
          </Text>
          <Text style={[styles.confidenceText, isDark && styles.darkMutedText]}>
            with {Math.round(technicalData.confidence)}% confidence
          </Text>
        </View>
        
        <Text style={[styles.description, isDark && styles.darkMutedText]}>
          Technical analysis combines multiple quantitative trading strategies to generate signals 
          based on price action and market statistics. It uses an ensemble approach with weighted 
          signals from five different methodologies.
        </Text>
      </View>
      
      {/* Strategy overview */}
      <View style={styles.strategyOverviewContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Trend Following */}
          <View style={[styles.strategyOverviewCard, isDark && styles.darkCard]}>
            <View style={[styles.iconCircle, isDark && styles.darkIconCircle]}>
              {getStrategyIcon('trend')}
            </View>
            <Text style={[styles.strategyName, isDark && styles.darkText]}>Trend Following</Text>
            <Text style={[styles.strategySignal, {color: getSignalColor(technicalData.trend_signal)}]}>
              {technicalData.trend_signal.toUpperCase()}
            </Text>
          </View>
          
          {/* Mean Reversion */}
          <View style={[styles.strategyOverviewCard, isDark && styles.darkCard]}>
            <View style={[styles.iconCircle, isDark && styles.darkIconCircle]}>
              {getStrategyIcon('mr')}
            </View>
            <Text style={[styles.strategyName, isDark && styles.darkText]}>Mean Reversion</Text>
            <Text style={[styles.strategySignal, {color: getSignalColor(technicalData.mr_signal)}]}>
              {technicalData.mr_signal.toUpperCase()}
            </Text>
          </View>
          
          {/* Momentum */}
          <View style={[styles.strategyOverviewCard, isDark && styles.darkCard]}>
            <View style={[styles.iconCircle, isDark && styles.darkIconCircle]}>
              {getStrategyIcon('momentum')}
            </View>
            <Text style={[styles.strategyName, isDark && styles.darkText]}>Momentum</Text>
            <Text style={[styles.strategySignal, {color: getSignalColor(technicalData.momentum_signal)}]}>
              {technicalData.momentum_signal.toUpperCase()}
            </Text>
          </View>
          
          {/* Volatility */}
          <View style={[styles.strategyOverviewCard, isDark && styles.darkCard]}>
            <View style={[styles.iconCircle, isDark && styles.darkIconCircle]}>
              {getStrategyIcon('volatility')}
            </View>
            <Text style={[styles.strategyName, isDark && styles.darkText]}>Volatility</Text>
            <Text style={[styles.strategySignal, {color: getSignalColor(technicalData.volatility_signal)}]}>
              {technicalData.volatility_signal.toUpperCase()}
            </Text>
          </View>
          
          {/* Statistical */}
          <View style={[styles.strategyOverviewCard, isDark && styles.darkCard]}>
            <View style={[styles.iconCircle, isDark && styles.darkIconCircle]}>
              {getStrategyIcon('stat_arb')}
            </View>
            <Text style={[styles.strategyName, isDark && styles.darkText]}>Statistical</Text>
            <Text style={[styles.strategySignal, {color: getSignalColor(technicalData.stat_arb_signal)}]}>
              {technicalData.stat_arb_signal.toUpperCase()}
            </Text>
          </View>
        </ScrollView>
      </View>
      
      {/* Strategy Detail Cards */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Trend Following */}
        <StrategyCard
          title="Trend Following"
          signal={technicalData.trend_signal}
          confidence={technicalData.trend_confidence}
          score={technicalData.trend_score}
          icon={getStrategyIcon('trend')}
          tooltipContent="Trend following uses moving averages and directional indicators to identify market trends. It works best in trending markets and comprises 25% of the overall signal."
          indicators={[
            {
              label: "EMA Crossover",
              value: `${technicalData.ema_8.toFixed(2)} / ${technicalData.ema_21.toFixed(2)} / ${technicalData.ema_55.toFixed(2)}`,
              tooltip: "Exponential Moving Averages for 8, 21, and 55 days. When shorter EMAs cross above longer ones, it's bullish.",
              colorClass: technicalData.ema_8 > technicalData.ema_55 ? 'text-green-500' : technicalData.ema_8 < technicalData.ema_55 ? 'text-red-500' : ''
            },
            {
              label: "ADX",
              value: technicalData.adx.toFixed(2),
              tooltip: "Average Directional Index measures trend strength. Values above 25 indicate a strong trend.",
              colorClass: technicalData.adx > 25 ? 'text-blue-500' : 'text-gray-500'
            },
            {
              label: "Directional Movement",
              value: `+DI: ${technicalData.di_plus.toFixed(2)} / -DI: ${technicalData.di_minus.toFixed(2)}`,
              tooltip: "Positive and negative directional indicators. When +DI > -DI, trend is bullish.",
              colorClass: technicalData.di_plus > technicalData.di_minus ? 'text-green-500' : 'text-red-500'
            },
            {
              label: "Score",
              value: technicalData.trend_score.toFixed(4),
              tooltip: "Normalized trend score from -1 (strongly bearish) to +1 (strongly bullish).",
              colorClass: getValueColor(technicalData.trend_score)
            }
          ]}
        />
        
        {/* Mean Reversion */}
        <StrategyCard
          title="Mean Reversion"
          signal={technicalData.mr_signal}
          confidence={technicalData.mr_confidence}
          score={technicalData.mr_score}
          icon={getStrategyIcon('mr')}
          tooltipContent="Mean reversion strategies identify overextended price movements that are likely to reverse. This represents 20% of the overall signal."
          indicators={[
            {
              label: "Z-Score",
              value: technicalData.z_score.toFixed(4),
              tooltip: "Measures how many standard deviations price is from its mean. Values below -2 or above +2 often signal reversal opportunities.",
              colorClass: getZScoreColor(technicalData.z_score)
            },
            {
              label: "Bollinger Bands",
              value: `Upper: ${technicalData.bb_upper.toFixed(2)} / Lower: ${technicalData.bb_lower.toFixed(2)}`,
              tooltip: "Price bands that encompass typical volatility. Prices near the upper band may be overbought, while prices near the lower band may be oversold."
            },
            {
              label: "RSI",
              value: `14d: ${technicalData.rsi_14.toFixed(2)} / 28d: ${technicalData.rsi_28.toFixed(2)}`,
              tooltip: "Relative Strength Index measures momentum. Values below 30 suggest oversold conditions (bullish), while values above 70 suggest overbought conditions (bearish).",
              colorClass: getRSIColor(technicalData.rsi_14)
            },
            {
              label: "Score",
              value: technicalData.mr_score.toFixed(4),
              tooltip: "Mean reversion score ranging from -1 to +1, where extreme values suggest stronger mean reversion potential.",
              colorClass: getValueColor(technicalData.mr_score)
            }
          ]}
        />
        
        {/* Momentum */}
        <StrategyCard
          title="Momentum"
          signal={technicalData.momentum_signal}
          confidence={technicalData.momentum_confidence}
          score={technicalData.momentum_score}
          icon={getStrategyIcon('momentum')}
          tooltipContent="Momentum analysis captures the persistence of price movements across different time frames. It comprises 25% of the overall signal."
          indicators={[
            {
              label: "1-Month Momentum",
              value: formatPercent(technicalData.mom_1m),
              tooltip: "Price performance over the last month.",
              colorClass: getMomentumColor(technicalData.mom_1m)
            },
            {
              label: "3-Month Momentum",
              value: formatPercent(technicalData.mom_3m),
              tooltip: "Price performance over the last 3 months.",
              colorClass: getMomentumColor(technicalData.mom_3m)
            },
            {
              label: "6-Month Momentum",
              value: formatPercent(technicalData.mom_6m),
              tooltip: "Price performance over the last 6 months.",
              colorClass: getMomentumColor(technicalData.mom_6m)
            },
            {
              label: "Volume Ratio",
              value: technicalData.volume_ratio.toFixed(2),
              tooltip: "Current volume relative to the 21-day average. Values above 1 indicate higher than average volume.",
              colorClass: technicalData.volume_ratio > 1.5 ? 'text-blue-500' : technicalData.volume_ratio < 0.5 ? 'text-gray-500' : ''
            }
          ]}
        />
        
        {/* Volatility Analysis */}
        <StrategyCard
          title="Volatility Analysis"
          signal={technicalData.volatility_signal}
          confidence={technicalData.volatility_confidence}
          score={technicalData.volatility_score}
          icon={getStrategyIcon('volatility')}
          tooltipContent="Volatility analysis identifies changing market conditions and potential regime shifts. It comprises 15% of the overall signal."
          indicators={[
            {
              label: "Historical Volatility (21d)",
              value: formatPercent(technicalData.hist_vol_21d),
              tooltip: "Annualized historical volatility based on 21 days of price data.",
              colorClass: technicalData.hist_vol_21d > 0.6 ? 'text-red-500' : technicalData.hist_vol_21d < 0.2 ? 'text-green-500' : ''
            },
            {
              label: "Volatility Regime",
              value: technicalData.vol_regime.toFixed(2),
              tooltip: "Current volatility regime: <0.8 is low, >1.2 is high, between is normal.",
              colorClass: technicalData.vol_regime > 1.2 ? 'text-red-500' : technicalData.vol_regime < 0.8 ? 'text-green-500' : ''
            },
            {
              label: "Volatility Z-Score",
              value: technicalData.vol_z_score.toFixed(2),
              tooltip: "How many standard deviations current volatility is from its historical mean.",
              colorClass: technicalData.vol_z_score > 1 ? 'text-red-500' : technicalData.vol_z_score < -1 ? 'text-green-500' : ''
            },
            {
              label: "ATR Ratio",
              value: technicalData.atr_ratio.toFixed(4),
              tooltip: "Average True Range ratio measures recent range expansion/contraction.",
              colorClass: technicalData.atr_ratio > 0.05 ? 'text-red-500' : technicalData.atr_ratio < 0.02 ? 'text-green-500' : ''
            }
          ]}
        />
        
        {/* Statistical Analysis */}
        <StrategyCard
          title="Statistical Analysis"
          signal={technicalData.stat_arb_signal}
          confidence={technicalData.stat_arb_confidence}
          score={technicalData.stat_arb_score}
          icon={getStrategyIcon('stat_arb')}
          tooltipContent="Statistical analysis examines price behavior patterns to identify statistical properties that might indicate future price movement. This comprises 15% of the overall signal."
          indicators={[
            {
              label: "Hurst Exponent",
              value: `${technicalData.hurst_exp.toFixed(4)} (${getHurstExponentDescription(technicalData.hurst_exp)})`,
              tooltip: "Measures the tendency for a time series to regress to the mean or cluster in a direction. Values below 0.5 indicate mean reversion, above 0.5 indicate trending.",
              colorClass: getHurstColor(technicalData.hurst_exp)
            },
            {
              label: "Skewness",
              value: technicalData.skewness.toFixed(4),
              tooltip: "Measures the asymmetry of returns. Positive values indicate more positive outliers, negative values indicate more negative outliers.",
              colorClass: technicalData.skewness > 1 ? 'text-green-500' : technicalData.skewness < -1 ? 'text-red-500' : ''
            },
            {
              label: "Kurtosis",
              value: technicalData.kurtosis.toFixed(4),
              tooltip: "Measures the 'tailedness' of returns. Higher values indicate more extreme outliers compared to a normal distribution.",
              colorClass: technicalData.kurtosis > 5 ? 'text-blue-500' : ''
            },
            {
              label: "Score",
              value: technicalData.stat_arb_score.toFixed(4),
              tooltip: "Statistical evaluation score based on multiple statistical properties.",
              colorClass: getValueColor(technicalData.stat_arb_score)
            }
          ]}
        />
      </ScrollView>
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
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#111827',
  },
  placeholder: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    paddingVertical: 20,
    textAlign: 'center',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#9ca3af',
  },
  overallSignalContainer: {
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  signalWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  signalDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  signalCaption: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  strategyOverviewContainer: {
    marginBottom: 20,
  },
  strategyOverviewCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    width: 110,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  darkCard: {
    backgroundColor: '#333333',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  darkIconCircle: {
    backgroundColor: '#4b5563',
  },
  strategyName: {
    fontSize: 12,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  strategySignal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  strategyCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  darkIconContainer: {
    backgroundColor: '#4b5563',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 50,
  },
  signalText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  tooltipText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  indicatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  indicatorItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  indicatorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  indicatorValue: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 2,
  },
});

export default TechnicalAnalysis; 