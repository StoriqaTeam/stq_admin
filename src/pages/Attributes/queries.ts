import gql from 'graphql-tag';

const ATTRIBUTES_LIST_QUERY = gql`
  query AttributesListQuery {
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

export { ATTRIBUTES_LIST_QUERY };
