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

const STORE_PUBLISH_MUTATION = gql`
  mutation PublishStoreMutation($id: Int!) {
    publishStore(id: $id) {
      id
      rawId
      status
    }
  }
`;

const STORE_DRAFT_MUTATION = gql`
  mutation DraftStoreMutation($id: Int!) {
    draftStore(id: $id) {
      id
      rawId
      status
    }
  }
`;

export { STORES_LIST_QUERY, STORE_PUBLISH_MUTATION, STORE_DRAFT_MUTATION };
