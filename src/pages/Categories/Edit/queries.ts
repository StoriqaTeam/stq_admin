import gql from 'graphql-tag';

const EDIT_CATEGORY_CATEGORIES_LIST_QUERY = gql`
  query EditCategoryCategoriesListQuery($id: ID!) {
    node(id: $id) {
      ... on Category {
        id
        parentId
        name {
          lang
          text
        }
      }
    }
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

const UPDATE_CATEGORY_MUTATION = gql`
  mutation UpdateCategoryMutation($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
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

export { EDIT_CATEGORY_CATEGORIES_LIST_QUERY, UPDATE_CATEGORY_MUTATION };
