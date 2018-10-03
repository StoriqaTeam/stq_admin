import gql from 'graphql-tag';

const ADD_CATEGORY_CATEGORIES_LIST = gql`
  query AddCategoryCategoriesListQuery {
    categories {
      id
      rawId
      name {
        lang
        text
      }
      children {
        id
        rawId
        name {
          lang
          text
        }
        children {
          id
          rawId
          name {
            lang
            text
          }
        }
      }
    }
  }
`;

const ADD_CATEGORY_CREATE_CATEGORY = gql`
  mutation AddCategoryCreateCategoryMutation($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
    }
  }
`;

export { ADD_CATEGORY_CATEGORIES_LIST, ADD_CATEGORY_CREATE_CATEGORY };
