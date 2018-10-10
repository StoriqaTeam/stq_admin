import * as React from 'react';
import { Spin, Button, Icon, Dropdown, Menu, Modal } from 'antd';
import { ColumnProps } from 'antd/lib/table'; // tslint:disable-line
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  propOr,
  map,
  pathOr,
  join,
  findIndex,
  over,
  whereEq,
  assoc,
  lensIndex,
} from 'ramda';
import { parse, format } from 'date-fns';

import GoodsTable, { IGood } from './Table';
import Subtable from './Subtable';
import FilterForm, { GoodsFilterType, StatusFilter } from './FilterForm';
import {
  GOODS_BY_STORE_ID_QUERY,
  PUBLISH_BASE_PRODUCT,
  DRAFT_BASE_PRODUCT,
} from './queries';
import {
  BaseProductsByStoreId,
  BaseProductsByStoreIdVariables,
  BaseProductsByStoreId_store_findProductsAdmin_edges as BaseProductEdge,
  BaseProductsByStoreId_store_findProductsAdmin_edges_node_variants_all as Variant,
  BaseProductsByStoreId_store_findProductsAdmin_edges_node_variants_all_attributes as Attribute,
} from './__generated__/BaseProductsByStoreId';
import {
  PublishBaseProduct,
  PublishBaseProductVariables,
} from './__generated__/PublishBaseProduct';
import {
  DraftBaseProduct,
  DraftBaseProductVariables,
} from './__generated__/DraftBaseProduct';
import {
  Status,
  SearchModeratorBaseProductInput,
} from '../../../__generated__/globalTypes';
import * as styles from './Goods.scss';

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

interface StateType {
  isLoading: boolean;
  dataSource: IGood[];
  storeInfo: { id: number; name: string } | null;
  searchTerm: SearchModeratorBaseProductInput;
}

class Goods extends React.Component<PropsType, StateType> {
  state: StateType = {
    isLoading: false,
    dataSource: [],
    storeInfo: null,
    searchTerm: {},
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
        render: (_, record) => (
          <Dropdown
            overlay={
              <Menu
                onClick={({ key }) => {
                  this.handleChangingStatusForProduct({
                    id: record.rawId,
                    status: key as Status,
                  });
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
    ];
  }

  componentDidMount() {
    this.fetchData();
  }

  handleChangingStatusForProduct = (input: { id: number; status: Status }) => {
    Modal.confirm({
      title: 'Are you sure?',
      content: `Change status for product with id ${input.id}`,
      onOk: () => {
        if (input.status === Status.PUBLISHED) {
          return this.props.client
            .mutate<PublishBaseProduct, PublishBaseProductVariables>({
              mutation: PUBLISH_BASE_PRODUCT,
              variables: {
                id: input.id,
              },
            })
            .then(({ data }) => {
              if (data) {
                const id = pathOr(
                  null,
                  ['publishBaseProducts', 0, 'rawId'],
                  data,
                );
                const status = pathOr(
                  null,
                  ['publishBaseProducts', 0, 'status'],
                  data,
                );
                if (id && status) {
                  this.updateStatusForRecord(id, status);
                }
              }
              return Promise.resolve();
            });
        } else if (input.status === Status.DRAFT) {
          return this.props.client
            .mutate<DraftBaseProduct, DraftBaseProductVariables>({
              mutation: DRAFT_BASE_PRODUCT,
              variables: {
                id: input.id,
              },
            })
            .then(({ data }) => {
              if (data) {
                const id = pathOr(
                  null,
                  ['draftBaseProducts', 0, 'rawId'],
                  data,
                );
                const status = pathOr(
                  null,
                  ['draftBaseProducts', 0, 'status'],
                  data,
                );
                if (id && status) {
                  this.updateStatusForRecord(id, status);
                }
              }
              return Promise.resolve();
            });
        }
      },
    });
  };

  updateStatusForRecord = (id: number, status: Status) => {
    const idx = findIndex(whereEq({ rawId: id }), this.state.dataSource);
    const statusLens = lensIndex(idx);
    this.setState(prevState => ({
      dataSource: over(
        statusLens,
        assoc('status', status),
        prevState.dataSource,
      ),
    }));
  };

  prepareDatasource = (data: BaseProductsByStoreId): IGood[] => {
    const baseProducts: BaseProductEdge[] =
      (data.store &&
        data.store.findProductsAdmin &&
        data.store.findProductsAdmin.edges) ||
      [];
    return map(
      edge => ({
        id: edge.node.id,
        rawId: edge.node.rawId,
        name: pathOr('noname', ['name', 0, 'text'], edge.node),
        status: edge.node.status,
        category: join(' / ', [
          pathOr(
            '-',
            ['parent', 'parent', 'name', 0, 'text'],
            edge.node.category,
          ),
          pathOr('-', ['parent', 'name', 0, 'text'], edge.node.category),
          pathOr('-', ['name', 0, 'text'], edge.node.category),
        ]),
        createdAt: parse(edge.node.createdAt),
        updatedAt: parse(edge.node.updatedAt),
        isActive: edge.node.isActive,
        rating: edge.node.rating,
        variants: map(
          (variant: Variant) => ({
            id: variant.rawId,
            price: variant.price,
            characteristics: map(
              (attr: Attribute) =>
                `${
                  attr.attribute
                    ? pathOr('', [0, 'text'], attr.attribute.name)
                    : ''
                }: ${attr.value}`,
              (variant.attributes && variant.attributes) || [],
            ),
          }),
          (edge.node.variants && edge.node.variants.all) || [],
        ),
      }),
      baseProducts,
    );
  };

  fetchData = () => {
    this.setState({ isLoading: true });
    this.props.client
      .query<BaseProductsByStoreId, BaseProductsByStoreIdVariables>({
        query: GOODS_BY_STORE_ID_QUERY,
        fetchPolicy: 'network-only',
        variables: {
          id: parseInt(propOr(0, 'id', this.props.match.params), 10),
          searchTerm: this.state.searchTerm,
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

  handleFilterChange = (data: GoodsFilterType) => {
    let status: Status | null = null;
    if (data.status === StatusFilter.PUBLISHED) {
      status = Status.PUBLISHED;
    } else if (data.status === StatusFilter.DRAFT) {
      status = Status.DRAFT;
    }

    this.setState(
      {
        dataSource: [],
        searchTerm: {
          name: data.name,
          state: status,
        },
      },
      () => {
        this.fetchData();
      },
    );
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
              href={`${process.env.PRODUCT_URL}/store/${
                this.state.storeInfo.id
              }`}
              target="_blank"
            >
              Link to shop
            </a>
          </div>
        )}
        <FilterForm onApplyFilter={this.handleFilterChange} />
        <GoodsTable
          columns={this.columns}
          dataSource={this.state.dataSource}
          rowKey="id"
          pagination={false}
          rowClassName={() => styles.row}
          expandedRowRender={(record: IGood) => (
            <Subtable
              columns={[
                {
                  key: 'id',
                  title: 'ID',
                  dataIndex: 'id',
                },
                {
                  key: 'characteristics',
                  title: 'Characteristics',
                  dataIndex: 'characteristics',
                  render: (_, rec) => join(';', rec.characteristics),
                },
                {
                  key: 'price',
                  title: 'Price',
                  dataIndex: 'price',
                },
              ]}
              dataSource={record.variants}
              rowKey="id"
              pagination={false}
            />
          )}
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
