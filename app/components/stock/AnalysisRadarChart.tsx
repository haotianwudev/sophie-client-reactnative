import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';

// Define prop types
interface AnalysisRadarChartProps {
  technical: string; // 'strong_bullish', 'bullish', 'neutral', 'bearish', 'strong_bearish'
  sentiment: string;
  valuation: string;
  fundamental: string;
  width?: number;
  height?: number;
}

// Signal values mapping to numeric scale (0-5)
const signalToValue = (signal: string): number => {
  switch(signal?.toLowerCase()) {
    case 'strong_bullish': return 5;
    case 'bullish': return 4;
    case 'neutral': return 3;
    case 'bearish': return 2;
    case 'strong_bearish': return 1;
    default: return 3; // Default to neutral
  }
};

// Signal to color mapping
const signalToColor = (signal: string): string => {
  const value = signalToValue(signal);
  
  if (value >= 4) return '#22c55e'; // Green for bullish (4-5)
  if (value === 3) return '#f59e0b'; // Yellow for neutral (3)
  return '#ef4444'; // Red for bearish (1-2)
};

// Function to calculate point on the radar chart
const calculatePoint = (value: number, index: number, maxValue: number, centerX: number, centerY: number, size: number): { x: number, y: number } => {
  // Normalize the value between 0 and 1
  const normalizedValue = value / maxValue;
  
  // Calculate the angle based on index (4 dimensions at 90° intervals)
  // Starting from top (0°) and going clockwise: top, right, bottom, left
  const angle = (index * Math.PI / 2) - (Math.PI / 2); // Adjust so 0 is at top
  
  // Calculate point position
  const x = centerX + normalizedValue * size * Math.cos(angle);
  const y = centerY + normalizedValue * size * Math.sin(angle);
  
  return { x, y };
};

const AnalysisRadarChart: React.FC<AnalysisRadarChartProps> = ({ 
  technical = 'neutral',
  sentiment = 'neutral',
  valuation = 'neutral',
  fundamental = 'neutral',
  width = 300,
  height = 300
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Maximum value on the scale
  const maxValue = 5;
  
  // Center of the chart
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Size of the chart (distance from center to vertex)
  const size = Math.min(width, height) * 0.4;
  
  // Convert signals to numeric values
  const technicalValue = signalToValue(technical);
  const sentimentValue = signalToValue(sentiment);
  const valuationValue = signalToValue(valuation);
  const fundamentalValue = signalToValue(fundamental);
  
  // Calculate points for the filled polygon
  const technicalPoint = calculatePoint(technicalValue, 0, maxValue, centerX, centerY, size);
  const sentimentPoint = calculatePoint(sentimentValue, 1, maxValue, centerX, centerY, size);
  const valuationPoint = calculatePoint(valuationValue, 2, maxValue, centerX, centerY, size);
  const fundamentalPoint = calculatePoint(fundamentalValue, 3, maxValue, centerX, centerY, size);
  
  // Generate the points string for the polygon
  const polygonPoints = `${technicalPoint.x},${technicalPoint.y} ${sentimentPoint.x},${sentimentPoint.y} ${valuationPoint.x},${valuationPoint.y} ${fundamentalPoint.x},${fundamentalPoint.y}`;
  
  // Calculate grid circle points (5 levels)
  const gridLevels = [1, 2, 3, 4, 5];
  
  // Axis labels position (slightly beyond the maximum grid)
  const labelOffset = size * 1.1;
  
  // Calculate positions for the labels
  const labelPositions = [
    { name: 'Technical', x: centerX, y: centerY - labelOffset, angle: 0 },
    { name: 'Sentiment', x: centerX + labelOffset, y: centerY, angle: 90 },
    { name: 'Valuation', x: centerX, y: centerY + labelOffset, angle: 0 },
    { name: 'Fundamental', x: centerX - labelOffset, y: centerY, angle: -90 },
  ];
  
  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.chartContainer}>
        <Svg width={width} height={height}>
          {/* Grid circles */}
          {gridLevels.map((level) => (
            <Circle
              key={`grid-${level}`}
              cx={centerX}
              cy={centerY}
              r={size * (level / maxValue)}
              stroke={isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'}
              strokeWidth={1}
              strokeDasharray={level === maxValue ? "0" : "2,2"}
              fill="none"
            />
          ))}
          
          {/* Value indicators on each axis */}
          {/* Top (Technical) */}
          <Circle cx={centerX} cy={centerY - size*0.2} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          <Circle cx={centerX} cy={centerY - size*0.4} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          <Circle cx={centerX} cy={centerY - size*0.6} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          <Circle cx={centerX} cy={centerY - size*0.8} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          <Circle cx={centerX} cy={centerY - size*1.0} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          
          {/* Right (Sentiment) */}
          <Circle cx={centerX + size*0.2} cy={centerY} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          <Circle cx={centerX + size*0.4} cy={centerY} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          <Circle cx={centerX + size*0.6} cy={centerY} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          <Circle cx={centerX + size*0.8} cy={centerY} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          <Circle cx={centerX + size*1.0} cy={centerY} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          
          {/* Bottom (Valuation) */}
          <Circle cx={centerX} cy={centerY + size*0.2} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          <Circle cx={centerX} cy={centerY + size*0.4} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          <Circle cx={centerX} cy={centerY + size*0.6} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          <Circle cx={centerX} cy={centerY + size*0.8} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          <Circle cx={centerX} cy={centerY + size*1.0} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          
          {/* Left (Fundamental) */}
          <Circle cx={centerX - size*0.2} cy={centerY} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          <Circle cx={centerX - size*0.4} cy={centerY} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          <Circle cx={centerX - size*0.6} cy={centerY} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          <Circle cx={centerX - size*0.8} cy={centerY} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          <Circle cx={centerX - size*1.0} cy={centerY} r={1.5} fill={isDark ? '#AAAAAA' : '#6b7280'} />
          
          {/* Grid lines (axes) */}
          <Line
            x1={centerX}
            y1={centerY - size}
            x2={centerX}
            y2={centerY + size}
            stroke={isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
            strokeWidth={1}
          />
          <Line
            x1={centerX - size}
            y1={centerY}
            x2={centerX + size}
            y2={centerY}
            stroke={isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
            strokeWidth={1}
          />
          
          {/* Filled polygon for the data */}
          <Polygon
            points={polygonPoints}
            fill={isDark ? "rgba(99, 102, 241, 0.4)" : "rgba(99, 102, 241, 0.3)"}
            stroke="#6366f1"
            strokeWidth={2}
          />
          
          {/* Data points */}
          <Circle cx={technicalPoint.x} cy={technicalPoint.y} r={4} fill={signalToColor(technical)} />
          <Circle cx={sentimentPoint.x} cy={sentimentPoint.y} r={4} fill={signalToColor(sentiment)} />
          <Circle cx={valuationPoint.x} cy={valuationPoint.y} r={4} fill={signalToColor(valuation)} />
          <Circle cx={fundamentalPoint.x} cy={fundamentalPoint.y} r={4} fill={signalToColor(fundamental)} />
          
          {/* Signal value labels */}
          <SvgText 
            x={technicalPoint.x} 
            y={technicalPoint.y - 8} 
            fontSize="10" 
            fill={signalToColor(technical)} 
            fontWeight="bold"
            textAnchor="middle"
          >
            {technical.replace('_', ' ').toUpperCase()}
          </SvgText>
          <SvgText 
            x={sentimentPoint.x + 8} 
            y={sentimentPoint.y} 
            fontSize="10" 
            fill={signalToColor(sentiment)}
            fontWeight="bold"
            textAnchor="start"
          >
            {sentiment.replace('_', ' ').toUpperCase()}
          </SvgText>
          <SvgText 
            x={valuationPoint.x} 
            y={valuationPoint.y + 12} 
            fontSize="10" 
            fill={signalToColor(valuation)}
            fontWeight="bold"
            textAnchor="middle"
          >
            {valuation.replace('_', ' ').toUpperCase()}
          </SvgText>
          <SvgText 
            x={fundamentalPoint.x - 8} 
            y={fundamentalPoint.y} 
            fontSize="10" 
            fill={signalToColor(fundamental)}
            fontWeight="bold" 
            textAnchor="end"
          >
            {fundamental.replace('_', ' ').toUpperCase()}
          </SvgText>
          
          {/* Axis labels */}
          {labelPositions.map((label, index) => (
            <SvgText
              key={`label-${index}`}
              x={label.x}
              y={label.y}
              fontSize="13"
              fontWeight="bold"
              fill={isDark ? '#FFFFFF' : '#111827'}
              textAnchor={index === 0 ? 'middle' : index === 1 ? 'start' : index === 2 ? 'middle' : 'end'}
              alignmentBaseline={index === 0 ? 'baseline' : index === 1 ? 'middle' : index === 2 ? 'hanging' : 'middle'}
              rotation={label.angle}
              originX={label.x}
              originY={label.y}
            >
              {label.name}
            </SvgText>
          ))}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  darkContainer: {
    backgroundColor: '#222222',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnalysisRadarChart; 