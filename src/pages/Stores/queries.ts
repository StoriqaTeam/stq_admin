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
              storeSubscription {
                id
                currency
                walletAddress
                trialStartDate
                trialEndDate
                status
              }
              productsCount
              storeManager {
                id
                firstName
                lastName
                email
                phone
              }
              addressFull {
                value
                country
              }
              createdAt
              updatedAt
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

const UPDATE_STORE_SUBSCRIPTION_MUTATION = gql`
  mutation UpdateStoreSubscription($input: UpdateStoreSubscriptionInput!) {
    updateStoreSubscription(input: $input) {
      id
      status
    }
  }
`;

export { STORES_LIST_QUERY, SET_MODERATION_STATUS_FOR_STORE_MUTATION, UPDATE_STORE_SUBSCRIPTION_MUTATION };
