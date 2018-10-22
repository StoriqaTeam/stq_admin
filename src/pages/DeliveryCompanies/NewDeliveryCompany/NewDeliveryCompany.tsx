import * as React from 'react';
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { message, Button } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { pathOr } from 'ramda';

import CommonForm, { FormInputsType } from '../Form';
import { CREATE_COMPANY_MUTATION } from './queries';
import {
  CreateDeliveryCompanyMutation,
  CreateDeliveryCompanyMutationVariables,
} from './__generated__/CreateDeliveryCompanyMutation';
import { Currency } from '../../../../__generated__/globalTypes';

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

class NewDeliveryCompany extends React.Component<PropsType> {
  handleSubmit = (input: FormInputsType) => {
    this.props.client
      .mutate<
        CreateDeliveryCompanyMutation,
        CreateDeliveryCompanyMutationVariables
      >({
        mutation: CREATE_COMPANY_MUTATION,
        variables: {
          input: {
            clientMutationId: '',
            deliveriesFrom: input.deliveriesFrom,
            name: input.name,
            label: input.label,
            description: input.description,
            logo: input.logo,
            currency: input.currency as Currency,
          },
        },
      })
      .then(({ data }) => {
        const id = pathOr(null, ['createCompany', 'rawId'], data);
        if (id) {
          this.props.history.push(`/delivery/companies/${id}`);
        }
      })
      .catch(message.error);
  };

  render() {
    return (
      <div>
        <h2>New delivery company</h2>
        <Button
          icon="left"
          size="small"
          onClick={() => {
            this.props.history.push('/delivery');
          }}
        >
          Go back
        </Button>
        <CommonForm onSubmit={this.handleSubmit} />
      </div>
    );
  }
}

const FormWithClient = (props: PropsType) => (
  <ApolloConsumer>
    {client => <NewDeliveryCompany {...props} client={client} />}
  </ApolloConsumer>
);

export default withRouter(FormWithClient);
