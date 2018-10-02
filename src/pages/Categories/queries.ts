import gql from 'graphql-tag';

const CATEGORIES_LIST_QUERY = gql`
  query CategoriesListQuery {
    categories {
      id
      rawId
      name {
        lang
        text
      }
      level
      children {
        id
        rawId
        name {
          lang
          text
        }
        level
        children {
          id
          rawId
          name {
            lang
            text
          }
          level
          children {
            id
            rawId
            name {
              lang
              text
            }
            level
            getAttributes {
              id
              rawId
              name {
                lang
                text
              }
              valueType
              metaField {
                values
                translatedValues {
                  translations {
                    lang
                    text
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

export { CATEGORIES_LIST_QUERY };
