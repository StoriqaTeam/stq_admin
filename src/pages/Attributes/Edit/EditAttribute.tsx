import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Form, Button, Icon, Spin } from 'antd';
import { TreeNodeNormal } from 'antd/lib/tree-select/interface'; // tslint:disable-line
import { FormComponentProps } from 'antd/lib/form'; // tslint:disable-line
import { pathOr, filter } from 'ramda';
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';

import CommonForm from '../Form';
import {
  EDIT_ATTRIBUTE_ATTRIBUTES_LIST_QUERY,
  UPDATE_ATTRIBUTE_MUTATION,
  CREATE_ATTRIBUTE_VALUE_MUTATION,
  UPDATE_ATTRIBUTE_VALUE_MUTATION,
  DELETE_ATTRIBUTE_VALUE_MUTATION,
} from './queries';
import {
  EditAttributeAttributesListQuery,
  EditAttributeAttributesListQueryVariables,
  EditAttributeAttributesListQuery_node_Attribute as Attribute,
} from './__generated__/EditAttributeAttributesListQuery';
import {
  EditAttributeUpdateAttributeMutation,
  EditAttributeUpdateAttributeMutationVariables,
} from './__generated__/EditAttributeUpdateAttributeMutation';
import {
  CreateAttributeValueMutation,
  CreateAttributeValueMutationVariables,
} from './__generated__/CreateAttributeValueMutation';
import {
  UpdateAttributeValueMutation,
  UpdateAttributeValueMutationVariables,
} from './__generated__/UpdateAttributeValueMutation';
import {
  DeleteAttributeValueMutation,
  DeleteAttributeValueMutationVariables,
} from './__generated__/DeleteAttributeValueMutation';
import { AttributeMetaFieldInput, TranslationInput } from '../../../../__generated__/globalTypes';

interface AttributeData {
  id: string;
  name: TranslationInput[];
  metaField: AttributeMetaFieldInput | null;
}

interface StateType {
  attribute: Attribute | null;
  translations: {
    [key: string]: string;
  };
  isLoading: boolean;
  treeData: TreeNodeNormal[];
}

interface PropsType extends RouteComponentProps, FormComponentProps {
  client: ApolloClient<any>;
}

class EditAttribute extends React.PureComponent<PropsType, StateType> {
  state: StateType = {
    attribute: null,
    translations: {},
    isLoading: false,
    treeData: [],
  };

  mounted: boolean = false;

  componentDidMount() {
    this.fetchData();
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchData = () => {
    this.setState({ isLoading: true });
    const currentAttributeId = pathOr('', ['id'], this.props.match.params);
    this.props.client
      .query<EditAttributeAttributesListQuery, EditAttributeAttributesListQueryVariables>({
        query: EDIT_ATTRIBUTE_ATTRIBUTES_LIST_QUERY,
        variables: {
          id: currentAttributeId,
        },
        fetchPolicy: 'network-only',
      })
      .then(({ data }) => {
        const attribute = data.node ? (data.node as Attribute) : null;
        this.setState({ attribute });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  handleSave = (attributteData: AttributeData) => {
    this.setState({ isLoading: true });
    this.props.client
      .mutate<
        EditAttributeUpdateAttributeMutation,
        EditAttributeUpdateAttributeMutationVariables
        >({
        mutation: UPDATE_ATTRIBUTE_MUTATION,
        variables: {
          input: {
            clientMutationId: '',
            id: attributteData.id,
            name: attributteData.name,
            metaField: attributteData.metaField,
          },
        },
      })
      .then(({ data }) => {
        const attributeId = pathOr(null, ['updateAttribute', 'id'], data);
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

  handleCreateAttributeValue = (valueData: any) => {
    this.setState({ isLoading: true });
    this.props.client
      .mutate<
        CreateAttributeValueMutation,
        CreateAttributeValueMutationVariables
        >({
        mutation: CREATE_ATTRIBUTE_VALUE_MUTATION,
        variables: {
          input: {
            clientMutationId: '',
            rawAttributeId: valueData.attributeId,
            code: valueData.code,
            translations: valueData.translations,
          },
        },
      })
      .then(({ data }) => {
        const attribute = pathOr(null, ['createAttributeValue', 'attribute'], data);
        if (attribute && this.mounted) {
          this.setState({ attribute });
        }
      })
      .finally(() => {
        if (this.mounted) {
          this.setState({ isLoading: false });
        }
      });
  };

  handleUpdateAttributeValue = (valueData: any) => {
    this.setState({ isLoading: true });
    this.props.client
      .mutate<
        UpdateAttributeValueMutation,
        UpdateAttributeValueMutationVariables
        >({
        mutation: UPDATE_ATTRIBUTE_VALUE_MUTATION,
        variables: {
          input: {
            clientMutationId: '',
            rawId: valueData.valueId,
            rawAttributeId: valueData.attributeId,
            code: valueData.code,
            translations: valueData.translations,
          },
        },
      })
      .then(({ data }) => {
        const attribute = pathOr(null, ['updateAttributeValue', 'attribute'], data);
        if (attribute && this.mounted) {
          this.setState({ attribute });
        }
      })
      .finally(() => {
        if (this.mounted) {
          this.setState({ isLoading: false });
        }
      });
  };

  handleDeleteAttributeValue = (id: number) => {
    this.setState({ isLoading: true });
    this.props.client
      .mutate<
        DeleteAttributeValueMutation,
        DeleteAttributeValueMutationVariables
        >({
        mutation: DELETE_ATTRIBUTE_VALUE_MUTATION,
        variables: {
          input: {
            clientMutationId: '',
            rawId: id,
          },
        },
      })
      .then(({ data }) => {
        if (data && data.deleteAttributeValue && data.deleteAttributeValue.mock) {
          const { attribute } = this.state;
          if (attribute && this.mounted) {
            this.setState({
              attribute: { ...attribute, values: filter(item => item.rawId !== id, attribute.values || []) },
            });
          }
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
          size="small"
          onClick={() => {
            this.props.history.push('/attributes');
          }}
        >
          <Icon type="left" />
          Go back
        </Button>
        {this.state.attribute &&
          <CommonForm
            isLoading={this.state.isLoading}
            attribute={this.state.attribute}
            onCreateAttributeValue={this.handleCreateAttributeValue}
            onUpdateAttributeValue={this.handleUpdateAttributeValue}
            onDeleteAttributeValue={this.handleDeleteAttributeValue}
            onSave={this.handleSave}
          />
        }
      </Spin>
    );
  }
}

const EditAttributeWithClient = (props: PropsType) => (
  <ApolloConsumer>
    {(client: ApolloClient<any>) => <EditAttribute {...props} client={client} />}
  </ApolloConsumer>
);

const WrappedForm = Form.create()(EditAttributeWithClient);

export default withRouter(WrappedForm);
