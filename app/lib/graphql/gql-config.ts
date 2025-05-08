/**
 * GraphQL Configuration
 * 
 * This file contains configuration for GraphQL endpoints.
 * Edit these settings to switch between local and production GraphQL servers.
 */

// Set this to true to use local GraphQL server, false to use production
export const USE_LOCAL_GQL = true;

// Local GraphQL server port
export const LOCAL_GQL_PORT = 4000;

// Default fallback for production GraphQL URI if not set in environment
const DEFAULT_PROD_URI = "https://api.sophieai.dev/graphql";

// Get the appropriate GraphQL URI based on configuration
export function getGraphQLUri(): string {
  // For React Native, we can't use process.env directly like in Next.js
  // Instead, we would typically use react-native-dotenv or similar
  
  // If using local GraphQL server
  if (USE_LOCAL_GQL) {
    return `http://localhost:${LOCAL_GQL_PORT}/graphql`;
  }
  
  // Return environment variable or default if not set
  return DEFAULT_PROD_URI;
} 