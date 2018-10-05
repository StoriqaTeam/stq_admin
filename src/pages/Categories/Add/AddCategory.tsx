import * as React from 'react';
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { TreeNodeNormal } from 'antd/lib/tree-select/interface'; // tslint:disable-line
import { map, pathOr, assoc, head, last, toPairs } from 'ramda';
import { withRouter, RouteComponentProps } from 'react-router';
import { Button, Icon } from 'antd';

import CommonForm from '../Form';
import {
  ADD_CATEGORY_CATEGORIES_LIST,
  ADD_CATEGORY_CREATE_CATEGORY,
} from './queries';
import {
  AddCategoryCategoriesListQuery,
  AddCategoryCategoriesListQuery_categories_children as Category1stLvl,
  AddCategoryCategoriesListQuery_categories_children_children as Category2ndLvl,
} from './__generated__/AddCategoryCategoriesListQuery';
import {
  AddCategoryCreateCategoryMutation,
  AddCategoryCreateCategoryMutationVariables,
} from './__generated__/AddCategoryCreateCategoryMutation';
import { Language } from '../../../../__generated__/globalTypes';

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

interface StateType {
  isLoading: boolean;
  treeData: TreeNodeNormal[];
  parentCategory: string;
  translations: {
    [key: string]: string;
  };
}

class AddCategory extends React.Component<PropsType, StateType> {
  state: StateType = {
    isLoading: false,
    treeData: [],
    parentCategory: '0',
    translations: {},
  };

  mounted: boolean = false;

  componentDidMount() {
    this.fetchData();
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  prepareTreeListData = (
    data: AddCategoryCategoriesListQuery,
  ): TreeNodeNormal[] => {
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
            children: map(
              (cat2ndLvl: Category2ndLvl) => ({
                key: `${cat2ndLvl.rawId}`,
                value: `${cat2ndLvl.rawId}`,
                title: pathOr('', ['name', 0, 'text'], cat2ndLvl),
                isLeaf: true,
              }),
              cat1stLvl.children,
            ),
          }),
          data.categories.children,
        ),
      },
    ];
  };

  fetchData() {
    this.setState({ isLoading: true });
    this.props.client
      .query<AddCategoryCategoriesListQuery>({
        query: ADD_CATEGORY_CATEGORIES_LIST,
        fetchPolicy: 'network-only',
      })
      .then(({ data }) => {
        this.setState({ treeData: this.prepareTreeListData(data) });
      })
      .finally(() => {
        if (this.mounted) {
          this.setState({ isLoading: false });
        }
      });
  }

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

  handleSave = () => {
    this.setState({ isLoading: true });
    this.props.client
      .mutate<
        AddCategoryCreateCategoryMutation,
        AddCategoryCreateCategoryMutationVariables
      >({
        mutation: ADD_CATEGORY_CREATE_CATEGORY,
        variables: {
          input: {
            clientMutationId: '',
            name: map(
              item => ({
                lang: head(item),
                text: last(item),
              }),
              toPairs(this.state.translations),
            ) as Array<{ lang: Language; text: string }>,
            parentId: parseInt(this.state.parentCategory, 10) || 0,
          },
        },
      })
      .then(({ data }) => {
        const categoryId = pathOr(null, ['createCategory', 'id'], data);
        if (categoryId) {
          this.props.history.push(`/categories/${categoryId}/edit`);
        }
      })
      .finally(() => {
        if (this.mounted) {
          this.setState({ isLoading: false });
        }
      });
  };

  handleParentCategoryChange = (value: any) => {
    this.setState({ parentCategory: value });
  };

  render() {
    return (
      <div>
        <Button
          onClick={() => {
            this.props.history.push('/categories');
          }}
          size="small"
        >
          <Icon type="left" />
          Go back
        </Button>
        <CommonForm
          isLoading={this.state.isLoading}
          treeData={this.state.treeData}
          parentCategory={this.state.parentCategory}
          translations={this.state.translations}
          onTranslationChange={this.handleTranslationChange}
          onParentCategoryChange={this.handleParentCategoryChange}
          onSave={this.handleSave}
        />
      </div>
    );
  }
}

const WrappedForm = (props: PropsType) => (
  <ApolloConsumer>
    {client => <AddCategory {...props} client={client} />}
  </ApolloConsumer>
);

export default withRouter(WrappedForm);
