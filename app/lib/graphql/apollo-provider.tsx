import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './apollo-client';

// Apollo provider component to wrap the app
export const ApolloWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );
};

export default ApolloWrapper; 