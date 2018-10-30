import gql from 'graphql-tag';

const DELIVERY_PACKAGE_BY_ID_QUERY = gql`
  query DeliveryPackageByIdQuery($id: Int!) {
    package(id: $id) {
      id
      rawId
      name
      minSize
      maxSize
      minWeight
      maxWeight
      deliveriesTo {
        alpha3
        children {
          alpha3
          children {
            alpha3
          }
        }
      }
    }
  }
`;

const UPDATE_DELIVERY_PACKAGE_MUTATION = gql`
  mutation UpdatePackageMutation($input: UpdatePackagesInput!) {
    updatePackage(input: $input) {
      id
      rawId
      name
      minSize
      maxSize
      minWeight
      maxWeight
      deliveriesTo {
        alpha3
        children {
          alpha3
          children {
            alpha3
          }
        }
      }
    }
  }
`;

export { DELIVERY_PACKAGE_BY_ID_QUERY, UPDATE_DELIVERY_PACKAGE_MUTATION };
