import gql from 'graphql-tag';

const USERS_QUERY = gql`
  query UsersListQuery(
    $currentPage: Int!
    $itemsCount: Int!
    $searchTerm: SearchUserInput!
  ) {
    me {
      id
      admin {
        usersSearchPages(
          currentPage: $currentPage
          itemsCount: $itemsCount
          searchTerm: $searchTerm
        ) {
          pageInfo {
            currentPage
            pageItemsCount
            totalPages
          }
          edges {
            cursor
            node {
              id
              rawId
              firstName
              lastName
              isBlocked
              email
              phone
              rolesOnUserMicroservices
              rolesOnStoresMicroservices
            }
          }
        }
      }
    }
  }
`;

const USERS_BLOCK_MUTATION = gql`
  mutation BlockUserMutation($id: Int!) {
    blockUser(id: $id) {
      id
      rawId
      isBlocked
    }
  }
`;

const USERS_UNBLOCK_MUTATION = gql`
  mutation UnblockUserMutation($id: Int!) {
    unblockUser(id: $id) {
      id
      rawId
      isBlocked
    }
  }
`;

const USER_ADD_ROLE_MUTATION = gql`
  mutation AddRoleToUserMutation($input: NewUsersRoleInput!) {
    addRoleToUserOnUsersMicroservice(input: $input) {
      userId
      name
    }
  }
`;

const USER_REMOVE_ROLE_MUTATION = gql`
  mutation RemoveRoleFromUserMutation($input: RemoveUsersRoleInput!) {
    removeRoleFromUserOnUsersMicroservice(input: $input) {
      userId
      name
    }
  }
`;

const USER_ADD_ROLE_TO_STORES_MUTATION = gql`
  mutation AddRoleToUserOnStores($input: NewStoresRoleInput!) {
    addRoleToUserOnStoresMicroservice(input: $input) {
      userId
      name
    }
  }
`;

const USER_REMOVE_ROLE_FROM_STORES_MUTATION = gql`
  mutation RemoveRoleFromUserOnStores($input: RemoveStoresRoleInput!) {
    removeRoleFromUserOnStoresMicroservice(input: $input) {
      userId
      name
    }
  }
`;

export {
  USERS_QUERY,
  USERS_BLOCK_MUTATION,
  USERS_UNBLOCK_MUTATION,
  USER_ADD_ROLE_MUTATION,
  USER_REMOVE_ROLE_MUTATION,
  USER_ADD_ROLE_TO_STORES_MUTATION,
  USER_REMOVE_ROLE_FROM_STORES_MUTATION,
};
