import gql from 'graphql-tag';

const CATEGORIES_LIST_QUERY = gql`
  query CategoriesListQuery {
    allCategories {
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

const REPLACE_CATEGORY_MUTATION = gql`
  mutation ReplaceCategoryMutation($input: CategoryReplaceInput!) {
    replaceCategory(input: $input) {
      id
    }
  }
`;

export { CATEGORIES_LIST_QUERY, REPLACE_CATEGORY_MUTATION };
