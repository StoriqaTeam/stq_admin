import * as React from 'react';
import { ApolloConsumer } from 'react-apollo';
import ApolloClient from 'apollo-client';
import { Button, Checkbox } from 'antd';
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
} from 'ramda';

import UsersTable from './Table';
import UsersTableFilterForm from './FilterForm';
import {
  USERS_QUERY,
  USERS_BLOCK_MUTATION,
  USERS_UNBLOCK_MUTATION,
  USER_ADD_ROLE_MUTATION,
  USER_REMOVE_ROLE_MUTATION,
} from './queries';
import {
  UsersListQuery,
  UsersListQueryVariables,
  UsersListQuery_me_admin_usersSearch_edges as UsersListEdges,
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
  AddRoleToUserMutation,
  AddRoleToUserMutationVariables,
} from './__generated__/AddRoleToUserMutation';
import {
  RemoveRoleFromUserMutation,
  RemoveRoleFromUserMutationVariables,
} from './__generated__/RemoveRoleFromUserMutation';
import { UserMicroserviceRole } from '../../../__generated__/globalTypes';
import { UserFormFilterType } from './FilterForm';
import * as styles from './Users.scss';

export interface IUser {
  id: number;
  email: string;
  firstname: string | null;
  lastname: string | null;
  isBlocked: boolean;
  roles: UserMicroserviceRole[];
}

interface PropsType {
  client: ApolloClient<any>;
}

interface StateType {
  isLoading: boolean;
  isLoadingMore: boolean;
  after: string | null | undefined;
  hasNextPage: boolean;
  dataSource: IUser[];
  filters: UserFormFilterType;
}

const RECORDS_PER_PAGE = 25;

class Users extends React.Component<PropsType, StateType> {
  state: StateType = {
    isLoading: false,
    isLoadingMore: false,
    after: null,
    hasNextPage: false,
    dataSource: [],
    filters: {},
  };

  columns: Array<ColumnProps<IUser>> = [];

  constructor(props: PropsType) {
    super(props);
    this.columns = [
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
            <div>
              <Checkbox
                onChange={checked =>
                  this.handleRoleAssign({
                    add: checked.target.checked,
                    id: record.id,
                    role: UserMicroserviceRole.MODERATOR,
                  })
                }
                checked={contains(UserMicroserviceRole.MODERATOR, record.roles)}
              >
                Moderator
              </Checkbox>
              <Checkbox
                onChange={checked =>
                  this.handleRoleAssign({
                    add: checked.target.checked,
                    id: record.id,
                    role: UserMicroserviceRole.SUPERUSER,
                  })
                }
                checked={contains(UserMicroserviceRole.SUPERUSER, record.roles)}
              >
                Superadmin
              </Checkbox>
            </div>
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

  addRoleToUser = (id: number, role: UserMicroserviceRole) => {
    const idx = findIndex(whereEq({ id: id }), this.state.dataSource);
    const lens = lensPath([idx, 'roles']);
    const ds = over(lens, append(role), this.state.dataSource);
    this.setState({ dataSource: ds });
  };

  deleteRoleFromUser = (id: number, role: UserMicroserviceRole) => {
    const idx = findIndex(whereEq({ id: id }), this.state.dataSource);
    const lens = lensPath([idx, 'roles']);
    const ds = over(lens, reject(equals(role)), this.state.dataSource);
    this.setState({ dataSource: ds });
  };

  prepareDatasource = (edges: UsersListEdges[]): IUser[] =>
    map(
      ({ node }) => ({
        id: node.rawId,
        email: node.email,
        firstname: node.firstName,
        lastname: node.lastName,
        isBlocked: node.isBlocked,
        roles: node.rolesOnUserMicroservices,
      }),
      edges,
    );

  loadMore = (callback?: () => void) => {
    this.setState({ isLoadingMore: true, isLoading: true });
    this.props.client
      .query<UsersListQuery, UsersListQueryVariables>({
        query: USERS_QUERY,
        variables: {
          first: RECORDS_PER_PAGE,
          after: this.state.after,
          searchTerms: {
            email: this.state.filters.email,
            firstName: this.state.filters.firstname,
            lastName: this.state.filters.lastname,
            isBlocked: this.state.filters.isBlocked,
          },
        },
        fetchPolicy: 'network-only',
      })
      .then(({ data }) => {
        if (data.me && data.me.admin.usersSearch) {
          const newDataSourceChunk = this.prepareDatasource(
            data.me.admin.usersSearch.edges,
          );

          this.setState(prevState => {
            return {
              dataSource: concat(prevState.dataSource, newDataSourceChunk),
              hasNextPage:
                (data.me &&
                  data.me.admin.usersSearch &&
                  data.me.admin.usersSearch.pageInfo.hasNextPage) ||
                false,
              after:
                data.me &&
                data.me.admin.usersSearch &&
                data.me.admin.usersSearch.pageInfo.endCursor,
            };
          });
        }
      })
      .finally(() => {
        this.setState({ isLoadingMore: false, isLoading: false });
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
        after: null,
      },
      () => {
        this.loadMore();
      },
    );
  };

  handleRoleAssign = (input: {
    id: number;
    role: UserMicroserviceRole;
    add: boolean;
  }) => {
    if (input.add) {
      this.props.client
        .mutate<AddRoleToUserMutation, AddRoleToUserMutationVariables>({
          mutation: USER_ADD_ROLE_MUTATION,
          variables: {
            input: {
              clientMutationId: '',
              userId: input.id,
              name: input.role,
            },
          },
        })
        .then(({ data }) => {
          if (!data) {
            return;
          }
          const { userId, name } = data.addRoleToUserOnUsersMicroservice;
          this.addRoleToUser(userId, name);
        });
    } else {
      this.props.client
        .mutate<
          RemoveRoleFromUserMutation,
          RemoveRoleFromUserMutationVariables
        >({
          mutation: USER_REMOVE_ROLE_MUTATION,
          variables: {
            input: {
              clientMutationId: '',
              name: input.role,
              userId: input.id,
            },
          },
        })
        .then(({ data }) => {
          if (!data) {
            return;
          }
          const { userId, name } = data.removeRoleFromUserOnUsersMicroservice;
          this.deleteRoleFromUser(userId, name);
        });
    }
  };

  render() {
    return (
      <React.Fragment>
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
          footer={() => {
            return (
              this.state.hasNextPage && (
                <Button
                  block
                  type="primary"
                  onClick={() => {
                    this.loadMore();
                  }}
                  loading={this.state.isLoadingMore}
                >
                  Load more
                </Button>
              )
            );
          }}
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
