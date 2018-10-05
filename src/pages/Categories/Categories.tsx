import * as React from 'react';
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { Button, Row, Spin } from 'antd';
import { ColumnProps } from 'antd/lib/table'; // tslint:disable-line
import { map, pathOr, ifElse, always, isEmpty } from 'ramda';
import { withRouter, RouteComponentProps } from 'react-router';

import CategoriesTable, { ICategory } from './Table';
import { CATEGORIES_LIST_QUERY } from './queries';
import {
  CategoriesListQuery,
  CategoriesListQuery_categories_children_children as Category2Lvl,
  CategoriesListQuery_categories_children_children_children as Category3Lvl,
} from './__generated__/CategoriesListQuery';
import * as styles from './Categories.scss';

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

interface StateType {
  dataSource: ICategory[];
  isLoading: boolean;
}

class Categories extends React.Component<PropsType, StateType> {
  state: StateType = {
    dataSource: [],
    isLoading: false,
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
            />
            {record.level === 3 && (
              <Button
                shape="circle"
                icon="tag"
                onClick={() => {
                  this.props.history.push(
                    `/categories/${record.id}/attributes`,
                  );
                }}
                className={styles.attributesBtn}
              />
            )}
            {/* <Button
              shape="circle"
              icon="delete"
              className={styles.deleteButton}
              onClick={() => {
                Modal.confirm({
                  title: 'Do you want to delete this item?',
                  content: `Deleting category "${record.name}"`,
                });
              }}
            /> */}
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
        name: pathOr('undefined', ['name', 0, 'text'], item),
        level: item.level,
        children: ifElse(
          isEmpty,
          always(null),
          map((itemLvl2: Category2Lvl) => ({
            id: itemLvl2.id,
            name: pathOr('undefined', ['name', 0, 'text'], itemLvl2),
            level: itemLvl2.level,
            children: ifElse(
              isEmpty,
              always(null),
              map((itemLvl3: Category3Lvl) => ({
                id: itemLvl3.id,
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

  render() {
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
