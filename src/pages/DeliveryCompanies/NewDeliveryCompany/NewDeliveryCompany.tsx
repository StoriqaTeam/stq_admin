import * as React from 'react';

import CommonForm, { FormInputsType } from '../Form';

class NewDeliveryCompany extends React.PureComponent<{}> {
  handleSubmit = (data: FormInputsType) => {
    console.log('NewDeliveryCompany:handleSubmit', { data });
  };

  render() {
    return (
      <div>
        <CommonForm onSubmit={this.handleSubmit} />
      </div>
    );
  }
}

export default NewDeliveryCompany;
