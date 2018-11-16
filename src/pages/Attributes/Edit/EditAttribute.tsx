import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Form, Button, Icon } from 'antd';
import { TreeNodeNormal } from 'antd/lib/tree-select/interface'; // tslint:disable-line
import { FormComponentProps } from 'antd/lib/form'; // tslint:disable-line
import { pathOr } from 'ramda';
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';

import CommonForm from '../Form';
import {
  EDIT_ATTRIBUTE_ATTRIBUTES_LIST_QUERY,
  UPDATE_ATTRIBUTE_MUTATION,
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
    const currentAttributeId = pathOr('', ['id'], this.props.match.params);
    this.setState({ isLoading: true });
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
      .then(({ data }: any) => {
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

  render() {
    return (
      <div>
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
            onSave={this.handleSave}
          />
        }
      </div>
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
