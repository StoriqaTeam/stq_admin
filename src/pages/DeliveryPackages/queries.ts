import gql from 'graphql-tag';

const CREATE_DELIVERY_PACKAGE_MUTATION = gql`
  mutation CreateDeliveryPackage($input: NewPackagesInput!) {
    createPackage(input: $input) {
      id
      rawId
    }
  }
`;

const CONNECT_PACKAGE_TO_COMPANY_MUTATION = gql`
  mutation ConnectPackageToCompany($input: NewCompaniesPackagesInput!) {
    addPackageToCompany(input: $input) {
      id
      rawId
      packageId
      companyId
    }
  }
`;

export {
  CREATE_DELIVERY_PACKAGE_MUTATION,
  CONNECT_PACKAGE_TO_COMPANY_MUTATION,
};
