import * as React from 'react';
import { ApolloConsumer } from 'react-apollo';
import ApolloClient, { ApolloError } from 'apollo-client';
import { Button, Row, Spin, message } from 'antd';
import { ColumnProps } from 'antd/lib/table'; // tslint:disable-line
import { map, pathOr, ifElse, always, isEmpty } from 'ramda';
import { withRouter, RouteComponentProps } from 'react-router';

import CategoriesTable, { ICategory } from './Table';
import CategoriesTree from './CategoriesTree';
import { CATEGORIES_LIST_QUERY, REPLACE_CATEGORY_MUTATION } from './queries';
import {
  CategoriesListQuery,
  CategoriesListQuery_categories_children_children as Category2Lvl,
  CategoriesListQuery_categories_children_children_children as Category3Lvl,
} from './__generated__/CategoriesListQuery';
import {
  ReplaceCategoryMutation,
  ReplaceCategoryMutationVariables,
} from './__generated__/ReplaceCategoryMutation';
import * as styles from './Categories.scss';

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

interface StateType {
  dataSource: ICategory[];
  isLoading: boolean;
  isCategoryTreeOpenedFor: number | null;
}

class Categories extends React.Component<PropsType, StateType> {
  state: StateType = {
    dataSource: [],
    isLoading: false,
    isCategoryTreeOpenedFor: null,
  };

  columns: Array<ColumnProps<ICategory>> = [];

  constructor(props: PropsType) {
    super(props);

    this.columns = [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
      },
      {
        key: 'actions',
        title: 'Actions',
        dataIndex: 'actions',
        width: 150,
        render: (_, record) => (
          <React.Fragment>
            <Button
              shape="circle"
              icon="edit"
              onClick={() => {
                this.props.history.push(`/categories/${record.id}/edit`);
              }}
              title="Edit"
            />
            {record.level === 3 && (
              <>
                <Button
                  shape="circle"
                  icon="tag"
                  onClick={() => {
                    this.props.history.push(
                      `/categories/${record.id}/attributes`,
                    );
                  }}
                  className={styles.attributesBtn}
                  title="Attributes"
                />
                <Button
                  shape="circle"
                  icon="interation"
                  onClick={() => {
                    this.showCategoriesForTransfer(record.rawId);
                  }}
                  className={styles.attributesBtn}
                  title="Move goods to other category"
                />
              </>
            )}
          </React.Fragment>
        ),
      },
    ];
  }

  componentDidMount() {
    this.fetchCategories();
  }

  prepareDatasource = (data: CategoriesListQuery): ICategory[] => {
    const lvl1Categories: ICategory[] = map(item => {
      return {
        id: item.id,
        rawId: item.rawId,
        name: pathOr('undefined', ['name', 0, 'text'], item),
        level: item.level,
        children: ifElse(
          isEmpty,
          always(null),
          map((itemLvl2: Category2Lvl) => ({
            id: itemLvl2.id,
            rawId: itemLvl2.rawId,
            name: pathOr('undefined', ['name', 0, 'text'], itemLvl2),
            level: itemLvl2.level,
            children: ifElse(
              isEmpty,
              always(null),
              map((itemLvl3: Category3Lvl) => ({
                id: itemLvl3.id,
                rawId: itemLvl3.rawId,
                name: pathOr('undefined', ['name', 0, 'text'], itemLvl3),
                level: itemLvl3.level,
              })),
            )(itemLvl2.children),
          })),
        )(item.children),
      };
    }, (data.categories && data.categories.children) || []);
    return lvl1Categories;
  };

  fetchCategories = () => {
    this.setState({ isLoading: true });
    this.props.client
      .query<CategoriesListQuery>({
        query: CATEGORIES_LIST_QUERY,
      })
      .then(({ data }) => {
        this.setState({ dataSource: this.prepareDatasource(data) });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  showCategoriesForTransfer = (id: number) => {
    this.setState({ isCategoryTreeOpenedFor: id });
  };

  handleCategoryTransfer = (sourceId: number, destinationId: number) => {
    this.setState({ isCategoryTreeOpenedFor: null }, () => {
      this.props.client
        .mutate<ReplaceCategoryMutation, ReplaceCategoryMutationVariables>({
          mutation: REPLACE_CATEGORY_MUTATION,
          variables: {
            input: {
              clientMutationId: '',
              currentCategory: sourceId,
              newCategory: destinationId,
            },
          },
        })
        .then(({ data }) => {
          if (data && data.replaceCategory instanceof Array)
            message.info(
              `Successfully transfered ${
                data.replaceCategory.length
              } products!`,
            );
        })
        .catch((error: ApolloError) => {
          message.error(error.message);
        });
    });
  };

  render() {
    console.log({ state: this.state });
    return (
      <Spin spinning={this.state.isLoading}>
        <Row type="flex" justify="end" className={styles.addCategoryBtnWrapper}>
          <Button
            type="primary"
            onClick={() => {
              this.props.history.push('/categories/add');
            }}
          >
            New category
          </Button>
        </Row>
        <CategoriesTable
          columns={this.columns}
          dataSource={this.state.dataSource}
          pagination={false}
          rowKey={record => `${record.id}`}
          rowClassName={() => styles.row}
        />
        {this.state.isCategoryTreeOpenedFor != null && (
          <CategoriesTree
            dataSource={this.state.dataSource}
            sourceCategory={this.state.isCategoryTreeOpenedFor}
            isOpened
            onOk={this.handleCategoryTransfer}
            onCancel={() => {
              this.setState({ isCategoryTreeOpenedFor: null });
            }}
          />
        )}
      </Spin>
    );
  }
}

const CategoriesWithRouter = withRouter(Categories);

export default (props: PropsType) => (
  <ApolloConsumer>
    {client => <CategoriesWithRouter {...props} client={client} />}
  </ApolloConsumer>
);
