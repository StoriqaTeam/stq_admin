import * as React from 'react';
import { Query } from 'react-apollo';
import { withRouter, RouteComponentProps } from 'react-router';
import { pathOr, map, prop } from 'ramda';
import { Spin } from 'antd';

import {
  DeliveryCompanyQuery,
  DeliveryCompanyQueryVariables,
} from './__generated__/DeliveryCompanyQuery';
import { DELIVERY_COMPANY_QUERY } from './queries';
import CommonForm, { FormInputsType } from '../Form';

interface PropsType extends RouteComponentProps {
  //
}

class EditDeliveryCompany extends React.PureComponent<PropsType> {
  render() {
    return (
      <div>
        <Query<DeliveryCompanyQuery, DeliveryCompanyQueryVariables>
          query={DELIVERY_COMPANY_QUERY}
          fetchPolicy="network-only"
          variables={{
            id: parseInt(
              pathOr('-1', ['match', 'params', 'id'], this.props),
              10,
            ),
          }}
        >
          {({ data, error, loading }) => {
            console.log({ data });
            return (
              <Spin spinning={loading}>
                <h2>Edit delivery company</h2>
                {data &&
                  data.company && (
                    <CommonForm
                      onSubmit={(formData: FormInputsType) => {
                        console.log(formData);
                      }}
                      initialFormData={{
                        name: data.company.name,
                        logo: data.company.logo,
                        label: data.company.label,
                        description: data.company.description,
                        currency: data.company.currency,
                        deliveriesFrom: map(
                          prop('alpha3'),
                          data.company.deliveriesFrom,
                        ),
                      }}
                    />
                  )}
              </Spin>
            );
          }}
        </Query>
      </div>
    );
  }
}

export default withRouter(EditDeliveryCompany);
