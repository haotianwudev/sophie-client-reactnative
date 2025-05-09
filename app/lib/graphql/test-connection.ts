import { Platform } from 'react-native';
import { getGraphQLUri } from './gql-config';

/**
 * Tests the connectivity to the GraphQL server
 * This can be useful to diagnose connection issues
 */
export const testGraphQLConnection = async (): Promise<boolean> => {
  const uri = getGraphQLUri();
  
  try {
    console.log(`Testing GraphQL connection to ${uri} from ${Platform.OS}...`);
    
    // Make a simple fetch request to the GraphQL endpoint with minimal headers
    const response = await fetch(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Don't include any other headers that might cause CORS issues
      },
      body: JSON.stringify({
        query: `{ __typename }`,
      }),
      // Avoid sending credentials which can trigger preflight CORS checks
      credentials: 'omit',
    });
    
    if (!response.ok) {
      console.error(`Connection test failed with status: ${response.status}`);
      const responseText = await response.text();
      console.error(`Response text: ${responseText}`);
      return false;
    }
    
    const data = await response.json();
    console.log('Connection test response:', data);
    
    // If we get any kind of valid response, consider the test successful
    return true;
  } catch (error) {
    console.error('GraphQL connection test error:', error);
    return false;
  }
}; 