import * as React from 'react';
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  propOr,
  pathOr,
  map,
  prop,
  difference,
  head,
  append,
  reject,
  equals,
} from 'ramda';
import { Spin, Button, Icon } from 'antd';

import AttributesTable, { IAttribute } from './Table';
import {
  CATEGORY_ATTRIBUTES_QUERY,
  ADD_ATTRIBUTE_TO_CATEGORY_MUTATION,
  DELETE_ATTRIBUTE_FROM_CATEGORY_MUTATION,
} from './queries';
import {
  CategoryAttributesQuery,
  CategoryAttributesQueryVariables,
  CategoryAttributesQuery_node_Category as CategoryNode,
  CategoryAttributesQuery_attributes as Attributes,
} from './__generated__/CategoryAttributesQuery';
import {
  AddAttributeToCategoryMutation,
  AddAttributeToCategoryMutationVariables,
} from './__generated__/AddAttributeToCategoryMutation';
import {
  DeleteAttributeFromCategoryMutation,
  DeleteAttributeFromCategoryMutationVariables,
} from './__generated__/DeleteAttributeFromCategoryMutation';
import * as styles from './CategoryAttributes.scss';

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

interface StateType {
  isLoading: boolean;
  categoryAttributesIds: number[];
  attributes: IAttribute[];
  categoryRawId: number;
}

class CategoryAttributes extends React.Component<PropsType, StateType> {
  state: StateType = {
    isLoading: false,
    categoryAttributesIds: [],
    attributes: [],
    categoryRawId: -1,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    this.props.client
      .query<CategoryAttributesQuery, CategoryAttributesQueryVariables>({
        query: CATEGORY_ATTRIBUTES_QUERY,
        variables: {
          id: propOr('', 'id', this.props.match.params),
        },
      })
      .then(({ data }) => {
        const currentCategory = data.node as CategoryNode;
        const attrsDS = map(
          attr => ({
            id: attr.rawId,
            name: pathOr('undefined', ['name', 0, 'text'], attr),
          }),
          data.attributes || [],
        );
        this.setState({
          attributes: attrsDS,
          categoryAttributesIds: map(
            prop('rawId'),
            currentCategory.getAttributes,
          ),
          categoryRawId: currentCategory.rawId,
        });
      });
  };

  addAttribute = (attrId: number) => {
    this.setState({ isLoading: true });
    this.props.client
      .mutate<
        AddAttributeToCategoryMutation,
        AddAttributeToCategoryMutationVariables
      >({
        mutation: ADD_ATTRIBUTE_TO_CATEGORY_MUTATION,
        variables: {
          input: {
            clientMutationId: '',
            catId: this.state.categoryRawId,
            attrId: attrId,
          },
        },
      })
      .then(() => {
        this.setState(prevState => ({
          categoryAttributesIds: append(
            attrId,
            prevState.categoryAttributesIds,
          ),
        }));
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  deleteAttribute = (attrId: number) => {
    this.setState({ isLoading: true });
    this.props.client
      .mutate<
        DeleteAttributeFromCategoryMutation,
        DeleteAttributeFromCategoryMutationVariables
      >({
        mutation: DELETE_ATTRIBUTE_FROM_CATEGORY_MUTATION,
        variables: {
          input: {
            attrId: attrId,
            catId: this.state.categoryRawId,
            clientMutationId: '',
          },
        },
      })
      .then(() => {
        this.setState(prevState => ({
          categoryAttributesIds: reject(
            equals(attrId),
            prevState.categoryAttributesIds,
          ),
        }));
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  rowSelection = () => ({
    onChange: (selectedRowKeys: string[] | number[]) => {
      if (selectedRowKeys.length > this.state.categoryAttributesIds.length) {
        const id = head(
          difference(
            selectedRowKeys as number[],
            this.state.categoryAttributesIds,
          ),
        );
        if (id) {
          this.addAttribute(id);
        }
      } else if (
        selectedRowKeys.length < this.state.categoryAttributesIds.length
      ) {
        const id = head(
          difference(
            this.state.categoryAttributesIds,
            selectedRowKeys as number[],
          ),
        );
        if (id) {
          this.deleteAttribute(id);
        }
      }
    },
    getCheckboxProps: (record: IAttribute) => ({
      name: record.name,
    }),
    selectedRowKeys: this.state.categoryAttributesIds,
  });

  render() {
    return (
      <Spin spinning={this.state.isLoading}>
        <Button
          className={styles.backButton}
          size="small"
          onClick={() => {
            this.props.history.push('/categories');
          }}
        >
          <Icon type="left" />
          Go back
        </Button>
        <AttributesTable
          columns={[
            {
              title: 'Attribute name',
              dataIndex: 'name',
            },
          ]}
          dataSource={this.state.attributes}
          rowKey="id"
          rowClassName={_ => styles.row}
          pagination={false}
          rowSelection={this.rowSelection()}
        />
      </Spin>
    );
  }
}

const WrappedComponent = (props: PropsType) => (
  <ApolloConsumer>
    {client => <CategoryAttributes {...props} client={client} />}
  </ApolloConsumer>
);

export default withRouter(WrappedComponent);
