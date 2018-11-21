import * as React from 'react';
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { pathOr } from 'ramda';
import { withRouter, RouteComponentProps } from 'react-router';
import { Button, Icon, Spin } from 'antd';

import CommonForm from '../Form';
import {
  ADD_ATTRIBUTE_CREATE_ATTRIBUTE,
} from './queries';
import {
  AddAttributeCreateAttributeMutation,
  AddAttributeCreateAttributeMutationVariables,
  AddAttributeCreateAttributeMutation_createAttribute_values as Values
} from './__generated__/AddAttributeCreateAttributeMutation';
import { AttributeMetaFieldInput, AttributeType, TranslationInput } from '../../../../__generated__/globalTypes';

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

interface AttributeData {
  name: TranslationInput[];
  valueType: AttributeType;
  metaField: AttributeMetaFieldInput | null;
  values: Values[];
}

interface StateType {
  isLoading: boolean;
  values: string[];
}

class AddAttribute extends React.Component<PropsType, StateType> {
  state: StateType = {
    isLoading: false,
    values: [],
  };

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleSave = (attributteData: AttributeData) => {
    this.setState({ isLoading: true });
    this.props.client
      .mutate<
        AddAttributeCreateAttributeMutation,
        AddAttributeCreateAttributeMutationVariables
      >({
        mutation: ADD_ATTRIBUTE_CREATE_ATTRIBUTE,
        variables: {
          input: {
            clientMutationId: '',
            name: attributteData.name,
            metaField: attributteData.metaField,
            valueType: attributteData.valueType,
            values: attributteData.values,
          },
        },
      })
      .then(({ data }: any) => {
        const attributeId = pathOr(null, ['createAttribute', 'id'], data);
        if (attributeId) {
          this.props.history.push('/attributes');
        }
      })
      .finally(() => {
        if (this.mounted) {
          this.setState({ isLoading: false });
        }
      });
  };

  render() {
    return (
      <Spin spinning={this.state.isLoading}>
        <Button
          onClick={() => {
            this.props.history.push('/attributes');
          }}
          size="small"
        >
          <Icon type="left" />
          Go back
        </Button>
        <CommonForm
          isLoading={this.state.isLoading}
          onSave={this.handleSave}
        />
      </Spin>
    );
  }
}

const WrappedForm = (props: PropsType) => (
  <ApolloConsumer>
    {client => <AddAttribute {...props} client={client} />}
  </ApolloConsumer>
);

export default withRouter(WrappedForm);
