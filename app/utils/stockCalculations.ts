/**
 * Utility functions for stock data calculations
 */

interface PriceData {
  biz_date: string;
  close: number;
}

/**
 * Calculates the percentage change between two price points
 */
export const calculatePercentChange = (current: number, previous: number): number => {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Find price closest to X months ago from a sorted array of prices
 */
export const findPriceXMonthsAgo = (
  sortedPrices: PriceData[],
  monthsAgo: number = 3
): PriceData | null => {
  if (!sortedPrices || sortedPrices.length === 0) {
    return null;
  }

  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() - monthsAgo);
  const targetTime = targetDate.getTime();
  
  let closestPriceIndex = 0;
  let minTimeDiff = Infinity;
  
  sortedPrices.forEach((price, index) => {
    const priceDate = new Date(price.biz_date);
    const timeDiff = Math.abs(priceDate.getTime() - targetTime);
    if (timeDiff < minTimeDiff) {
      minTimeDiff = timeDiff;
      closestPriceIndex = index;
    }
  });
  
  return sortedPrices[closestPriceIndex];
};

/**
 * Sorts price data by date (oldest to newest)
 */
export const sortPricesByDate = (prices: PriceData[]): PriceData[] => {
  return [...prices].sort((a, b) => 
    new Date(a.biz_date).getTime() - new Date(b.biz_date).getTime()
  );
};

/**
 * Calculate the 3-month change for a stock
 */
export const calculate3MonthChange = (prices: PriceData[]): number => {
  if (!prices || prices.length === 0) {
    return 0;
  }
  
  const sortedPrices = sortPricesByDate(prices);
  const latestPrice = sortedPrices[sortedPrices.length - 1];
  const threeMonthPrice = findPriceXMonthsAgo(sortedPrices, 3);
  
  if (!latestPrice || !threeMonthPrice || !latestPrice.close || !threeMonthPrice.close) {
    return 0;
  }
  
  return calculatePercentChange(latestPrice.close, threeMonthPrice.close);
}; 