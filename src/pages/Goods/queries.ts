import gql from 'graphql-tag';

const GOODS_BY_STORE_ID_QUERY = gql`
  query BaseProductsByStoreId(
    $id: Int!
    $searchTerm: SearchModeratorBaseProductInput!
  ) {
    store(id: $id) {
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
          }
        }
      }
    }
  }
`;

const PUBLISH_BASE_PRODUCT = gql`
  mutation PublishBaseProduct($id: Int!) {
    publishBaseProducts(ids: [$id]) {
      id
      rawId
      status
    }
  }
`;

const DRAFT_BASE_PRODUCT = gql`
  mutation DraftBaseProduct($id: Int!) {
    draftBaseProducts(ids: [$id]) {
      id
      rawId
      status
    }
  }
`;

export { GOODS_BY_STORE_ID_QUERY, PUBLISH_BASE_PRODUCT, DRAFT_BASE_PRODUCT };
