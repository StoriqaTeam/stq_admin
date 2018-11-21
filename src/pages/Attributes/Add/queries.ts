import gql from 'graphql-tag';

const ADD_ATTRIBUTE_CREATE_ATTRIBUTE = gql`
  mutation AddAttributeCreateAttributeMutation($input: CreateAttributeInput!) {
    createAttribute(input: $input) {
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
        code
        translations {
          lang
          text
        }
      }
    }
  }
`;

export { ADD_ATTRIBUTE_CREATE_ATTRIBUTE };
