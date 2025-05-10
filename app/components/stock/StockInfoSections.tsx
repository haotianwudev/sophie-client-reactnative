import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StockInfoSectionsProps {
  company: any;
  financialMetrics: any;
  prices: any[];
  price: number;
  change: number;
  changePercent: string | number;
  ticker: string;
  name: string;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

const StockInfoSections = ({ 
  company, 
  financialMetrics, 
  prices, 
  price, 
  change, 
  changePercent,
  ticker,
  name,
  isBookmarked,
  onToggleBookmark
}: StockInfoSectionsProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatLargeNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`;
    } else if (value >= 1_000) {
      return `${(value / 1_000).toFixed(2)}K`;
    } else {
      return value.toString();
    }
  };

  const formatPercent = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatReportDate = (): string => {
    try {
      if (!financialMetrics?.report_period) return "N/A";
      
      const date = new Date(financialMetrics.report_period);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting report date:", error);
      return financialMetrics?.report_period || "N/A";
    }
  };

  const getDividendInfo = () => {
    if (!financialMetrics?.payout_ratio || 
        !financialMetrics?.price_to_earnings_ratio || 
        !financialMetrics?.earnings_per_share) {
      return { dividendYield: "N/A", forwardDividend: "N/A" };
    }
    
    try {
      // Dividend Yield = Payout Ratio / Price-to-Earnings Ratio
      const dividendYield = financialMetrics.payout_ratio / financialMetrics.price_to_earnings_ratio;
      
      // Forward Annual Dividend = EPS * Payout Ratio
      const forwardDividend = financialMetrics.earnings_per_share * financialMetrics.payout_ratio;
    
      return { 
        dividendYield: formatPercent(dividendYield),
        forwardDividend: forwardDividend.toFixed(2)
      };
    } catch (error) {
      console.error("Error calculating dividend info:", error);
      return { dividendYield: "N/A", forwardDividend: "N/A" };
    }
  };

  const dividendInfo = getDividendInfo();

  // Calculate metrics from price data
  const calculateMetrics = () => {
    if (!prices || prices.length === 0) return null;

    // Sort prices by date (ascending)
    const sortedPrices = [...prices].sort((a, b) => 
      new Date(a.biz_date).getTime() - new Date(b.biz_date).getTime()
    );
    
    // Get most recent price
    const latestPrice = sortedPrices[sortedPrices.length - 1];
    const latestDate = latestPrice ? new Date(latestPrice.biz_date) : null;
    
    // Get 1yr data
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const yearPrices = sortedPrices.filter(p => 
      new Date(p.biz_date) >= oneYearAgo && 
      typeof p.high === 'number' && !isNaN(p.high) &&
      typeof p.low === 'number' && !isNaN(p.low)
    );
    
    if (yearPrices.length === 0) {
      return {
        latestDate,
        currentPrice: latestPrice?.close,
        dailyHigh: latestPrice?.high,
        dailyLow: latestPrice?.low,
        dailyVolume: latestPrice?.volume,
        high52Week: null,
        low52Week: null,
        volatility: null
      };
    }
    
    // Calculate 52-week high/low
    const high52Week = Math.max(...yearPrices.map(p => p.high));
    const low52Week = Math.min(...yearPrices.map(p => p.low));
    
    // Calculate average volume
    const validVolumes = yearPrices.filter(p => typeof p.volume === 'number' && !isNaN(p.volume));
    let averageVolume = null;
    if (validVolumes.length > 0) {
      const totalVolume = validVolumes.reduce((sum, price) => sum + price.volume, 0);
      averageVolume = totalVolume / validVolumes.length;
    }
    
    // Calculate volatility (standard deviation of daily returns)
    let volatility = null;
    try {
      const validPrices = yearPrices.filter((p, i) => 
        i > 0 && 
        yearPrices[i-1].close > 0 && 
        !isNaN(yearPrices[i-1].close) &&
        !isNaN(p.close)
      );
      
      if (validPrices.length > 5) {
        const dailyReturns = [];
        for (let i = 1; i < validPrices.length; i++) {
          const prevClose = validPrices[i-1].close;
          const currClose = validPrices[i].close;
          if (prevClose > 0) {
            const dailyReturn = (currClose / prevClose) - 1;
            dailyReturns.push(dailyReturn);
          }
        }
        
        if (dailyReturns.length > 5) {
          const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
          const squaredDiffs = dailyReturns.map(r => Math.pow(r - avgReturn, 2));
          const variance = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
          const stdDev = Math.sqrt(variance);
          volatility = stdDev * Math.sqrt(252); // 252 trading days in a year
        }
      }
    } catch (error) {
      console.error("Error calculating volatility:", error);
    }
    
    return {
      latestDate,
      currentPrice: latestPrice?.close,
      dailyHigh: latestPrice?.high,
      dailyLow: latestPrice?.low,
      dailyVolume: latestPrice?.volume,
      averageVolume,
      high52Week,
      low52Week,
      volatility
    };
  };

  const metrics = calculateMetrics();

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <TouchableOpacity 
        style={[styles.stockSection, isDark && styles.darkStockSection]} 
        onPress={toggleExpand}
      >
        <View style={styles.stockHeader}>
          <View style={styles.stockInfo}>
            <Text style={[styles.ticker, isDark && styles.darkText]}>{ticker}</Text>
            <Text style={[styles.companyName, isDark && styles.darkMutedText]}>{name}</Text>
          </View>
          <View style={styles.priceSection}>
            <Text style={[styles.price, isDark && styles.darkText]}>
              {formatCurrency(price)}
            </Text>
            <View style={styles.changeContainer}>
              <Text 
                style={[
                  styles.change, 
                  change > 0 ? styles.positiveChange : styles.negativeChange
                ]}
              >
                {change > 0 ? '+' : ''}{changePercent}%
              </Text>
              <Text style={[styles.changeLabel, isDark && styles.darkMutedText]}>3m chg</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
            style={styles.bookmarkButton}
          >
            <Ionicons 
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'} 
              size={24} 
              color={isDark ? '#FFFFFF' : '#111827'} 
            />
          </TouchableOpacity>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Company Information */}
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, isDark && styles.darkText]}>Company Information</Text>
              <View style={styles.infoRow}>
                <Text style={[styles.label, isDark && styles.darkMutedText]}>Ticker</Text>
                <Text style={[styles.value, isDark && styles.darkText]}>{company?.ticker || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.label, isDark && styles.darkMutedText]}>Name</Text>
                <Text style={[styles.value, isDark && styles.darkText]}>{company?.name || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.label, isDark && styles.darkMutedText]}>Sector</Text>
                <Text style={[styles.value, isDark && styles.darkText]}>{company?.sector || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.label, isDark && styles.darkMutedText]}>Industry</Text>
                <Text style={[styles.value, isDark && styles.darkText]}>{company?.industry || 'N/A'}</Text>
              </View>
              {company?.website_url && (
                <View style={styles.infoRow}>
                  <Text style={[styles.label, isDark && styles.darkMutedText]}>Website</Text>
                  <Text style={[styles.value, isDark && styles.darkText]}>{company.website_url}</Text>
                </View>
              )}
            </View>

            {/* Market Statistics */}
            <View style={styles.subsection}>
              <View style={styles.subsectionHeader}>
                <Text style={[styles.subsectionTitle, isDark && styles.darkText]}>Market Statistics</Text>
                {metrics?.latestDate && (
                  <Text style={[styles.dateText, isDark && styles.darkMutedText]}>
                    As of {formatDate(metrics.latestDate)}
                  </Text>
                )}
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.label, isDark && styles.darkMutedText]}>Current Price</Text>
                <Text style={[styles.value, isDark && styles.darkText]}>
                  {metrics?.currentPrice ? formatCurrency(metrics.currentPrice) : 'N/A'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.label, isDark && styles.darkMutedText]}>Daily Range</Text>
                <Text style={[styles.value, isDark && styles.darkText]}>
                  {metrics?.dailyLow ? formatCurrency(metrics.dailyLow) : 'N/A'} - {metrics?.dailyHigh ? formatCurrency(metrics.dailyHigh) : 'N/A'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.label, isDark && styles.darkMutedText]}>52 Week Range</Text>
                <Text style={[styles.value, isDark && styles.darkText]}>
                  {metrics?.low52Week ? formatCurrency(metrics.low52Week) : 'N/A'} - {metrics?.high52Week ? formatCurrency(metrics.high52Week) : 'N/A'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.label, isDark && styles.darkMutedText]}>Volume</Text>
                <Text style={[styles.value, isDark && styles.darkText]}>
                  {metrics?.dailyVolume ? formatLargeNumber(metrics.dailyVolume) : 'N/A'}
                </Text>
              </View>
              {metrics?.averageVolume && (
                <View style={styles.infoRow}>
                  <Text style={[styles.label, isDark && styles.darkMutedText]}>Avg. Volume</Text>
                  <Text style={[styles.value, isDark && styles.darkText]}>
                    {formatLargeNumber(metrics.averageVolume)}
                  </Text>
                </View>
              )}
              {metrics?.volatility && (
                <View style={styles.infoRow}>
                  <Text style={[styles.label, isDark && styles.darkMutedText]}>Volatility</Text>
                  <Text style={[styles.value, isDark && styles.darkText]}>
                    {formatPercent(metrics.volatility)}
                  </Text>
                </View>
              )}
            </View>

            {/* Financial Metrics */}
            {financialMetrics && (
              <View style={styles.subsection}>
                <View style={styles.subsectionHeader}>
                  <Text style={[styles.subsectionTitle, isDark && styles.darkText]}>Financial Metrics</Text>
                  <Text style={[styles.dateText, isDark && styles.darkMutedText]}>
                    {formatReportDate()} ({financialMetrics.period})
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.label, isDark && styles.darkMutedText]}>Market Cap</Text>
                  <Text style={[styles.value, isDark && styles.darkText]}>
                    {formatLargeNumber(financialMetrics.market_cap)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.label, isDark && styles.darkMutedText]}>EPS</Text>
                  <Text style={[styles.value, isDark && styles.darkText]}>
                    {formatCurrency(financialMetrics.earnings_per_share)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.label, isDark && styles.darkMutedText]}>P/E Ratio</Text>
                  <Text style={[styles.value, isDark && styles.darkText]}>
                    {financialMetrics.price_to_earnings_ratio?.toFixed(2) || 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.label, isDark && styles.darkMutedText]}>P/B Ratio</Text>
                  <Text style={[styles.value, isDark && styles.darkText]}>
                    {financialMetrics.price_to_book_ratio?.toFixed(2) || 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.label, isDark && styles.darkMutedText]}>P/S Ratio</Text>
                  <Text style={[styles.value, isDark && styles.darkText]}>
                    {financialMetrics.price_to_sales_ratio?.toFixed(2) || 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.label, isDark && styles.darkMutedText]}>Forward Dividend & Yield</Text>
                  <Text style={[styles.value, isDark && styles.darkText]}>
                    {dividendInfo.forwardDividend !== "N/A" ? `$${dividendInfo.forwardDividend}` : "N/A"}
                    {dividendInfo.dividendYield !== "N/A" && dividendInfo.forwardDividend !== "N/A" 
                      ? ` (${dividendInfo.dividendYield})` 
                      : ""}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  darkContainer: {
    backgroundColor: '#222222',
  },
  stockSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  darkStockSection: {
    backgroundColor: '#333333',
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stockInfo: {
    flex: 1,
  },
  ticker: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  companyName: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  priceSection: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  change: {
    fontSize: 16,
    fontWeight: '500',
  },
  positiveChange: {
    color: '#22c55e',
  },
  negativeChange: {
    color: '#ef4444',
  },
  changeLabel: {
    fontSize: 12,
    marginLeft: 4,
    color: '#6B7280',
  },
  bookmarkButton: {
    padding: 4,
    alignSelf: 'center',
  },
  expandedContent: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  subsection: {
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkMutedText: {
    color: '#9CA3AF',
  },
  subsectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default StockInfoSections; 