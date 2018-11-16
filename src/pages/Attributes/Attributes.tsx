import * as React from 'react';
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { Button, Row, Spin } from 'antd';
import { ColumnProps } from 'antd/lib/table'; // tslint:disable-line
import { map, pathOr } from 'ramda';
import { withRouter, RouteComponentProps } from 'react-router';

import AttributesTable, { IAttribute } from './Table';
import { ATTRIBUTES_LIST_QUERY } from './queries';
import {
  AttributesListQuery,
} from './__generated__/AttributesListQuery';
import * as styles from './Attributes.scss';

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

interface StateType {
  dataSource: IAttribute[];
  isLoading: boolean;
}

class Attributes extends React.Component<PropsType, StateType> {
  state: StateType = {
    dataSource: [],
    isLoading: false,
  };

  columns: Array<ColumnProps<IAttribute>> = [];

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
                this.props.history.push(`/attributes/${record.id}/edit`);
              }}
            />
            <Button
              shape="circle"
              icon="close"
              onClick={() => this.handleRemoveAttribute(record.id)}
            />
          </React.Fragment>
        ),
      },
    ];
  }

  componentDidMount() {
    this.fetchAttributes();
  }

  handleRemoveAttribute(id: string) {
    return id;
  }

  prepareDatasource = (data: AttributesListQuery): IAttribute[] => {
    const attributes: IAttribute[] = map(item => {
      return {
        id: item.id,
        name: pathOr('undefined', ['name', 0, 'text'], item),
      };
    }, data.attributes || []);
    return attributes;
  };

  fetchAttributes = () => {
    this.setState({ isLoading: true });
    this.props.client
      .query<AttributesListQuery>({
        query: ATTRIBUTES_LIST_QUERY,
        fetchPolicy: 'network-only',
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
              this.props.history.push('/attributes/add');
            }}
          >
            New attribute
          </Button>
        </Row>
        <AttributesTable
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

const AttributesWithRouter = withRouter(Attributes);

export default (props: PropsType) => (
  <ApolloConsumer>
    {client => <AttributesWithRouter {...props} client={client} />}
  </ApolloConsumer>
);
