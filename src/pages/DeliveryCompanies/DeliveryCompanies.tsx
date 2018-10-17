import * as React from 'react';
import { Button } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';

import { CountryPicker } from '../../components/CountryPicker';
import * as styles from './DeliveryCompanies.scss';

interface PropsType extends RouteComponentProps {
  //
}

class DeliveryCompanies extends React.Component<PropsType> {
  render() {
    return (
      <div>
        <div className={styles.addButtonWrapper}>
          <Button
            onClick={() => {
              this.props.history.push('/delivery/companies/new');
            }}
          >
            Add new
          </Button>
        </div>
        <CountryPicker />
      </div>
    );
  }
}

export default withRouter(DeliveryCompanies);
