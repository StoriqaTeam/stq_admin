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
        }
      }
    }
  }
`;

export { DELIVERY_COMPANY_QUERY };
