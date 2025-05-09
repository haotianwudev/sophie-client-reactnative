import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  Image,
  TouchableOpacity,
  useColorScheme
} from 'react-native';
import { base64ToImageSource } from '../../utils/imageHelpers';

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
const MASTER_PHILOSOPHIES: Record<string, string> = {
  warren_buffett: "Warren Buffett focuses on business quality and competitive advantages. He looks for companies with strong earnings, high ROE, reasonable debt, and sustainable competitive moats.",
  charlie_munger: "Charlie Munger emphasizes mental models and avoiding cognitive biases. He seeks businesses that are simple to understand, display rational capital allocation, and have ethical management.",
  cathie_wood: "Cathie Wood targets disruptive innovation and exponential growth. She invests in companies driving technological breakthroughs in areas like AI, genomics, fintech, and autonomous tech.",
  stanley_druckenmiller: "Stanley Druckenmiller employs a top-down macro approach with concentrated positions. He focuses on liquidity, momentum, and making asymmetric bets with strong conviction.",
  ben_graham: "Benjamin Graham pioneered value investing and margin of safety concepts. He seeks companies trading below intrinsic value using quantitative metrics like low P/E ratios and strong balance sheets."
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
  
  const commentStyle = currentAgent 
    ? getCommentBubbleStyle(currentAgent.signal, isDark) 
    : getCommentBubbleStyle('neutral', isDark);

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

  // Find available masters from agent IDs in NextJS
  const availableAgents = ['warren_buffett', 'charlie_munger', 'cathie_wood', 'stanley_druckenmiller', 'ben_graham'];
  
  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      {/* Agent Selector */}
      <View style={styles.agentSelectorContainer}>
        <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Investment Masters</Text>
        <View style={styles.agentButtons}>
          {availableAgents.map((agent) => (
            <TouchableOpacity
              key={agent}
              style={[
                styles.agentButton,
                currentAgent.agent === agent && styles.selectedAgentButton,
                isDark && styles.darkAgentButton,
                currentAgent.agent === agent && isDark && styles.darkSelectedAgentButton
              ]}
              onPress={() => onSelectAgent && onSelectAgent(agent)}
            >
              <Image
                source={getAgentImageSource(agent)}
                style={styles.agentButtonImage}
              />
              <Text
                style={[
                  styles.agentButtonText,
                  currentAgent.agent === agent && styles.selectedAgentButtonText,
                  isDark && styles.darkAgentButtonText
                ]}
                numberOfLines={1}
              >
                {formatAgentName(agent)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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

      {/* Philosophy */}
      <View style={[styles.philosophyContainer, isDark && styles.darkPhilosophyContainer]}>
        <Text style={[styles.philosophyTitle, isDark && styles.darkText]}>
          {formatAgentName(currentAgent.agent)}'s Investment Philosophy
        </Text>
        <Text style={[styles.philosophyText, isDark && styles.darkMutedText]}>
          {MASTER_PHILOSOPHIES[currentAgent.agent] || 
            "This master investor follows a disciplined investment approach focused on finding value and growth opportunities."}
        </Text>
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
  agentButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  agentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedAgentButton: {
    backgroundColor: '#4f46e5',
    borderColor: '#4338ca',
  },
  darkAgentButton: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  darkSelectedAgentButton: {
    backgroundColor: '#4f46e5',
    borderColor: '#6366f1',
  },
  agentButtonImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  agentButtonText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  selectedAgentButtonText: {
    color: '#ffffff',
  },
  darkAgentButtonText: {
    color: '#d1d5db',
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
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
  },
  darkPhilosophyContainer: {
    backgroundColor: '#374151',
  },
  philosophyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  philosophyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4b5563',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#9ca3af',
  },
});

export default InvestmentMasterAnalysis; 