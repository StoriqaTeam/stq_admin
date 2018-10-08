import * as React from 'react';
import { Spin, Button, Icon } from 'antd';
import { ColumnProps } from 'antd/lib/table'; // tslint:disable-line
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { propOr, map, pathOr } from 'ramda';
import { parse, format } from 'date-fns';

import GoodsTable, { IGood } from './Table';
import { GOODS_BY_STORE_ID_QUERY } from './queries';
import {
  BaseProductsByStoreId,
  BaseProductsByStoreIdVariables,
  BaseProductsByStoreId_store_baseProducts_edges as BaseProductEdge,
} from './__generated__/BaseProductsByStoreId';
import { Status } from '../../../__generated__/globalTypes';
import * as styles from './Goods.scss';

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

interface StateType {
  isLoading: boolean;
  dataSource: IGood[];
  storeInfo: { id: number; name: string } | null;
}

class Goods extends React.Component<PropsType, StateType> {
  state: StateType = {
    isLoading: false,
    dataSource: [],
    storeInfo: null,
  };

  columns: Array<ColumnProps<IGood>> = [];

  constructor(props: PropsType) {
    super(props);

    this.columns = [
      {
        key: 'id',
        title: 'ID',
        dataIndex: 'rawId',
      },
      {
        key: 'name',
        dataIndex: 'name',
        title: 'Name',
      },
      {
        key: 'status',
        dataIndex: 'status',
        title: 'Status',
      },
      {
        key: 'category',
        dataIndex: 'category',
        title: 'Category',
      },
      {
        key: 'created_at',
        dataIndex: 'createdAt',
        title: 'Created',
        render: (_, record) => format(record.createdAt, 'YYYY/MM/DD HH:mm'),
      },
      {
        key: 'updated_at',
        dataIndex: 'updatedAt',
        title: 'Updated',
        render: (_, record) => format(record.updatedAt, 'YYYY/MM/DD HH:mm'),
      },
      {
        key: 'is_active',
        dataIndex: 'isActive',
        title: 'Active',
        render: (_, record) => record.isActive && <Icon type="check" />,
      },
      {
        key: 'rating',
        dataIndex: 'rating',
        title: 'Rating',
      },
      {
        key: 'variants',
        dataIndex: 'variants',
        title: 'Variants',
      },
    ];
  }

  componentDidMount() {
    this.fetchData();
  }

  prepareDatasource = (data: BaseProductsByStoreId): IGood[] => {
    const baseProducts: BaseProductEdge[] =
      (data.store &&
        data.store.baseProducts &&
        data.store.baseProducts.edges) ||
      [];
    return map(
      edge => ({
        id: edge.node.id,
        rawId: edge.node.rawId,
        name: pathOr('noname', ['name', 0, 'text'], edge.node),
        status: edge.node.status,
        category: '',
        createdAt: parse(edge.node.createdAt),
        updatedAt: parse(edge.node.updatedAt),
        isActive: edge.node.isActive,
        rating: edge.node.rating,
        variants: [],
      }),
      baseProducts,
    );
  };

  fetchData = () => {
    this.setState({ isLoading: true });
    this.props.client
      .query<BaseProductsByStoreId, BaseProductsByStoreIdVariables>({
        query: GOODS_BY_STORE_ID_QUERY,
        variables: {
          id: parseInt(propOr(0, 'id', this.props.match.params), 10),
        },
      })
      .then(({ data }) => {
        this.setState({
          dataSource: this.prepareDatasource(data),
          storeInfo: data.store && {
            id: data.store.rawId,
            name: pathOr('Noname', ['name', 0, 'text'], data.store),
          },
        });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  render() {
    return (
      <Spin spinning={this.state.isLoading}>
        <Button
          size="small"
          onClick={() => {
            this.props.history.push('/stores');
          }}
          icon="left"
          className={styles.backButton}
        >
          Go back
        </Button>
        {this.state.storeInfo && (
          <div className={styles.header}>
            <h2>{this.state.storeInfo.name}</h2>
            <a
              href={`https://nightly.stq.cloud/store/${
                this.state.storeInfo.id
              }`}
              target="_blank"
            >
              Link to shop
            </a>
          </div>
        )}
        <GoodsTable
          columns={this.columns}
          dataSource={this.state.dataSource}
          rowKey="id"
          pagination={false}
          rowClassName={() => styles.row}
        />
      </Spin>
    );
  }
}

const WithClient = (props: PropsType) => (
  <ApolloConsumer>
    {client => <Goods {...props} client={client} />}
  </ApolloConsumer>
);

export default withRouter(WithClient);
