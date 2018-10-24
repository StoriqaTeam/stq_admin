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

const DELETE_PACKAGE_BY_ID_MUTATION = gql`
  mutation DeleteCompanyPackageMutation($companyId: Int!, $packageId: Int!) {
    deleteCompanyPackage(companyId: $companyId, packageId: $packageId) {
      id
      rawId
      companyId
    }
  }
`;

export {
  CREATE_DELIVERY_PACKAGE_MUTATION,
  CONNECT_PACKAGE_TO_COMPANY_MUTATION,
  DELETE_PACKAGE_BY_ID_MUTATION,
};
