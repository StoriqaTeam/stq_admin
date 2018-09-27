import * as React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Redirect, Switch, Route, Link } from 'react-router-dom';

import { AppLayout } from '../pages/Layout';
import { Users } from '../pages/Users';
import { EntryMeQuery } from './__generated__/EntryMeQuery';

const ME = gql`
  query EntryMeQuery {
    me {
      id
    }
  }
`;

class Entry extends React.PureComponent<{}> {
  render() {
    return (
      <AppLayout>
        <Query<EntryMeQuery> query={ME} fetchPolicy="network-only">
          {({ loading, error, data }) => {
            if (loading) {
              return <div>loading</div>;
            }

            if (data && data.me) {
              return (
                <Switch>
                  <Route
                    path="/"
                    exact
                    component={() => (
                      <div>Select menu item on the left side</div>
                    )}
                  />
                  <Route path="/users" exact component={Users} />
                </Switch>
              );
            } else {
              return <Redirect to="/login" />;
            }
          }}
        </Query>
      </AppLayout>
    );
  }
}

export default Entry;
