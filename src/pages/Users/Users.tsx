import * as React from 'react';
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { Button, Divider, Alert, Modal, Pagination } from 'antd';
import { ColumnProps } from 'antd/lib/table'; // tslint:disable-line
import {
  map,
  concat,
  whereEq,
  contains,
  findIndex,
  lensPath,
  over,
  set,
  append,
  reject,
  equals,
  pathOr,
  Lens,
  pick,
} from 'ramda';

import UsersTable from './Table';
import RoleCheckbox, { AvailableUserRoleType } from './RoleCheckbox';
import UsersTableFilterForm from './FilterForm';
import { getMutationForRole } from './RolesMutationsFactory';
import {
  USERS_QUERY,
  USERS_BLOCK_MUTATION,
  USERS_UNBLOCK_MUTATION,
} from './queries';
import {
  UsersListQuery,
  UsersListQueryVariables,
  UsersListQuery_me_admin_usersSearchPages_edges as UsersListEdges,
  UsersListQuery_me_admin_usersSearchPages_pageInfo as UsersListPageInfo,
} from './__generated__/UsersListQuery';
import {
  BlockUserMutation,
  BlockUserMutationVariables,
} from './__generated__/BlockUserMutation';
import {
  UnblockUserMutation,
  UnblockUserMutationVariables,
} from './__generated__/UnblockUserMutation';
import {
  UserMicroserviceRole,
  StoresMicroserviceRole,
} from '../../../__generated__/globalTypes';
import { UserFormFilterType } from './FilterForm';
import * as styles from './Users.scss';

export interface IUser {
  id: number;
  email: string;
  firstname: string | null;
  lastname: string | null;
  isBlocked: boolean;
  userMicroserviceRoles: UserMicroserviceRole[];
  storeMicroserviceRoles: StoresMicroserviceRole[];
}

interface PropsType {
  client: ApolloClient<any>;
}

interface StateType {
  isLoading: boolean;
  dataSource: IUser[];
  filters: UserFormFilterType;
  error: Error | null;
  openedModalUserId: number | null;
  pageInfo: {
    currentPage: number;
    pageItemsCount: number;
    totalPages: number;
  };
}

const RECORDS_PER_PAGE = 25;

class Users extends React.Component<PropsType, StateType> {
  state: StateType = {
    isLoading: false,
    dataSource: [],
    filters: {},
    error: null,
    openedModalUserId: null,
    pageInfo: {
      currentPage: 1,
      pageItemsCount: 10,
      totalPages: 1,
    },
  };

  columns: Array<ColumnProps<IUser>> = [];

  constructor(props: PropsType) {
    super(props);
    this.columns = [
      {
        key: 'id',
        title: 'Id',
        dataIndex: 'id',
      },
      {
        key: 'email',
        title: 'Email',
        dataIndex: 'email',
      },
      {
        key: 'firstname',
        title: 'First name',
        dataIndex: 'firstname',
      },
      {
        key: 'lastname',
        title: 'Last name',
        dataIndex: 'lastname',
      },
      {
        key: 'isBlocked',
        title: 'Blocked',
        dataIndex: 'isBlocked',
        render: (_, record) => {
          return (
            <Button
              className={styles.rowButton}
              type={record.isBlocked ? 'primary' : 'danger'}
              ghost
              onClick={this.toggleBlockingStatus(record.id, record.isBlocked)}
            >
              {record.isBlocked ? 'Unblock' : 'Block'}
            </Button>
          );
        },
      },
      {
        key: 'roles',
        title: 'Roles',
        dataIndex: 'roles',
        render: (_, record) => {
          return (
            <React.Fragment>
              <Button
                onClick={() => {
                  this.setState({ openedModalUserId: record.id });
                }}
              >
                Manage roles
              </Button>
              <Modal
                visible={this.state.openedModalUserId === record.id}
                onOk={() => {
                  this.setState({ openedModalUserId: null });
                }}
                onCancel={() => {
                  this.setState({ openedModalUserId: null });
                }}
              >
                <div className={styles.roleCheckboxesWrapper}>
                  <h3>{record.email}</h3>
                  <RoleCheckbox
                    role={UserMicroserviceRole.MODERATOR}
                    label="Block/unblock users"
                    checked={contains(
                      UserMicroserviceRole.MODERATOR,
                      record.userMicroserviceRoles,
                    )}
                    onRoleToggle={this.handleRoleAssign(record.id, 'users')}
                  />
                  <RoleCheckbox
                    role={UserMicroserviceRole.SUPERUSER}
                    label="Manage users roles"
                    checked={contains(
                      UserMicroserviceRole.SUPERUSER,
                      record.userMicroserviceRoles,
                    )}
                    onRoleToggle={this.handleRoleAssign(record.id, 'users')}
                  />
                  <Divider dashed className={styles.divider} />
                  <RoleCheckbox
                    role={StoresMicroserviceRole.MODERATOR}
                    label="Block/unblock stores"
                    checked={contains(
                      StoresMicroserviceRole.MODERATOR,
                      record.storeMicroserviceRoles,
                    )}
                    onRoleToggle={this.handleRoleAssign(record.id, 'stores')}
                  />
                  <RoleCheckbox
                    role={StoresMicroserviceRole.SUPERUSER}
                    label="Manage store roles"
                    checked={contains(
                      StoresMicroserviceRole.SUPERUSER,
                      record.storeMicroserviceRoles,
                    )}
                    onRoleToggle={this.handleRoleAssign(record.id, 'stores')}
                  />
                  <RoleCheckbox
                    role={StoresMicroserviceRole.PLATFORM_ADMIN}
                    label="Manage content (categories/attrs/etc)"
                    checked={contains(
                      StoresMicroserviceRole.PLATFORM_ADMIN,
                      record.storeMicroserviceRoles,
                    )}
                    onRoleToggle={this.handleRoleAssign(record.id, 'stores')}
                  />
                </div>
              </Modal>
            </React.Fragment>
          );
        },
      },
    ];
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    this.loadMore(() => {
      this.setState({ isLoading: false });
    });
  }

  toggleBlockingStatus = (rawId: number, isBlocked: boolean) => () => {
    this.setState({ error: null });
    if (!isBlocked) {
      this.setState({ isLoading: true });
      this.props.client
        .mutate<BlockUserMutation, BlockUserMutationVariables>({
          mutation: USERS_BLOCK_MUTATION,
          variables: { id: rawId },
        })
        .then(resp => {
          const { data } = resp;
          if (!data) {
            return;
          }
          this.updateBlockingStatusForUser(
            data.blockUser.rawId,
            data.blockUser.isBlocked,
          );
        })
        .catch(err => {
          this.setState({ error: err });
        })
        .finally(() => {
          this.setState({ isLoading: false });
        });
    } else {
      this.setState({ isLoading: true });
      this.props.client
        .mutate<UnblockUserMutation, UnblockUserMutationVariables>({
          mutation: USERS_UNBLOCK_MUTATION,
          variables: { id: rawId },
        })
        .then(resp => {
          const { data } = resp;
          if (!data) {
            return;
          }
          this.updateBlockingStatusForUser(
            data.unblockUser.rawId,
            data.unblockUser.isBlocked,
          );
        })
        .catch(err => {
          this.setState({ error: err });
        })
        .finally(() => {
          this.setState({ isLoading: false });
        });
    }
  };

  updateBlockingStatusForUser = (id: number, isBlocked: boolean) => {
    const recIdxForUpdate = findIndex(
      whereEq({ id: id }),
      this.state.dataSource,
    );
    const lens = lensPath([recIdxForUpdate, 'isBlocked']);
    this.setState(prevState => {
      return {
        dataSource: set(lens, isBlocked, prevState.dataSource),
      };
    });
  };

  updateRoleInState = (input: {
    userId: number;
    microservice: 'users' | 'stores';
    isAdding: boolean;
    role: UserMicroserviceRole | StoresMicroserviceRole;
  }) => {
    let rolesLens: Lens | null = null;
    const userIdx = findIndex(
      whereEq({ id: input.userId }),
      this.state.dataSource,
    );
    if (input.microservice === 'users') {
      rolesLens = lensPath([userIdx, 'userMicroserviceRoles']);
    } else if (input.microservice === 'stores') {
      rolesLens = lensPath([userIdx, 'storeMicroserviceRoles']);
    }
    if (!rolesLens) {
      return;
    }

    this.setState(prevState => ({
      dataSource: over(
        rolesLens as Lens,
        input.isAdding ? append(input.role) : reject(equals(input.role)),
        prevState.dataSource,
      ),
    }));
  };

  prepareDatasource = (edges: UsersListEdges[]): IUser[] =>
    map(
      ({ node }) => ({
        id: node.rawId,
        email: node.email,
        firstname: node.firstName,
        lastname: node.lastName,
        isBlocked: node.isBlocked,
        userMicroserviceRoles: node.rolesOnUserMicroservices || [],
        storeMicroserviceRoles: node.rolesOnStoresMicroservices || [],
      }),
      edges,
    );

  loadMore = (callback?: () => void) => {
    this.setState({ isLoading: true });
    this.props.client
      .query<UsersListQuery, UsersListQueryVariables>({
        query: USERS_QUERY,
        variables: {
          currentPage: this.state.pageInfo.currentPage,
          itemsCount: this.state.pageInfo.pageItemsCount,
          searchTerm: {
            email: this.state.filters.email,
            firstName: this.state.filters.firstname,
            lastName: this.state.filters.lastname,
            isBlocked: this.state.filters.isBlocked,
          },
        },
        fetchPolicy: 'network-only',
      })
      .then(({ data }) => {
        if (data.me && data.me.admin.usersSearchPages) {
          const newDataSourceChunk = this.prepareDatasource(
            data.me.admin.usersSearchPages.edges,
          );

          this.setState(prevState => {
            return {
              dataSource: concat(prevState.dataSource, newDataSourceChunk),
              pageInfo: pick(
                ['currentPage', 'pageItemsCount', 'totalPages'],
                (data.me &&
                  data.me.admin.usersSearchPages &&
                  data.me.admin.usersSearchPages.pageInfo) ||
                  prevState.pageInfo,
              ),
            };
          });
        }
      })
      .finally(() => {
        this.setState({ isLoading: false });
        if (callback) {
          callback();
        }
      });
  };

  handleFiltering = (data: UserFormFilterType) => {
    this.setState(
      {
        filters: data,
        dataSource: [],
      },
      () => {
        this.loadMore();
      },
    );
  };

  handleRoleAssign = (id: number, microservice: 'users' | 'stores') => (
    role: AvailableUserRoleType,
    checked: boolean,
  ) => {
    this.setState({ error: null });

    getMutationForRole({
      userId: id,
      role: role,
      checked: checked,
      client: this.props.client,
      microservice: microservice,
    })
      .then(data => {
        if (!data) {
          return;
        }

        this.updateRoleInState({
          userId: id,
          microservice: microservice,
          isAdding: checked,
          role: role,
        });
      })
      .catch(err => console.error); // tslint:disable-line
  };

  render() {
    return (
      <React.Fragment>
        {this.state.error && (
          <Alert
            type="error"
            message={pathOr(
              'Unknown error :(',
              ['graphQLErrors', 0, 'data', 'details', 'status'],
              this.state.error,
            )}
            className={styles.alert}
            closable
          />
        )}
        <UsersTableFilterForm
          loading={this.state.isLoading}
          onApplyFilter={this.handleFiltering}
        />
        <UsersTable
          loading={this.state.isLoading}
          pagination={false}
          size="middle"
          rowKey={row => row.email}
          rowClassName={() => styles.row}
          columns={this.columns}
          dataSource={this.state.dataSource}
          footer={() => (
            <Pagination
              showSizeChanger
              onShowSizeChange={(current, pageSize) => {
                this.setState(
                  {
                    dataSource: [],
                    pageInfo: {
                      ...this.state.pageInfo,
                      currentPage: current,
                      pageItemsCount: pageSize,
                    },
                  },
                  () => {
                    this.loadMore();
                  },
                );
              }}
              onChange={pageNumber => {
                this.setState(
                  {
                    dataSource: [],
                    pageInfo: {
                      ...this.state.pageInfo,
                      currentPage: pageNumber,
                    },
                  },
                  () => {
                    this.loadMore();
                  },
                );
              }}
              defaultCurrent={this.state.pageInfo.currentPage}
              total={
                this.state.pageInfo.totalPages *
                this.state.pageInfo.pageItemsCount
              }
            />
          )}
        />
      </React.Fragment>
    );
  }
}

export default (props: PropsType) => (
  <ApolloConsumer>
    {(client: ApolloClient<any>) => <Users {...props} client={client} />}
  </ApolloConsumer>
);
