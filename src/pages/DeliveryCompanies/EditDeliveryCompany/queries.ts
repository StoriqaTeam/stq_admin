import gql from 'graphql-tag';

const DELIVERY_COMPANY_QUERY = gql`
  query DeliveryCompanyQuery($id: Int!) {
    company(id: $id) {
      id
      rawId
      name
      label
      description
      currency
      logo
      deliveriesFrom {
        alpha3
        children {
          alpha3
          children {
            alpha3
          }
        }
      }
      packages {
        id
        rawId
        name
        maxSize
        minSize
        maxWeight
        minWeight
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
  }
`;

const UPDATE_DELIVERY_COMPANY_MUTATION = gql`
  mutation UpdateDeliveryCompanyMutation($input: UpdateCompanyInput!) {
    updateCompany(input: $input) {
      id
      rawId
    }
  }
`;

export { DELIVERY_COMPANY_QUERY, UPDATE_DELIVERY_COMPANY_MUTATION };
