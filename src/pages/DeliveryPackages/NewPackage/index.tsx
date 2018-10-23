import * as React from 'react';
import ApolloClient from 'apollo-client';
import { ApolloConsumer } from 'react-apollo';
import { pathOr } from 'ramda';
import { withRouter, RouteComponentProps } from 'react-router';

import CommonForm, { DeliveryPackageFormInputType } from '../Form';
import {
  CreateDeliveryPackage,
  CreateDeliveryPackageVariables,
} from '../__generated__/CreateDeliveryPackage';
import {
  ConnectPackageToCompany,
  ConnectPackageToCompanyVariables,
} from '../__generated__/ConnectPackageToCompany';
import {
  CREATE_DELIVERY_PACKAGE_MUTATION,
  CONNECT_PACKAGE_TO_COMPANY_MUTATION,
} from '../queries';

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

interface StateType {
  //
}

class NewDeliveryPackage extends React.Component<PropsType, StateType> {
  handleFormSubmit = (inputData: DeliveryPackageFormInputType) => {
    this.props.client
      .mutate<CreateDeliveryPackage, CreateDeliveryPackageVariables>({
        mutation: CREATE_DELIVERY_PACKAGE_MUTATION,
        variables: {
          input: {
            clientMutationId: '',
            ...inputData,
          },
        },
      })
      .then(({ data }) => {
        const newPackageId = pathOr(null, ['createPackage', 'rawId'], data);
        if (newPackageId) {
          return this.props.client
            .mutate<ConnectPackageToCompany, ConnectPackageToCompanyVariables>({
              mutation: CONNECT_PACKAGE_TO_COMPANY_MUTATION,
              variables: {
                input: {
                  clientMutationId: '',
                  companyId: parseInt(
                    pathOr(-1, ['params', 'companyId'], this.props.match),
                    10,
                  ),
                  packageId: newPackageId,
                },
              },
            })
            .then(({ data: nextData }) => {
              const companyId = pathOr(
                null,
                ['addPackageToCompany', 'companyId'],
                nextData,
              );
              this.props.history.push(`/delivery/companies/${companyId}`);
            });
        }
      });
  };

  render() {
    return (
      <div>
        <CommonForm onSubmit={this.handleFormSubmit} />
      </div>
    );
  }
}

const NewDeliveryPackageWithClient = (props: PropsType) => (
  <ApolloConsumer>
    {client => <NewDeliveryPackage {...props} client={client} />}
  </ApolloConsumer>
);

export default withRouter(NewDeliveryPackageWithClient);
