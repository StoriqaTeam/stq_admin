import * as React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Redirect, Switch, Route, Link } from 'react-router-dom';

const ME = gql`
  {
    me {
      id
    }
  }
`;

class Entry extends React.PureComponent<{}> {
  render() {
    return (
      <Query query={ME} fetchPolicy="network-only">
        {({ loading, error, data }) => {
          console.log({ loading, error, data });

          if (loading) {
            return <div>loading</div>;
          }

          if (data && data.me) {
            return (
              <Switch>
                <Route path="/" exact component={() => <div>main page</div>} />
                <Route path="/s" component={() => <div>other page</div>} />
              </Switch>
            );
          } else {
            return <Redirect to="/login" />;
          }
        }}
      </Query>
    );
  }
}

export default Entry;
