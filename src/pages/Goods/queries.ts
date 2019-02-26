import gql from 'graphql-tag';

const GOODS_BY_STORE_ID_QUERY = gql`
  query BaseProductsByStoreId(
    $id: Int!
    $searchTerm: SearchModeratorBaseProductInput!
  ) {
    store(id: $id, visibility: "active") {
      id
      rawId
      name {
        lang
        text
      }
      findProductsAdmin(searchTerm: $searchTerm) {
        edges {
          node {
            id
            rawId
            name {
              lang
              text
            }
            status
            category {
              name {
                lang
                text
              }
              parent {
                name {
                  lang
                  text
                }
                parent {
                  name {
                    lang
                    text
                  }
                }
              }
            }
            createdAt
            updatedAt
            isActive
            rating
            variants {
              all {
                id
                rawId
                price
                attributes {
                  attribute {
                    name {
                      text
                      lang
                    }
                  }
                  value
                }
              }
            }
            store(visibility: "active") {
              rawId
            }
          }
        }
      }
    }
  }
`;

const SET_MODERATION_STATUS_FOR_BASE_PRODUCT = gql`
  mutation SetModerationStatusForBaseProduct($id: ID!, $status: Status!) {
    setModerationStatusBaseProduct(input: { id: $id, status: $status }) {
      id
      rawId
      status
    }
  }
`;

export { GOODS_BY_STORE_ID_QUERY, SET_MODERATION_STATUS_FOR_BASE_PRODUCT };
