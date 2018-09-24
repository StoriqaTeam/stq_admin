import * as React from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Entry from './components/Entry';
import Login from './pages/Login';

const client = new ApolloClient({
  uri: 'https://nightly.stq.cloud/graphql',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('jwt')}`,
  },
});

const App = () => (
  <BrowserRouter>
    <ApolloProvider client={client}>
      <Switch>
        <Route path="/login" exact component={Login} />
        <Route path="/" component={Entry} />
      </Switch>
    </ApolloProvider>
  </BrowserRouter>
);

export default App;
