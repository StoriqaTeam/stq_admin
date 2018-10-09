import gql from 'graphql-tag';

const GOODS_BY_STORE_ID_QUERY = gql`
  query BaseProductsByStoreId($id: Int!) {
    store(id: $id) {
      id
      rawId
      name {
        lang
        text
      }
      baseProducts {
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
              id
              name {
                lang
                text
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

export { GOODS_BY_STORE_ID_QUERY };
