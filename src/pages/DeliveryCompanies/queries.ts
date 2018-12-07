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

const DELETE_COMPANY_MUTATION = gql`
  mutation DeleteCompanyMutation($id: Int!) {
    deleteCompany(id: $id) {
      id
      rawId
    }
  }
`;

export { COMPANIES_LIST_QUERY, DELETE_COMPANY_MUTATION };
