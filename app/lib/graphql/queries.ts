import { gql } from "@apollo/client";

// Query to search for stocks
export const SEARCH_STOCKS = gql`
  query SearchStocks($query: String!) {
    searchStocks(query: $query) {
      ticker
      name
    }
  }
`;

// Query to get all covered stocks with SOPHIE scores
export const GET_ALL_COVERED_STOCKS = gql`
  query GetAllCoveredStocks {
    coveredTickers {
      ticker
      score
    }
  }
`;

// Query to get stock details for a specific ticker
export const GET_STOCK_DETAILS = gql`
  query GetStockDetails($ticker: String!, $startDate: String!, $endDate: String!) {
    stock(ticker: $ticker) {
      company {
        ticker
        name
        sector
        industry
        website_url
        market_cap
      }
      financialMetricsLatest {
        report_period
        period
        currency
        market_cap
        enterprise_value
        price_to_earnings_ratio
        price_to_book_ratio
        price_to_sales_ratio
        earnings_per_share
        free_cash_flow_yield
        payout_ratio
      }
      prices(start_date: $startDate, end_date: $endDate) {
        biz_date
        open
        high
        low
        close
        volume
      }       
      news (limit: 100) {
        title
        date
        source
        url
        sentiment
      }
    }
  }
`;

// Query to get trending stocks
export const GET_TRENDING_STOCKS = gql`
  query GetTrendingStocks {
    trendingStocks {
      ticker
      name
      lastPrice
      priceChange
      sophieScore
    }
  }
`;

// Query to get top tickers with SOPHIE scores
export const GET_TOP_TICKERS = gql`
  query GetTopTickers {
    coveredTickers(top: 10) {
      ticker
      score
    }
  }
`;

// Query to batch fetch stock data for multiple tickers
export const BATCH_STOCKS_QUERY = gql`
  query GetBatchStocksWithDates($tickers: [String!]!, $startDate: String!, $endDate: String!) {
    batchStocks(
      tickers: $tickers
      start_date: $startDate
      end_date: $endDate
    ) {
      ticker
      company {
        name
      }
      prices {
        biz_date
        close
      }
      latestSophieAnalysis {
        overall_score
      }
    }
  }
`;

// Query to get stock valuations
export const GET_STOCK_VALUATIONS = gql`
  query GetLatestValuations($ticker: String!) {
    latestValuations(ticker: $ticker) {
      valuation_method
      intrinsic_value
      market_cap
      gap
      signal
      biz_date
    }
  }
`;

// Query to get fundamental analysis
export const GET_STOCK_FUNDAMENTALS = gql`
  query GetLatestFundamentals($ticker: String!) {
    latestFundamentals(ticker: $ticker) {
      biz_date
      overall_signal
      confidence
      profitability_score
      profitability_signal
      growth_score  
      growth_signal
      health_score
      health_signal
      valuation_score
      valuation_signal
      return_on_equity
      net_margin
      operating_margin
      revenue_growth
      earnings_growth
      book_value_growth
      current_ratio
      debt_to_equity
      free_cash_flow_per_share
      earnings_per_share
      pe_ratio
      pb_ratio
      ps_ratio
    }
  }
`;

// Query to get sentiment analysis
export const GET_STOCK_SENTIMENT = gql`
  query GetLatestSentiment($ticker: String!) {
    latestSentiment(ticker: $ticker) {
      biz_date
      overall_signal
      confidence
      insider_total
      insider_bullish
      insider_bearish
      insider_value_total
      insider_value_bullish
      insider_value_bearish
      insider_weight
      news_total
      news_bullish
      news_bearish
      news_neutral
      news_weight
      weighted_bullish
      weighted_bearish
    }
  }
`;

// Query to get technical analysis
export const GET_STOCK_TECHNICALS = gql`
  query GetLatestTechnicals($ticker: String!) {
    latestTechnicals(ticker: $ticker) {
      biz_date
      signal
      confidence
      
      trend_signal
      trend_confidence
      trend_score
      trend_adx_threshold
      ema_8
      ema_21
      ema_55
      adx
      di_plus
      di_minus
      
      mr_signal
      mr_confidence
      mr_score
      z_score
      bb_upper
      bb_lower
      rsi_14
      rsi_28
      
      momentum_signal
      momentum_confidence
      momentum_score
      mom_1m
      mom_3m
      mom_6m
      volume_ratio
      
      volatility_signal
      volatility_confidence
      volatility_score
      hist_vol_21d
      vol_regime
      vol_z_score
      atr_ratio
      
      stat_arb_signal
      stat_arb_confidence
      stat_arb_score
      hurst_exp
      skewness
      kurtosis
    }
  }
`;

// Query to get SOPHIE analysis
export const GET_LATEST_SOPHIE_ANALYSIS = gql`
  query GetLatestSophieAnalysis($ticker: String!) {
    latestSophieAnalysis(ticker: $ticker) {
      id
      ticker
      biz_date
      signal
      confidence
      overall_score
      reasoning
      short_term_outlook
      medium_term_outlook
      long_term_outlook
      bullish_factors
      bearish_factors
      risks
      model_name
      model_display_name
      created_at
      updated_at
    }
  }
`;

// Query to get investment master (agent) analysis
export const GET_LATEST_AGENT_SIGNAL = gql`
  query GetLatestAgentSignal($ticker: String!, $agent: String!) {
    latestAgentSignal(ticker: $ticker, agent: $agent) {
      ticker
      agent
      signal
      confidence
      reasoning
      biz_date
    }
  }
`; 