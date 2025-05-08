import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { getGraphQLUri } from "./gql-config";

// Create and configure Apollo client for the app
export const createApolloClient = () => {
  // Get GraphQL URI from configuration utility
  const graphqlUri = getGraphQLUri();
  
  // Log the GraphQL URI for debugging
  console.log(`Connecting to GraphQL endpoint: ${graphqlUri}`);
  
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

  const httpLink = new HttpLink({
    uri: graphqlUri,
  });

  // Create the Apollo client
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
  });
  
  console.log('Apollo client created successfully');
  return client;
};

// Create a singleton instance for use throughout the app
export const apolloClient = createApolloClient(); 