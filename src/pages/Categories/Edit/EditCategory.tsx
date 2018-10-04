import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Form, Button, Icon } from 'antd';
import { TreeNodeNormal } from 'antd/lib/tree-select/interface'; // tslint:disable-line
import { FormComponentProps } from 'antd/lib/form'; // tslint:disable-line
import { pathOr, map, assoc, reduce, toPairs, head, last } from 'ramda';
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';

import CommonForm from '../Form';
import {
  EDIT_CATEGORY_CATEGORIES_LIST_QUERY,
  UPDATE_CATEGORY_MUTATION,
} from './queries';
import {
  EditCategoryCategoriesListQuery as CategoriesListQuery,
  EditCategoryCategoriesListQuery_categories_children as Category1stLvl,
  EditCategoryCategoriesListQuery_categories_children_children as Category2ndLvl,
  EditCategoryCategoriesListQuery_node_Category as CategoryNode,
  EditCategoryCategoriesListQueryVariables,
} from './__generated__/EditCategoryCategoriesListQuery';
import {
  UpdateCategoryMutation,
  UpdateCategoryMutationVariables,
} from './__generated__/UpdateCategoryMutation';
import { Language } from '../../../../__generated__/globalTypes';

interface StateType {
  parentCategory: string;
  translations: {
    [key: string]: string;
  };
  isLoading: boolean;
  treeData: TreeNodeNormal[];
}

interface PropsType extends RouteComponentProps, FormComponentProps {
  client: ApolloClient<any>;
}

class EditCategory extends React.PureComponent<PropsType, StateType> {
  state: StateType = {
    parentCategory: '0',
    translations: {},
    isLoading: false,
    treeData: [],
  };

  componentDidMount() {
    this.fetchData();
  }

  prepareTreeListData = (data: CategoriesListQuery): TreeNodeNormal[] => {
    const currentCategoryId = pathOr(null, ['id'], this.props.match.params);
    if (!data.categories) {
      return [];
    }

    return [
      {
        key: `${data.categories.rawId}`,
        value: `${data.categories.rawId}`,
        title: pathOr('', ['name', 0, 'text'], data.categories),
        children: map(
          (cat1stLvl: Category1stLvl) => ({
            key: `${cat1stLvl.rawId}`,
            value: `${cat1stLvl.rawId}`,
            title: pathOr('', ['name', 0, 'text'], cat1stLvl),
            disabled: `${cat1stLvl.rawId}` === currentCategoryId,
            children: map(
              (cat2ndLvl: Category2ndLvl) => ({
                key: `${cat2ndLvl.rawId}`,
                value: `${cat2ndLvl.rawId}`,
                title: pathOr('', ['name', 0, 'text'], cat2ndLvl),
                isLeaf: true,
                disabled: `${cat2ndLvl.rawId}` === currentCategoryId,
              }),
              cat1stLvl.children,
            ),
          }),
          data.categories.children,
        ),
      },
    ];
  };

  handleTranslationChange = (lang: Language) => (
    e: React.FormEvent<EventTarget>,
  ) => {
    const target = e.target as HTMLInputElement;
    this.setState(prevState => {
      return {
        translations: assoc(lang, target.value, prevState.translations),
      };
    });
  };

  fetchData = () => {
    const currentCategoryId = pathOr('', ['id'], this.props.match.params);
    this.setState({ isLoading: true });
    this.props.client
      .query<CategoriesListQuery, EditCategoryCategoriesListQueryVariables>({
        query: EDIT_CATEGORY_CATEGORIES_LIST_QUERY,
        variables: {
          id: currentCategoryId,
        },
        fetchPolicy: 'network-only',
      })
      .then(({ data }) => {
        const categoryNode = data.node ? (data.node as CategoryNode) : null;
        let translations = {};
        if (categoryNode) {
          translations = reduce(
            (acc, item) => assoc(item.lang, item.text, acc),
            {},
            categoryNode.name,
          );
        }
        this.setState({
          treeData: this.prepareTreeListData(data),
          translations: translations,
          parentCategory:
            categoryNode && categoryNode.parentId
              ? `${categoryNode.parentId}`
              : '0',
        });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  handleSave = () => {
    const currentCategoryId = pathOr('', ['id'], this.props.match.params);
    this.setState({ isLoading: true });
    this.props.client
      .mutate<UpdateCategoryMutation, UpdateCategoryMutationVariables>({
        mutation: UPDATE_CATEGORY_MUTATION,
        variables: {
          input: {
            clientMutationId: '',
            id: currentCategoryId,
            parentId: parseInt(this.state.parentCategory, 10),
            name: map(
              item => ({
                lang: head(item),
                text: last(item),
              }),
              toPairs(this.state.translations),
            ) as Array<{ lang: Language; text: string }>,
          },
        },
      })
      .then(() => this.fetchData())
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  render() {
    return (
      <div>
        <Button
          size="small"
          onClick={() => {
            this.props.history.push('/categories');
          }}
        >
          <Icon type="left" />
          Go back
        </Button>
        <CommonForm
          isLoading={this.state.isLoading}
          treeData={this.state.treeData}
          parentCategory={this.state.parentCategory}
          translations={this.state.translations}
          onSave={this.handleSave}
          onTranslationChange={this.handleTranslationChange}
          onParentCategoryChange={(value: any) => {
            this.setState({ parentCategory: value });
          }}
        />
      </div>
    );
  }
}

const EditCategoryWithClient = (props: PropsType) => (
  <ApolloConsumer>
    {(client: ApolloClient<any>) => <EditCategory {...props} client={client} />}
  </ApolloConsumer>
);

const WrappedForm = Form.create()(EditCategoryWithClient);

export default withRouter(WrappedForm);
