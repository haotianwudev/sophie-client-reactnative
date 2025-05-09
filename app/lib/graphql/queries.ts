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