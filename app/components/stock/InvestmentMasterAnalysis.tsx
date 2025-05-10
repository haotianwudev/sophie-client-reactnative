import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  Image,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  Animated
} from 'react-native';
import { base64ToImageSource } from '../../utils/imageHelpers';
import CollapsibleCard from '../ui/CollapsibleCard';

// Base64 placeholder images (simple SVG circles with initials)
const PLACEHOLDER_IMAGES: Record<string, string> = {
  warren_buffett: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiM0Mjg1RjQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIj5XQjwvdGV4dD48L3N2Zz4=',
  charlie_munger: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiM5QzI3QjAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIj5DTTwvdGV4dD48L3N2Zz4=',
  cathie_wood: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiNGRjQ4NDgiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIj5DVzwvdGV4dD48L3N2Zz4=',
  stanley_druckenmiller: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiM2QjI4RjQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIj5TRDwvdGV4dD48L3N2Zz4=',
  ben_graham: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiM0Q0FGNTAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIj5CRzwvdGV4dD48L3N2Zz4='
};

// Dictionary for agent images
const AGENT_IMAGES: Record<string, any> = {
  warren_buffett: require('../../assets/images/agents/warren_buffett.png'),
  charlie_munger: require('../../assets/images/agents/charlie_munger.png'),
  cathie_wood: require('../../assets/images/agents/cathie_wood.png'),
  stanley_druckenmiller: require('../../assets/images/agents/stanley_druckenmiller.png'),
  ben_graham: require('../../assets/images/agents/ben_graham.png'),
  SOPHIE: require('../../assets/images/agents/SOPHIE.png')
};

// Investment master philosophies
const MASTER_PHILOSOPHIES: Record<string, {
  summary: string;
  categories: Array<{
    title: string;
    points: string[];
  }>;
}> = {
  warren_buffett: {
    summary: "Warren Buffett evolved from Graham-style value investing to focus on business quality. His approach combines quantitative valuation with qualitative assessment of competitive advantages.",
    categories: [
      {
        title: "Fundamental Analysis",
        points: [
          "Profitability: ROE >15%, strong margins",
          "Financial Health: Low debt, good liquidity", 
          "Consistency: Stable earnings patterns"
        ]
      },
      {
        title: "Economic Moat",
        points: [
          "Stable ROE >15% across periods",
          "Strong operating margins >15%",
          "Pricing power and market dominance"
        ]
      },
      {
        title: "Management Quality",
        points: [
          "Shareholder-friendly decisions",
          "Effective capital allocation",
          "Transparency and integrity"
        ]
      },
      {
        title: "Valuation Approach",
        points: [
          "\"Owner earnings\" focus",
          "Margin of safety principle",
          "Long-term business perspective"
        ]
      }
    ]
  },
  charlie_munger: {
    summary: "Charlie Munger is known for his multidisciplinary approach and mental models. He emphasizes investing in high-quality businesses with durable competitive advantages at reasonable prices.",
    categories: [
      {
        title: "Moat Strength",
        points: [
          "ROIC Consistency: High returns (>15%)",
          "Pricing Power: Strong gross margins",
          "Capital Efficiency: Low requirements"
        ]
      },
      {
        title: "Management Quality",
        points: [
          "Capital Allocation excellence",
          "Insider Activity: \"Skin in the game\"",
          "Decreasing share count preferred"
        ]
      },
      {
        title: "Business Predictability",
        points: [
          "Consistent revenue growth",
          "Positive operating income trends",
          "Low margin volatility over time"
        ]
      },
      {
        title: "Mental Models Applied",
        points: [
          "Inversion (avoiding mistakes)",
          "Microeconomics (supply/demand)",
          "Psychology (market sentiment)"
        ]
      }
    ]
  },
  cathie_wood: {
    summary: "Cathie Wood is known for her focus on disruptive innovation and exponential growth potential. She pioneered thematic investing in areas like genomics, AI, fintech, and blockchain, embracing volatility for long-term gains.",
    categories: [
      {
        title: "Disruptive Potential",
        points: [
          "Revenue Growth Acceleration",
          "Gross Margin Expansion",
          "Operating Leverage",
          "R&D Intensity"
        ]
      },
      {
        title: "Innovation Growth",
        points: [
          "R&D Growth Rate",
          "Free Cash Flow",
          "Operating Efficiency",
          "Capital Allocation"
        ]
      },
      {
        title: "Exponential Valuation",
        points: [
          "High-Growth DCF",
          "TAM Analysis",
          "Margin of Safety",
          "Scoring Summary"
        ]
      },
      {
        title: "Key Metrics",
        points: [
          "Exponential Growth Potential",
          "Innovation Intensity",
          "Disruptive Valuation",
          "Signal Generation"
        ]
      }
    ]
  },
  stanley_druckenmiller: {
    summary: "Stanley Druckenmiller is known for his aggressive but disciplined approach, focusing on asymmetric risk-reward opportunities and capital preservation. He achieved 30%+ annual returns over 30 years by riding strong trends and managing risk effectively.",
    categories: [
      {
        title: "Growth & Momentum",
        points: [
          "Revenue Growth >30%",
          "EPS Growth >30%",
          "Price Momentum >50%",
          "Trend Strength"
        ]
      },
      {
        title: "Risk-Reward Analysis",
        points: [
          "Debt-to-Equity <0.3",
          "Price Volatility",
          "Upside/Downside Ratio",
          "Capital Preservation"
        ]
      },
      {
        title: "Valuation Metrics",
        points: [
          "P/E Ratio <15",
          "P/FCF Ratio <15",
          "EV/EBIT <15",
          "EV/EBITDA <10"
        ]
      },
      {
        title: "Market Signals",
        points: [
          "News Sentiment",
          "Insider Activity",
          "Institutional Interest",
          "Market Psychology"
        ]
      }
    ]
  },
  ben_graham: {
    summary: "Benjamin Graham, the father of value investing, pioneered quantitative security analysis and emphasized buying stocks trading below their intrinsic value with a margin of safety. His approach focuses strictly on valuation metrics rather than qualitative factors.",
    categories: [
      {
        title: "Earnings Stability",
        points: [
          "Positive EPS Years",
          "EPS Growth Rate",
          "Earnings Consistency",
          "Profit Stability"
        ]
      },
      {
        title: "Financial Strength",
        points: [
          "Current Ratio >2.0",
          "Debt Ratio <0.5",
          "Dividend Record",
          "Working Capital"
        ]
      },
      {
        title: "Valuation Metrics",
        points: [
          "Net-Net Working Capital",
          "Graham Number",
          "Margin of Safety",
          "Intrinsic Value"
        ]
      },
      {
        title: "Key Principles",
        points: [
          "Quantitative Analysis",
          "Intrinsic Value Focus",
          "Margin of Safety",
          "Diversification"
        ]
      }
    ]
  }
};

export interface AgentSignal {
  ticker: string;
  agent: string;
  signal: string;
  confidence: number;
  reasoning: string;
  biz_date: string;
}

interface InvestmentMasterAnalysisProps {
  currentAgent: AgentSignal | null;
  loading?: boolean;
  onSelectAgent?: (agent: string) => void;
}

// Format agent name for display (warren_buffett -> Warren Buffett)
const formatAgentName = (name: string): string => {
  if (!name) return '';
  
  if (name === 'stanley_druckenmiller') {
    return 'Stan Druckenmiller';
  }
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get signal color
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

  switch (signal?.toLowerCase()) {
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

// Get agent image source with fallback to placeholder
const getAgentImageSource = (agent: string) => {
  if (AGENT_IMAGES[agent]) {
    return AGENT_IMAGES[agent];
  }
  // Fallback to default or placeholder
  return AGENT_IMAGES['SOPHIE'] || base64ToImageSource(PLACEHOLDER_IMAGES[agent] || PLACEHOLDER_IMAGES['warren_buffett']);
};

const InvestmentMasterAnalysis = ({ 
  currentAgent, 
  loading = false,
  onSelectAgent
}: InvestmentMasterAnalysisProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Animated value for scroll indicator
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = React.useState(0);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const cardWidth = 118; // Card width (110) + margin (8)
  
  const commentStyle = currentAgent 
    ? getCommentBubbleStyle(currentAgent.signal, isDark) 
    : getCommentBubbleStyle('neutral', isDark);

  // Handle scroll end to update selected agent
  const handleScrollEnd = (event: any) => {
    if (!onSelectAgent) return;
    
    const offsetX = event.nativeEvent.contentOffset.x;
    // Calculate which card is most visible
    const cardIndex = Math.round(offsetX / cardWidth);
    // Ensure index is within bounds
    const safeIndex = Math.max(0, Math.min(cardIndex, availableAgents.length - 1));
    // Select the agent if it's different from current
    if (currentAgent?.agent !== availableAgents[safeIndex]) {
      onSelectAgent(availableAgents[safeIndex]);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.darkContainer]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, isDark && styles.darkText]}>
            Loading investment master analysis...
          </Text>
        </View>
      </View>
    );
  }

  if (!currentAgent) {
    return (
      <View style={[styles.container, isDark && styles.darkContainer]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.noDataText, isDark && styles.darkText]}>
            No investment master analysis available for this stock.
          </Text>
        </View>
      </View>
    );
  }

  // Find available masters from agent IDs
  const availableAgents = ['warren_buffett', 'charlie_munger', 'cathie_wood', 'stanley_druckenmiller', 'ben_graham'];
  
  return (
    <View 
      style={[styles.container, isDark && styles.darkContainer]}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      {/* Agent Selector */}
      <View style={styles.agentSelectorContainer}>
        <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Investment Masters</Text>
        
        {/* Scroll indicator */}
        <View style={styles.scrollIndicatorContainer}>
          {containerWidth > 0 && contentWidth > 0 && (
            <Animated.View 
              style={[
                styles.scrollIndicator, 
                isDark && styles.darkScrollIndicator,
                {
                  width: `${(containerWidth / contentWidth) * 100}%`,
                  transform: [
                    {
                      translateX: scrollX.interpolate({
                        inputRange: [0, contentWidth - containerWidth],
                        outputRange: [0, containerWidth - (containerWidth * containerWidth / contentWidth)],
                        extrapolate: 'clamp'
                      })
                    }
                  ]
                }
              ]} 
            />
          )}
        </View>
        
        {/* Horizontally scrollable agent cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.agentScrollContainer}
          decelerationRate="fast"
          snapToInterval={cardWidth} // Width of card + margin
          snapToAlignment="start"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          onContentSizeChange={(width) => {
            setContentWidth(width);
          }}
          onMomentumScrollEnd={handleScrollEnd}
        >
          {availableAgents.map((agent) => (
            <TouchableOpacity
              key={agent}
              style={[
                styles.agentCard,
                currentAgent?.agent === agent && styles.selectedAgentCard,
                isDark && styles.darkAgentCard,
                currentAgent?.agent === agent && isDark && styles.darkSelectedAgentCard
              ]}
              onPress={() => onSelectAgent && onSelectAgent(agent)}
            >
              <Image
                source={getAgentImageSource(agent)}
                style={styles.agentCardImage}
              />
              <Text
                style={[
                  styles.agentCardText,
                  currentAgent?.agent === agent && styles.selectedAgentCardText,
                  isDark && styles.darkAgentCardText
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {formatAgentName(agent)}
              </Text>
              {/* Signal badge */}
              <View 
                style={[
                  styles.agentCardSignalBadge, 
                  { backgroundColor: getSignalColor(currentAgent?.agent === agent ? currentAgent.signal : 'neutral') }
                ]}
              >
                <Text style={styles.agentCardSignalText}>
                  {currentAgent?.agent === agent ? currentAgent.signal.toUpperCase() : 'NEUTRAL'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Agent Header */}
      <View style={styles.agentHeaderContainer}>
        <View style={styles.agentProfileContainer}>
          <Image
            source={getAgentImageSource(currentAgent.agent)}
            style={[
              styles.agentImage,
              { borderColor: getSignalColor(currentAgent.signal) }
            ]}
            defaultSource={base64ToImageSource(PLACEHOLDER_IMAGES[currentAgent.agent])}
          />
          <View style={styles.agentInfo}>
            <Text style={[styles.agentName, isDark && styles.darkText]}>
              {formatAgentName(currentAgent.agent)}
            </Text>
            <View style={styles.signalContainer}>
              <View 
                style={[
                  styles.signalBadge, 
                  { backgroundColor: getSignalColor(currentAgent.signal) }
                ]}
              >
                <Text style={styles.signalText}>
                  {currentAgent.signal.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.dateText, isDark && styles.darkMutedText]}>
                {currentAgent.biz_date}
              </Text>
            </View>
            
            {/* Confidence bar */}
            <View style={styles.confidenceBarContainer}>
              <View 
                style={[
                  styles.confidenceBar, 
                  { width: `${currentAgent.confidence}%` }
                ]}
              />
            </View>
            <Text style={[styles.confidenceText, isDark && styles.darkMutedText]}>
              Confidence: {currentAgent.confidence}%
            </Text>
          </View>
        </View>
      </View>

      {/* Reasoning */}
      <View style={[
        styles.reasoningContainer,
        {
          backgroundColor: commentStyle.backgroundColor,
          borderColor: commentStyle.borderColor
        }
      ]}>
        <Text style={[styles.reasoningText, { color: commentStyle.textColor }]}>
          {currentAgent.reasoning}
        </Text>
      </View>
      
      {/* Investment Philosophy - Collapsible */}
      <CollapsibleCard 
        title={`Tap to review ${formatAgentName(currentAgent.agent)}'s investment philosophy`}
        initiallyExpanded={false}
        isDark={isDark}
        containerStyle={styles.philosophyContainer}
        titleStyle={{
          ...styles.philosophyTitle,
          color: isDark ? '#9ca3af' : '#666666'
        }}
      >
        <View style={styles.philosophyContentContainer}>
          <Text style={[styles.philosophySummary, isDark && styles.darkText]}>
            {MASTER_PHILOSOPHIES[currentAgent.agent]?.summary || 
              "This investment master's philosophy is not available."}
          </Text>
          
          {/* Categories Grid */}
          {MASTER_PHILOSOPHIES[currentAgent.agent]?.categories && (
            <View style={styles.categoriesGrid}>
              {MASTER_PHILOSOPHIES[currentAgent.agent]?.categories.map((category, index) => (
                <View key={index} style={styles.categoryContainer}>
                  <Text style={[styles.categoryTitle, isDark && styles.darkCategoryTitle]}>
                    {category.title}
                  </Text>
                  <View style={styles.bulletList}>
                    {category.points.map((point, pointIndex) => (
                      <View key={pointIndex} style={styles.bulletPoint}>
                        <Text style={[styles.bulletDot, isDark && styles.darkText]}>•</Text>
                        <Text style={[styles.bulletText, isDark && styles.darkMutedText]}>{point}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </CollapsibleCard>
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#000000',
  },
  noDataText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
  },
  agentSelectorContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000000',
  },
  scrollIndicatorContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  scrollIndicator: {
    width: '30%',
    height: '100%',
    backgroundColor: '#9ca3af',
    borderRadius: 2,
  },
  darkScrollIndicator: {
    backgroundColor: '#4b5563',
  },
  agentScrollContainer: {
    paddingBottom: 8,
    paddingTop: 4,
  },
  agentCard: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    width: 110,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedAgentCard: {
    backgroundColor: '#4f46e5',
    borderColor: '#4338ca',
  },
  darkAgentCard: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  darkSelectedAgentCard: {
    backgroundColor: '#4f46e5',
    borderColor: '#6366f1',
  },
  agentCardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
  },
  agentCardText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedAgentCardText: {
    color: '#ffffff',
  },
  darkAgentCardText: {
    color: '#d1d5db',
  },
  agentCardSignalBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  agentCardSignalText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  agentHeaderContainer: {
    marginBottom: 16,
  },
  agentProfileContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
  },
  agentImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  agentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  agentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  signalBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  signalText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  confidenceBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  confidenceBar: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: '#6b7280',
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
  philosophyContainer: {
    marginTop: 16,
  },
  philosophyTitle: {
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  philosophyContentContainer: {
    padding: 8,
  },
  philosophySummary: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333333',
    marginBottom: 16,
  },
  categoriesGrid: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryContainer: {
    marginBottom: 16,
    width: '48%',
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  bulletList: {
    marginLeft: 4,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bulletDot: {
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 4,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 11,
    lineHeight: 14,
    color: '#6b7280',
    flex: 1,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#9ca3af',
  },
  darkCategoryTitle: {
    color: '#e5e7eb',
  },
});

export default InvestmentMasterAnalysis; 