import * as React from 'react';
import { Form, Input, Button, Spin, Radio } from 'antd';
import { FormComponentProps } from 'antd/lib/form'; // tslint:disable-line
import { propOr, reject, isNil, isEmpty, anyPass } from 'ramda';

import * as styles from './FilterForm.scss';

export interface UserFormFilterType {
  email?: string;
  firstname?: string;
  lastname?: string;
  isBlocked?: boolean;
}

interface PropsType extends FormComponentProps {
  onApplyFilter: (data: UserFormFilterType) => void;
  loading: boolean;
}

class FilterForm extends React.PureComponent<PropsType> {
  handleSubmit = (e: React.FormEvent<any>) => {
    e.preventDefault();
    const fieldsValues = this.props.form.getFieldsValue() as {
      isBlocked?: string;
    };

    let isBlocked = null;
    if (fieldsValues.isBlocked === 'blocked') {
      isBlocked = true;
    } else if (fieldsValues.isBlocked === 'notblocked') {
      isBlocked = false;
    }

    const filters = {
      email: propOr(null, 'email', fieldsValues),
      firstname: propOr(null, 'firstname', fieldsValues),
      lastname: propOr(null, 'lastname', fieldsValues),
      isBlocked,
    };
    this.props.onApplyFilter(reject(anyPass([isNil, isEmpty]), filters));
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Spin spinning={this.props.loading}>
        <Form
          layout="inline"
          onSubmit={this.handleSubmit}
          className={styles.filterForm}
        >
          <Form.Item label="Email">
            {getFieldDecorator('email')(<Input placeholder="Email" data-test="email" />)}
          </Form.Item>
          <Form.Item label="First name">
            {getFieldDecorator('firstname')(<Input placeholder="First name" />)}
          </Form.Item>
          <Form.Item label="Last name">
            {getFieldDecorator('lastname')(<Input placeholder="Last name" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('isBlocked', { initialValue: 'all' })(
              <Radio.Group>
                <Radio.Button value="all">All</Radio.Button>
                <Radio.Button value="blocked">Blocked</Radio.Button>
                <Radio.Button value="notblocked">Not blocked</Radio.Button>
              </Radio.Group>,
            )}
          </Form.Item>
          <Form.Item>
            <Button type="default" htmlType="submit">
              Apply
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    );
  }
}

const WrappedForm = Form.create()(FilterForm);

export default WrappedForm;
