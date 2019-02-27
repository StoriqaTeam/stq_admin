import * as React from 'react';
import { Button, Modal, Spin } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import ApolloClient from 'apollo-client';
import { ApolloConsumer } from 'react-apollo';
import { map } from 'ramda';

import DeliveryCompaniesTable, { IDeliveryCompany } from './Table';
import { COMPANIES_LIST_QUERY, DELETE_COMPANY_MUTATION } from './queries';
import {
  DeleteCompanyMutation,
  DeleteCompanyMutationVariables,
} from './__generated__/DeleteCompanyMutation';
import { CompaniesListQuery } from './__generated__/CompaniesListQuery';
import * as styles from './DeliveryCompanies.scss';

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

interface StateType {
  dataSource: IDeliveryCompany[];
  isLoading: boolean;
}

class DeliveryCompanies extends React.Component<PropsType, StateType> {
  mounted: boolean = false;

  state = {
    dataSource: [],
    isLoading: false,
  };

  componentDidMount() {
    this.mounted = true;
    this.fetchData();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchData = () => {
    this.setState({ isLoading: true });
    this.props.client
      .query<CompaniesListQuery>({
        query: COMPANIES_LIST_QUERY,
        fetchPolicy: 'network-only',
      })
      .then(({ data }) => {
        if (!data || !this.mounted) {
          return;
        }
        this.setState({
          dataSource: map(
            item => ({
              id: item.rawId,
              name: item.name,
              logo: item.logo,
              label: item.label,
            }),
            data.companies || [],
          ),
        });
      })
      .finally(() => {
        if (this.mounted) {
          this.setState({ isLoading: false });
        }
      });
  };

  handleCompanyDelete = (id: number) => {
    Modal.confirm({
      title: 'Delete company',
      content: 'Are you sure to delete this company?',
      onOk: () =>
        this.props.client
          .mutate<
            DeleteCompanyMutation,
            DeleteCompanyMutationVariables
            >({
            mutation: DELETE_COMPANY_MUTATION,
            variables: {
              id,
            },
          })
          .then(() => {
            window.location.reload();
            return Promise.resolve({});
          }),
    });
  };

  render() {
    return (
      <Spin spinning={this.state.isLoading}>
        <div className={styles.addButtonWrapper}>
          <h2>Delivery companies</h2>
          <Button
            onClick={() => {
              this.props.history.push('/delivery/companies/new');
            }}
            data-test="add-delivery-company-button"
          >
            Add new
          </Button>
        </div>
        <DeliveryCompaniesTable
          columns={[
            {
              key: 'id',
              dataIndex: 'id',
              title: 'ID',
            },
            {
              key: 'logo',
              dataIndex: 'logo',
              title: 'Logo',
              render: (_, record) => (
                <img src={record.logo} alt="logo" style={{ maxHeight: 50 }} />
              ),
            },
            {
              key: 'name',
              dataIndex: 'name',
              title: 'Name',
            },
            {
              key: 'label',
              dataIndex: 'label',
              title: 'Label',
            },
            {
              key: 'actions',
              dataIndex: 'actions',
              title: 'Actions',
              render: (_, record) => (
                <div>
                  <Button
                    shape="circle"
                    icon="edit"
                    onClick={() => {
                      this.props.history.push(`/delivery/companies/${record.id}`);
                    }}
                  />
                  <Button
                    shape="circle"
                    icon="delete"
                    onClick={() => {
                      this.handleCompanyDelete(record.id);
                    }}
                  />
                </div>
              ),
              width: 100,
            },
          ]}
          dataSource={this.state.dataSource}
          pagination={false}
          rowKey="id"
          rowClassName={() => styles.row}
        />
      </Spin>
    );
  }
}

const DeliveryCompaniesWithClient = (props: PropsType) => (
  <ApolloConsumer>
    {client => <DeliveryCompanies {...props} client={client} />}
  </ApolloConsumer>
);

export default withRouter(DeliveryCompaniesWithClient);
