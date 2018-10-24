import * as React from 'react';
import { Button, Spin, Modal } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import ApolloClient from 'apollo-client';

import PackagesTable, { IPackage } from './PackagesTable';
import * as styles from './DeliveryPackages.scss';
import { DELETE_PACKAGE_BY_ID_MUTATION } from './queries';
import {
  DeleteCompanyPackageMutation,
  DeleteCompanyPackageMutationVariables,
} from './__generated__/DeleteCompanyPackageMutation';

interface PropsType extends RouteComponentProps {
  companyId: number;
  dataSource: IPackage[];
  client: ApolloClient<any>;
}

interface StateType {
  isLoading: boolean;
}

class DeliveryPackages extends React.Component<PropsType, StateType> {
  state = {
    isLoading: false,
  };

  handlePackageDelete = (id: number) => {
    Modal.confirm({
      title: 'Delete package',
      content: 'Are you sure to delete this package?',
      onOk: () =>
        this.props.client
          .mutate<
            DeleteCompanyPackageMutation,
            DeleteCompanyPackageMutationVariables
          >({
            mutation: DELETE_PACKAGE_BY_ID_MUTATION,
            variables: {
              packageId: id,
              companyId: this.props.companyId,
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
        <Button
          style={{ marginBottom: 12 }}
          onClick={() => {
            this.props.history.push(
              `/delivery/companies/${this.props.companyId}/packages/new`,
            );
          }}
        >
          Create package
        </Button>
        <PackagesTable
          dataSource={this.props.dataSource}
          columns={[
            {
              key: 'id',
              dataIndex: 'rawId',
              title: 'ID',
            },
            {
              key: 'name',
              dataIndex: 'name',
              title: 'Name',
            },
            {
              key: 'minSize',
              dataIndex: 'minSize',
              title: 'Min size',
            },
            {
              key: 'maxSize',
              dataIndex: 'maxSize',
              title: 'Max size',
            },
            {
              key: 'minWeight',
              dataIndex: 'minWeight',
              title: 'Min weight',
            },
            {
              key: 'maxWeight',
              dataIndex: 'maxWeight',
              title: 'Max weight',
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
                      this.props.history.push(
                        `/delivery/companies/${this.props.companyId}/packages/${
                          record.rawId
                        }`,
                      );
                    }}
                  />
                  <Button
                    style={{ marginLeft: 6 }}
                    shape="circle"
                    icon="delete"
                    onClick={() => {
                      this.handlePackageDelete(record.rawId);
                    }}
                  />
                </div>
              ),
            },
          ]}
          pagination={false}
          rowKey="id"
          rowClassName={() => styles.row}
        />
      </Spin>
    );
  }
}

export default withRouter(DeliveryPackages);
