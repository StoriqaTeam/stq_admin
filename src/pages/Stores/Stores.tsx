import * as React from 'react';
import { Button, Menu, Dropdown, Icon, Spin } from 'antd';
import { ColumnProps } from 'antd/lib/table'; // tslint:disable-line
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';
import {
  concat,
  map,
  pathOr,
  findIndex,
  lensPath,
  over,
  whereEq,
  assoc,
} from 'ramda';

import StoresTable, { IStore } from './Table';
import {
  StoresListQuery,
  StoresListQueryVariables,
  StoresListQuery_me_admin_storesSearch_edges_node as StoresListQueryEdgeNode,
  StoresListQuery_me_admin_storesSearch_edges as StoresListQueryEdge,
} from './__generated__/StoresListQuery';
import {
  PublishStoreMutation,
  PublishStoreMutationVariables,
} from './__generated__/PublishStoreMutation';
import {
  DraftStoreMutation,
  DraftStoreMutationVariables,
} from './__generated__/DraftStoreMutation';
import { Status } from '../../../__generated__/globalTypes';
import {
  STORES_LIST_QUERY,
  STORE_PUBLISH_MUTATION,
  STORE_DRAFT_MUTATION,
} from './queries';

const RECORDS_PER_PAGE = 20;

interface PropsType {
  client: ApolloClient<any>;
}

interface StateType {
  first: number;
  after: string | null;
  dataSource: IStore[];
  isLoading: boolean;
  error: Error | null;
  hasNextPage: boolean;
}

class Stores extends React.Component<PropsType, StateType> {
  state: StateType = {
    first: RECORDS_PER_PAGE,
    after: null,
    dataSource: [],
    isLoading: false,
    error: null,
    hasNextPage: false,
  };

  columns: Array<ColumnProps<IStore>> = [];

  constructor(props: PropsType) {
    super(props);

    this.columns = [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
      },
      {
        key: 'ownerEmail',
        title: 'Email',
        dataIndex: 'ownerEmail',
      },
      {
        key: 'ownerFirstname',
        title: 'First name',
        dataIndex: 'ownerFirstname',
      },
      {
        key: 'ownerLastname',
        title: 'Last name',
        dataIndex: 'ownerLastname',
      },
      {
        key: 'country',
        title: 'Country',
        dataIndex: 'country',
      },
      {
        key: 'productsCount',
        title: 'Products',
        dataIndex: 'productsCount',
      },
      {
        key: 'status',
        title: 'Status',
        dataIndex: 'status',
        render: (_, record) => (
          <Dropdown
            overlay={
              <Menu
                onClick={({ key }) => {
                  this.changeStatusForStore(record.id, key as Status);
                }}
              >
                {map(
                  item => (
                    <Menu.Item key={item}>{item}</Menu.Item>
                  ),
                  Object.keys(Status),
                )}
              </Menu>
            }
          >
            <Button>
              {record.status} <Icon type="down" />
            </Button>
          </Dropdown>
        ),
      },
      {
        key: 'Created',
        title: 'createdAt',
        dataIndex: 'createdAt',
        render: () => '-',
      },
    ];
  }

  componentDidMount() {
    this.loadMore();
  }

  loadMore = () => {
    this.setState({ isLoading: true });
    this.props.client
      .query<StoresListQuery, StoresListQueryVariables>({
        query: STORES_LIST_QUERY,
        variables: {
          first: RECORDS_PER_PAGE,
          after: this.state.after,
          searchTerm: {},
        },
      })
      .then(({ data }) => {
        const after = pathOr(
          null,
          ['me', 'admin', 'storesSearch', 'pageInfo', 'endCursor'],
          data,
        );
        const hasNextPage = pathOr(
          null,
          ['me', 'admin', 'storesSearch', 'pageInfo', 'hasNextPage'],
          data,
        );
        const dsChunk = this.prepareDataSource(data);
        this.setState(prevState => ({
          dataSource: concat(prevState.dataSource, dsChunk),
          after,
          hasNextPage,
        }));
      })
      .catch(err => {
        this.setState({ error: err });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };

  prepareDataSource = (data: StoresListQuery): IStore[] => {
    const edges =
      (data.me &&
        data.me.admin.storesSearch &&
        data.me.admin.storesSearch.edges) ||
      [];
    return map((edge: StoresListQueryEdge) => {
      const node: StoresListQueryEdgeNode = edge.node;
      return {
        id: node.rawId,
        name: pathOr('', [0, 'text'], node.name),
        status: node.status,
        createdAt: new Date(), // TODO
        ownerFirstname: node.storeManager && node.storeManager.firstName,
        ownerLastname: node.storeManager && node.storeManager.lastName,
        ownerEmail: node.storeManager && node.storeManager.email,
        country: node.addressFull.country,
        productsCount: 1,
      };
    }, edges);
  };

  changeStatusForStore = (id: number, status: Status) => {
    if (status === 'DRAFT') {
      this.setState({ isLoading: true });
      this.props.client
        .mutate<DraftStoreMutation, DraftStoreMutationVariables>({
          mutation: STORE_DRAFT_MUTATION,
          variables: {
            id: id,
          },
        })
        .then(({ data }) => {
          const rawId = pathOr(null, ['draftStore', 'rawId'], data);
          const newStatus = pathOr(null, ['draftStore', 'status'], data);
          if (rawId && newStatus) {
            this.updateStatusForStoreInDS(rawId, newStatus);
          }
        })
        .finally(() => {
          this.setState({ isLoading: false });
        });
    } else if (status === 'PUBLISHED') {
      this.setState({ isLoading: true });
      this.props.client
        .mutate<PublishStoreMutation, PublishStoreMutationVariables>({
          mutation: STORE_PUBLISH_MUTATION,
          variables: {
            id: id,
          },
        })
        .then(({ data }) => {
          const rawId = pathOr(null, ['publishStore', 'rawId'], data);
          const newStatus = pathOr(null, ['publishStore', 'status'], data);
          if (rawId && newStatus) {
            this.updateStatusForStoreInDS(rawId, newStatus);
          }
        })
        .finally(() => {
          this.setState({ isLoading: false });
        });
    }
  };

  updateStatusForStoreInDS = (id: number, status: Status) => {
    const idx = findIndex(whereEq({ id: id }), this.state.dataSource);
    const lens = lensPath([idx]);
    this.setState(prevState => ({
      dataSource: over(lens, assoc('status', status), prevState.dataSource),
    }));
  };

  render() {
    return (
      <Spin spinning={this.state.isLoading}>
        <StoresTable
          columns={this.columns}
          dataSource={this.state.dataSource}
          rowKey={record => `${record.id}`}
          pagination={false}
          footer={() =>
            this.state.hasNextPage && (
              <Button
                block
                type="primary"
                loading={this.state.isLoading}
                onClick={this.loadMore}
              >
                Load more
              </Button>
            )
          }
        />
      </Spin>
    );
  }
}

export default (props: PropsType) => (
  <ApolloConsumer>
    {client => <Stores {...props} client={client} />}
  </ApolloConsumer>
);
