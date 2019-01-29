import * as React from 'react';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink, from } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from 'apollo-link-error';
import { find, where, pathEq, omit } from 'ramda';

const httpLink = new HttpLink({
  uri: process.env.GRAPHQL_URL,
});

import Entry from './components/Entry';
import Login from './pages/Login';

const refreshTokenMiddleware = new ApolloLink((operation, forward) => {
  console.log(JSON.stringify(operation, null, 2));

  operation.setContext({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      Currency: 'STQ',
      FiatCurrency: 'USD',
    },
  });

  return forward ? forward(operation) : null;
});

// @ts-ignore
const logoutLink = onError(({ graphQLErrors, operation, forward }) => {
  const isTokenExpired =
    find(where(pathEq(['data', 'code'], 111)), graphQLErrors || []) != null;
  const isTokenRevoked =
    find(where(pathEq(['data', 'code'], 112)), graphQLErrors || []) != null;
  if (isTokenExpired || isTokenRevoked) {
    console.log('isTokenExpired');
    localStorage.removeItem('jwt');
    const oldHeaders = operation.getContext().headers;
    operation.setContext({
      headers: omit(['Authorization'], oldHeaders),
    });
    return forward ? forward(operation) : null;
  }
});

const client = new ApolloClient({
  link: from([refreshTokenMiddleware, logoutLink.concat(httpLink)]),
  cache: new InMemoryCache(),
});

const App = () => (
  <BrowserRouter basename={process.env.PUBLIC_PATH}>
    <ApolloProvider client={client}>
      <Switch>
        <Route path="/login" exact component={Login} />
        <Route path="/" component={Entry} />
      </Switch>
    </ApolloProvider>
  </BrowserRouter>
);

export default App;
