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
        values {
          rawId
          code
          translations {
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
      values {
        rawId
        code
        translations {
          lang
          text
        }
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

const CREATE_ATTRIBUTE_VALUE_MUTATION = gql`
  mutation CreateAttributeValueMutation($input: CreateAttributeValueInput!) {
    createAttributeValue(input: $input) {
      rawId
      attrRawId
      code
      translations {
        lang
        text
      }
      attribute {
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
        values {
          rawId
          code
          translations {
            lang
            text
          }
        }
      }
    }
  }
`;

const UPDATE_ATTRIBUTE_VALUE_MUTATION = gql`
  mutation UpdateAttributeValueMutation($input: UpdateAttributeValueInput!) {
    updateAttributeValue(input: $input) {
      rawId
      attrRawId
      code
      translations {
        lang
        text
      }
      attribute {
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
        values {
          rawId
          code
          translations {
            lang
            text
          }
        }
      }
    }
  }
`;

const DELETE_ATTRIBUTE_VALUE_MUTATION = gql`
  mutation DeleteAttributeValueMutation($input: DeleteAttributeValueInput!) {
    deleteAttributeValue(input: $input) {
      mock
    }
  }
`;

export {
  EDIT_ATTRIBUTE_ATTRIBUTES_LIST_QUERY,
  UPDATE_ATTRIBUTE_MUTATION,
  CREATE_ATTRIBUTE_VALUE_MUTATION,
  UPDATE_ATTRIBUTE_VALUE_MUTATION,
  DELETE_ATTRIBUTE_VALUE_MUTATION,
};
