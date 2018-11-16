import gql from 'graphql-tag';

const EDIT_ATTRIBUTE_ATTRIBUTES_LIST_QUERY = gql`
  query EditAttributeAttributesListQuery($id: ID!) {
    node(id: $id) {
      ... on Attribute {
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
          uiElement
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
      valueType
      metaField {
        values
        translatedValues {
          translations {
            lang
            text
          }
        }
        uiElement
      }
    }
  }
`;

const UPDATE_ATTRIBUTE_MUTATION = gql`
  mutation EditAttributeUpdateAttributeMutation($input: UpdateAttributeInput!) {
    updateAttribute(input: $input) {
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
        uiElement
      }
    }
  }
`;

export { EDIT_ATTRIBUTE_ATTRIBUTES_LIST_QUERY, UPDATE_ATTRIBUTE_MUTATION };
