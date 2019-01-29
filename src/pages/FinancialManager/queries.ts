import gql from 'graphql-tag';

const FINANCIAL_MANAGER_QUERY = gql`
  query FinancialManagerQuery(
    $currentPage: Int!
    $itemsCount: Int!
    $searchTerm: OrderBillingSearchInput!
  ) {
    me {
      id
      financialManager {
        orders(
          currentPage: $currentPage
          itemsCount: $itemsCount
          searchTerm: $searchTerm
        ) {
          pageInfo {
            currentPage
            pageItemsCount
            totalPages
          }
          edges {
            cursor
            node {
              id
              order {
                id
                slug
                createdAt
              }
              sellerCurrency
              totalAmount
              cashbackAmount
              invoiceId
              storeId
              state
              fee {
                id
                orderId
                amount
                status
                currency
                chargeId
              }
              store {
                name {
                  lang
                  text
                }
              }
              billingType
              russiaBillingInfo {
                id
                bankName
                branchName
                swiftBic
                taxId
                correspondentAccount
                currentAccount
                personalAccount
                beneficiaryFullName
              }
              internationalBillingInfo {
                id
                account
                currency
                name
                bank
                swift
                bankAddress
                country
                city
                recipientAddress
              }
            }
          }
        }
      }
    }
  }
`;

const SET_PAID_TO_SELLER_ORDER_STATE_MUTATION = gql`
  mutation SetPaidToSellerOrderState($input: PaidToSellerOrderStateInput!) {
    setPaidToSellerOrderState(input: $input) {
      mock
    }
  }
`;

export {
  FINANCIAL_MANAGER_QUERY,
  SET_PAID_TO_SELLER_ORDER_STATE_MUTATION,
};
