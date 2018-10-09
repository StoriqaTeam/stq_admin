import * as React from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Entry from './components/Entry';
import Login from './pages/Login';

const client = new ApolloClient({
  uri: process.env.GRAPHQL_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('jwt')}`,
    Currency: 'STQ',
  },
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
