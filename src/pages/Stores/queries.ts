import gql from 'graphql-tag';

const STORES_LIST_QUERY = gql`
  query StoresListQuery(
    $first: Int
    $after: ID
    $searchTerm: SearchModeratorStoreInput!
  ) {
    me {
      id
      admin {
        storesSearch(first: $first, after: $after, searchTerm: $searchTerm) {
          pageInfo {
            hasNextPage
            endCursor
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
