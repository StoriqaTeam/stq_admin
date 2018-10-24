import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { pathOr, map, prop } from 'ramda';
import { Spin, Button } from 'antd';
import ApolloClient from 'apollo-client';
import { ApolloConsumer } from 'react-apollo';

import {
  DeliveryCompanyQuery,
  DeliveryCompanyQueryVariables,
  DeliveryCompanyQuery_company as DeliveryCompany,
  DeliveryCompanyQuery_company_packages as DeliveryCompanyPackage,
} from './__generated__/DeliveryCompanyQuery';
import {
  UpdateDeliveryCompanyMutation,
  UpdateDeliveryCompanyMutationVariables,
} from './__generated__/UpdateDeliveryCompanyMutation';
import {
  DELIVERY_COMPANY_QUERY,
  UPDATE_DELIVERY_COMPANY_MUTATION,
} from './queries';
import CommonForm, { FormInputsType } from '../Form';
import DeliveryPackages from '../../DeliveryPackages/DeliveryPackages';
import { IPackage } from '../../DeliveryPackages/PackagesTable';

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

interface StateType {
  isLoading: boolean;
  company: DeliveryCompany | null;
}

class EditDeliveryCompany extends React.Component<PropsType, StateType> {
  mounted: boolean = false;

  state = {
    isLoading: false,
    company: null,
  };

  handleSubmit = (formData: FormInputsType) => {
    const company: DeliveryCompany | null = this.state.company;
    this.props.client
      .mutate<
        UpdateDeliveryCompanyMutation,
        UpdateDeliveryCompanyMutationVariables
      >({
        mutation: UPDATE_DELIVERY_COMPANY_MUTATION,
        variables: {
          input: {
            clientMutationId: '',
            id: pathOr('', ['id'], company),
            deliveriesFrom: formData.deliveriesFrom,
            name: formData.name,
            logo: formData.logo,
            label: formData.label,
            description: formData.description,
          },
        },
      })
      .then(({ data }) => {
        if (data) {
          this.props.history.replace(
            `/delivery/companies/${pathOr(
              '',
              ['updateCompany', 'rawId'],
              data,
            )}`,
          );
        }
      });
  };

  componentDidMount() {
    this.mounted = true;
    this.fetchData();
  }

  fetchData = () => {
    if (!this.mounted) {
      return;
    }

    this.setState({ isLoading: true });
    this.props.client
      .query<DeliveryCompanyQuery, DeliveryCompanyQueryVariables>({
        query: DELIVERY_COMPANY_QUERY,
        fetchPolicy: 'network-only',
        variables: {
          id: parseInt(pathOr('-1', ['match', 'params', 'id'], this.props), 10),
        },
      })
      .then(({ data }) => {
        const inputData: DeliveryCompany | null = pathOr(
          null,
          ['company'],
          data,
        );
        if (this.mounted) {
          this.setState({
            company: inputData,
          });
        }
      })
      .finally(() => {
        if (this.mounted) {
          this.setState({ isLoading: false });
        }
      });
  };

  preparePackagesDataSource = (): IPackage[] =>
    map(
      pkg => ({
        id: pkg.id,
        rawId: pkg.rawId,
        name: pkg.name,
        minSize: pkg.minSize,
        maxSize: pkg.maxSize,
        minWeight: pkg.minWeight,
        maxWeight: pkg.maxWeight,
      }),
      pathOr([], ['packages'], this.state.company),
    );

  render() {
    const company = this.state.company;
    return (
      <div>
        <Spin spinning={this.state.isLoading}>
          <h2>Edit delivery company</h2>
          <Button
            icon="left"
            size="small"
            onClick={() => {
              this.props.history.push('/delivery');
            }}
          >
            Go back
          </Button>
          {company && (
            <React.Fragment>
              <CommonForm
                onSubmit={this.handleSubmit}
                initialFormData={{
                  name: (company as DeliveryCompany).name,
                  logo: (company as DeliveryCompany).logo,
                  label: (company as DeliveryCompany).label,
                  description: (company as DeliveryCompany).description,
                  currency: (company as DeliveryCompany).currency,
                  deliveriesFrom: map(
                    prop('alpha3'),
                    (company as DeliveryCompany).deliveriesFrom,
                  ),
                }}
              />
              <DeliveryPackages
                companyId={parseInt(
                  pathOr('-1', ['match', 'params', 'id'], this.props),
                  10,
                )}
                dataSource={this.preparePackagesDataSource()}
                client={this.props.client}
              />
            </React.Fragment>
          )}
        </Spin>
      </div>
    );
  }
}

const EditDeliveryCompanyWithClient = (props: PropsType) => (
  <ApolloConsumer>
    {client => <EditDeliveryCompany {...props} client={client} />}
  </ApolloConsumer>
);

export default withRouter(EditDeliveryCompanyWithClient);
