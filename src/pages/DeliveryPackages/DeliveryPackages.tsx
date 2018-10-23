import * as React from 'react';
import { Button } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';

interface PropsType extends RouteComponentProps {
  companyId: number;
}

class DeliveryPackages extends React.PureComponent<PropsType> {
  render() {
    return (
      <div>
        <Button
          onClick={() => {
            this.props.history.push(
              `/delivery/companies/${this.props.companyId}/packages/new`,
            );
          }}
        >
          Create package
        </Button>
      </div>
    );
  }
}

export default withRouter(DeliveryPackages);
