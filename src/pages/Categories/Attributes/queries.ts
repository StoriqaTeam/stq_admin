import gql from 'graphql-tag';

const CATEGORY_ATTRIBUTES_QUERY = gql`
  query CategoryAttributesQuery($id: ID!) {
    node(id: $id) {
      ... on Category {
        id
        rawId
        level
        getAttributes {
          id
          rawId
          name {
            lang
            text
          }
        }
      }
    }
    attributes {
      id
      rawId
      name {
        lang
        text
      }
    }
  }
`;

const ADD_ATTRIBUTE_TO_CATEGORY_MUTATION = gql`
  mutation AddAttributeToCategoryMutation(
    $input: AddAttributeToCategoryInput!
  ) {
    addAttributeToCategory(input: $input) {
      mock
    }
  }
`;

const DELETE_ATTRIBUTE_FROM_CATEGORY_MUTATION = gql`
  mutation DeleteAttributeFromCategoryMutation(
    $input: DeleteAttributeFromCategory!
  ) {
    deleteAttributeFromCategory(input: $input) {
      mock
    }
  }
`;

export {
  CATEGORY_ATTRIBUTES_QUERY,
  ADD_ATTRIBUTE_TO_CATEGORY_MUTATION,
  DELETE_ATTRIBUTE_FROM_CATEGORY_MUTATION,
};
