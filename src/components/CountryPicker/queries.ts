import gql from 'graphql-tag';

const COUNTRY_PICKER_QUERY = gql`
  query CountryPickerQuery {
    countries {
      label
      parent
      level
      children {
        label
        parent
        level
        children {
          label
          parent
          level
          alpha2
          alpha3
          numeric
        }
        alpha2
        alpha3
        numeric
      }
      alpha2
      alpha3
      numeric
    }
  }
`;

export { COUNTRY_PICKER_QUERY };
