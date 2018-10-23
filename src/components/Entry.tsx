import * as React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Redirect, Switch, Route } from 'react-router-dom';

import { AppLayout } from '../pages/Layout';
import { Users } from '../pages/Users';
import { Stores } from '../pages/Stores';
import {
  Categories,
  EditCategory,
  AddCategory,
  CategoryAttributes,
} from '../pages/Categories';
import { Goods } from '../pages/Goods';
import {
  DeliveryCompanies,
  NewDeliveryCompany,
  EditDeliveryCompany,
} from '../pages/DeliveryCompanies';
import { NewDeliveryPackage } from '../pages/DeliveryPackages';
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
                  <Route path="/users" exact component={Users} />

                  <Route path="/stores" exact component={Stores} />
                  <Route path="/stores/:id/goods" exact component={Goods} />

                  <Route path="/categories" exact component={Categories} />
                  <Route
                    path="/categories/:id/edit"
                    exact
                    component={EditCategory}
                  />
                  <Route path="/categories/add" exact component={AddCategory} />
                  <Route
                    path="/categories/:id/attributes"
                    exact
                    component={CategoryAttributes}
                  />

                  <Route path="/delivery" exact component={DeliveryCompanies} />
                  <Route
                    path="/delivery/companies/new"
                    exact
                    component={NewDeliveryCompany}
                  />
                  <Route
                    path="/delivery/companies/:id"
                    exact
                    component={EditDeliveryCompany}
                  />
                  <Route
                    path="/delivery/companies/:companyId/packages/new"
                    exact
                    component={NewDeliveryPackage}
                  />
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
