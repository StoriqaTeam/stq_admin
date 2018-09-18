import * as React from 'react';
import style from 'styled-components';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

import Test from './pages/Test';

const Wrapper = style.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const client = new ApolloClient({
  uri: 'https://nightly.stq.cloud/graphql',
});

const App = () => (
  <ApolloProvider client={client}>
    <Wrapper>
      <Test />
    </Wrapper>
  </ApolloProvider>
);

export default App;
