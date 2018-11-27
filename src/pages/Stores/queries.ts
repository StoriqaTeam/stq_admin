import gql from 'graphql-tag';

const STORES_LIST_QUERY = gql`
  query StoresListQuery(
    $currentPage: Int!
    $itemsCount: Int!
    $searchTerm: SearchModeratorStoreInput!
  ) {
    me {
      id
      admin {
        storesSearchPages(
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
            node {
              id
              rawId
              name {
                lang
                text
              }
              status
              productsCount
              storeManager {
                id
                firstName
                lastName
                email
              }
              addressFull {
                country
              }
              warehouses {
                id
                products(currentPage: 1, itemsCount: 99999) {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const SET_MODERATION_STATUS_FOR_STORE_MUTATION = gql`
  mutation SetStoreModerationStatus($id: ID!, $status: Status!) {
    setModerationStatusStore(input: { id: $id, status: $status }) {
      id
      rawId
      status
    }
  }
`;

export { STORES_LIST_QUERY, SET_MODERATION_STATUS_FOR_STORE_MUTATION };
