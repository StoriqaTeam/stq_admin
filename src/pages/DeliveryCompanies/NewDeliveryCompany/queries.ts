import gql from 'graphql-tag';

const CREATE_COMPANY_MUTATION = gql`
  mutation CreateDeliveryCompanyMutation($input: NewCompanyInput!) {
    createCompany(input: $input) {
      id
      rawId
    }
  }
`;

export { CREATE_COMPANY_MUTATION };
