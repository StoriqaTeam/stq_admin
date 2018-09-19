import * as React from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

import styles from './App.scss';

const client = new ApolloClient({
  uri: 'https://nightly.stq.cloud/graphql',
});

const App = () => (
  <ApolloProvider client={client}>
    <div className={styles.container}>hi</div>
  </ApolloProvider>
);

export default App;
