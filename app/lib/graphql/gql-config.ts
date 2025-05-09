/**
 * GraphQL Configuration
 * 
 * This file contains configuration for GraphQL endpoints.
 * Edit these settings to switch between local and production GraphQL servers.
 */
import { Platform } from 'react-native';

// Set this to false to use production GraphQL server
export const USE_LOCAL_GQL = false;

// Local GraphQL server port (only used when USE_LOCAL_GQL is true)
export const LOCAL_GQL_PORT = 4000;

// Development machine IP address - Your Wi-Fi network IP address (only used when USE_LOCAL_GQL is true)
export const DEV_MACHINE_IP = "192.168.1.172";

// Production GraphQL URI on Render
const PRODUCTION_GRAPHQL_URI = "https://sophie-render-server.onrender.com/graphql";

// Get the appropriate GraphQL URI based on configuration and platform
export function getGraphQLUri(): string {
  // If using local GraphQL server
  if (USE_LOCAL_GQL) {
    if (Platform.OS === 'web') {
      // Web version can use localhost
      return `http://localhost:${LOCAL_GQL_PORT}/graphql`;
    } else if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access host machine
      return `http://10.0.2.2:${LOCAL_GQL_PORT}/graphql`;
    } else if (Platform.OS === 'ios') {
      // iOS simulator can use localhost
      return `http://localhost:${LOCAL_GQL_PORT}/graphql`;
    } else {
      // For other platforms or physical devices, use the actual IP
      return `http://${DEV_MACHINE_IP}:${LOCAL_GQL_PORT}/graphql`;
    }
  }
  
  // Return production URI
  console.log(`Using production GraphQL endpoint: ${PRODUCTION_GRAPHQL_URI}`);
  return PRODUCTION_GRAPHQL_URI;
} 