import * as React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const QUERY = gql`
  {
    me {
      id
    }
  }
`;

const Test = () => (
  <Query query={QUERY}>
    {({ loading, error, data }) => {
      if (loading) {
        return <p>Loading...</p>;
      }
      if (error) {
        return <p>Error :(</p>;
      }

      return <div>{JSON.stringify(data)}</div>;
    }}
  </Query>
);

export default Test;
