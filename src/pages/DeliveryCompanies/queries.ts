import gql from 'graphql-tag';

const COMPANIES_LIST_QUERY = gql`
  query CompaniesListQuery {
    companies {
      id
      rawId
      logo
      name
      label
    }
  }
`;

export { COMPANIES_LIST_QUERY };
