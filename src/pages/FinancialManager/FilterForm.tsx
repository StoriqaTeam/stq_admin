import * as React from 'react';
import { Form, Input, InputNumber, Button, Icon, Menu, Dropdown } from 'antd';
import { FormComponentProps } from 'antd/lib/form'; // tslint:disable-line
import { map } from 'ramda';

import * as styles from './FilterForm.scss';

export enum PaymentStateFilter {
  ALL = 'ALL',
  INITIAL = 'INITIAL',
  DECLINED = 'DECLINED',
  CAPTURED = 'CAPTURED',
  REFUND_NEEDED = 'REFUND_NEEDED',
  REFUNDED = 'REFUNDED',
  PAID_TO_SELLER = 'PAID_TO_SELLER',
  PAYMENT_TO_SELLER_NEEDED = 'PAYMENT_TO_SELLER_NEEDED',
}

export interface FinancialManagerFormFilterType {
  storeId?: string;
  orderSlug?: string;
  paymentState?: PaymentStateFilter;
}

interface PropsType extends FormComponentProps {
  onApplyFilter: (data: FinancialManagerFormFilterType) => void;
}

class FilterForm extends React.PureComponent<PropsType> {
  handleSubmit = (e: React.FormEvent<any>) => {
    e.preventDefault();
    const data = this.props.form.getFieldsValue();
    this.props.onApplyFilter(data);
  };

  render() {
    const {
      getFieldDecorator,
      setFieldsValue,
      getFieldValue,
    } = this.props.form;
    return (
      <Form
        layout="inline"
        onSubmit={this.handleSubmit}
        className={styles.form}
      >
        <Form.Item label="Store">
          {getFieldDecorator('storeId')(
            <InputNumber placeholder="Store" data-test="financial-manager-filter-storeId" />,
          )}
        </Form.Item>
        <Form.Item label="Order">
          {getFieldDecorator('orderSlug')(
            <InputNumber placeholder="Order" data-test="financial-manager-filter-orderSlug" />,
          )}
        </Form.Item>
        <Form.Item label="Status">
          {getFieldDecorator('paymentState', { initialValue: PaymentStateFilter.ALL })(
            <Dropdown
              overlay={
                <Menu
                  onClick={({ key }) => {
                    setFieldsValue({ paymentState: key });
                  }}
                >
                  {map(
                    item => (
                      <Menu.Item
                        key={item}
                        data-test={`financial-manager-filter-status-${item}`}
                      >
                        {item}
                      </Menu.Item>
                    ),
                    Object.keys(PaymentStateFilter),
                  )}
                </Menu>
              }
            >
              <Button>
                {getFieldValue('paymentState')}{' '}
                <Icon type="down" data-test="financial-manager-filter-status" />
              </Button>
            </Dropdown>,
          )}
        </Form.Item>
        <Form.Item>
          <Button onClick={this.handleSubmit} data-test="financial-manager-filter-apply">
            Apply
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

const WrapperForm = Form.create()(FilterForm);

export default WrapperForm;
