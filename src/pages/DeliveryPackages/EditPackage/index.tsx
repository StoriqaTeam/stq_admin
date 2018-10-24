import * as React from 'react';
import { Button, message } from 'antd';
import ApolloClient from 'apollo-client';
import { ApolloConsumer } from 'react-apollo';
import { withRouter, RouteComponentProps } from 'react-router';
import { propOr, prop, map, omit } from 'ramda';

import CommonForm, { DeliveryPackageFormInputType } from '../Form';
import {
  DeliveryPackageByIdQuery,
  DeliveryPackageByIdQueryVariables,
  DeliveryPackageByIdQuery_package as DeliveryPackage,
} from './__generated__/DeliveryPackageByIdQuery';
import {
  UpdatePackageMutation,
  UpdatePackageMutationVariables,
  UpdatePackageMutation_updatePackage,
} from './__generated__/UpdatePackageMutation';
import {
  DELIVERY_PACKAGE_BY_ID_QUERY,
  UPDATE_DELIVERY_PACKAGE_MUTATION,
} from './queries';

interface PropsType extends RouteComponentProps {
  client: ApolloClient<any>;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
interface StateType {
  isLoading: boolean;
  package: Omit<DeliveryPackage, '__typename'> | null;
}

class EditPackage extends React.Component<PropsType, StateType> {
  mounted: boolean = false;
  state = {
    isLoading: false,
    package: null,
  };

  componentDidMount() {
    this.mounted = true;
    this.fetchData();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchData = () => {
    this.setStateSafe({ isLoading: true });
    this.props.client
      .query<DeliveryPackageByIdQuery, DeliveryPackageByIdQueryVariables>({
        query: DELIVERY_PACKAGE_BY_ID_QUERY,
        variables: {
          id: parseInt(propOr(-1, 'packageId', this.props.match.params), 10),
        },
      })
      .then(({ data }) => {
        this.setState({ package: data.package });
      })
      .finally(() => {
        this.setStateSafe({ isLoading: false });
      });
  };

  setStateSafe = (partialState: Partial<StateType>) => {
    if (this.mounted) {
      this.setState(prevState => ({
        ...prevState,
        ...partialState,
      }));
    }
  };

  handleFormSubmit = (input: DeliveryPackageFormInputType) => {
    this.setStateSafe({ isLoading: true });
    this.props.client
      .mutate<UpdatePackageMutation, UpdatePackageMutationVariables>({
        mutation: UPDATE_DELIVERY_PACKAGE_MUTATION,
        variables: {
          input: {
            clientMutationId: '',
            ...input,
            id: propOr('', 'id', this.state.package),
          },
        },
      })
      .then(({ data }) => {
        const pkg: UpdatePackageMutation_updatePackage | null = propOr(
          null,
          'updatePackage',
          data,
        );
        if (pkg) {
          this.setStateSafe({
            package: {
              name: pkg.name,
              minSize: pkg.minSize,
              maxSize: pkg.maxSize,
              minWeight: pkg.minWeight,
              maxWeight: pkg.maxWeight,
              id: pkg.id,
              rawId: pkg.rawId,
              deliveriesTo: map(prop('alpha3'), pkg.deliveriesTo),
            },
          });
          message.info('Updated');
        }
      })
      .catch(err => {
        message.error('Error :(');
      })
      .finally(() => {
        this.setStateSafe({ isLoading: false });
      });
  };

  render() {
    const pkg = this.state.package as DeliveryPackage | null;
    return (
      <React.Fragment>
        <Button
          size="small"
          icon="left"
          onClick={() => {
            this.props.history.push(
              `/delivery/companies/${propOr(
                '-1',
                'companyId',
                this.props.match.params,
              )}`,
            );
          }}
        >
          Go back
        </Button>
        <br />
        <br />
        <h2>Edit delivery package</h2>
        {pkg && (
          <CommonForm
            onSubmit={this.handleFormSubmit}
            initialData={{
              name: pkg.name,
              minSize: pkg.minSize,
              maxSize: pkg.maxSize,
              minWeight: pkg.minWeight,
              maxWeight: pkg.maxWeight,
              deliveriesTo: map(prop('alpha3'), pkg.deliveriesTo),
            }}
          />
        )}
      </React.Fragment>
    );
  }
}

const EditPackageWithClient = (props: PropsType) => (
  <ApolloConsumer>
    {client => <EditPackage {...props} client={client} />}
  </ApolloConsumer>
);

export default withRouter(EditPackageWithClient);
