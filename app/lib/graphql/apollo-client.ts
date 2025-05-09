import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { Platform } from 'react-native';
import { getGraphQLUri } from "./gql-config";

// Create and configure Apollo client for the app
export const createApolloClient = () => {
  // Get GraphQL URI from configuration utility
  const graphqlUri = getGraphQLUri();
  
  // Log the GraphQL URI for debugging
  console.log(`Connecting to GraphQL endpoint: ${graphqlUri} from ${Platform.OS}`);
  
  // Error handling link
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      console.error(`[GraphQL errors]: ${graphQLErrors.length} errors occurred`);
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`,
        ),
      );
    }
    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
      console.error(`Network error details: ${JSON.stringify(networkError)}`);
    }
  });

  // Create the HTTP link with proper configuration
  const httpLink = new HttpLink({
    uri: graphqlUri,
    credentials: 'omit',
    // Disable Apollo-specific headers that could cause CORS issues
    useGETForQueries: false,
    includeExtensions: false,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Create the Apollo client with simpler configuration
  const client = new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'network-only',
      },
      query: {
        fetchPolicy: 'network-only',
      },
    },
    // Disable client identification to avoid CORS issues
    name: undefined,
    version: undefined,
    queryDeduplication: false
  });
  
  console.log('Apollo client created successfully');
  return client;
};

// Create a singleton instance for use throughout the app
export const apolloClient = createApolloClient(); 