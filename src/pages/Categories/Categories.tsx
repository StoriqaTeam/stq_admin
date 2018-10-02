import * as React from 'react';
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { ColumnProps } from 'antd/lib/table'; // tslint:disable-line
import { map, pathOr, ifElse, always, isEmpty } from 'ramda';

import CategoriesTable, { ICategory } from './Table';
import { CATEGORIES_LIST_QUERY } from './queries';
import {
  CategoriesListQuery,
  CategoriesListQuery_categories_children_children as Category2Lvl,
  CategoriesListQuery_categories_children_children_children as Category3Lvl,
} from './__generated__/CategoriesListQuery';
import * as styles from './Categories.scss';

interface PropsType {
  client: ApolloClient<any>;
}

interface StateType {
  dataSource: ICategory[];
}

class Categories extends React.Component<PropsType, StateType> {
  state: StateType = {
    dataSource: [],
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
    ];
  }

  componentDidMount() {
    this.fetchCategories();
  }

  prepareDatasource = (data: CategoriesListQuery): ICategory[] => {
    const lvl1Categories: ICategory[] = map(item => {
      return {
        id: item.rawId,
        name: pathOr('undefined', ['name', 0, 'text'], item),
        level: item.level,
        children: ifElse(
          isEmpty,
          always(null),
          map((itemLvl2: Category2Lvl) => ({
            id: itemLvl2.rawId,
            name: pathOr('undefined', ['name', 0, 'text'], itemLvl2),
            level: itemLvl2.level,
            children: ifElse(
              isEmpty,
              always(null),
              map((itemLvl3: Category3Lvl) => ({
                id: itemLvl3.rawId,
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
    this.props.client
      .query<CategoriesListQuery>({
        query: CATEGORIES_LIST_QUERY,
      })
      .then(({ data }) => {
        this.setState({ dataSource: this.prepareDatasource(data) });
      });
  };

  render() {
    return (
      <div>
        <CategoriesTable
          columns={this.columns}
          dataSource={this.state.dataSource}
          pagination={false}
          rowKey={record => `${record.id}`}
          rowClassName={() => styles.row}
        />
      </div>
    );
  }
}

export default (props: PropsType) => (
  <ApolloConsumer>
    {client => <Categories {...props} client={client} />}
  </ApolloConsumer>
);
