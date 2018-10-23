import * as React from 'react';
import { Form, Spin, Input, Button, Modal, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form'; // tslint:disable-line
import { isEmpty, propOr } from 'ramda';

import { CountryPicker } from '../../../components/CountryPicker';
import * as styles from './Form.scss';

export type DeliveryPackageFormInputType = {
  name: string;
  minSize: number;
  maxSize: number;
  minWeight: number;
  maxWeight: number;
  deliveriesTo: string[];
};

interface PropsType extends FormComponentProps {
  initialData?: DeliveryPackageFormInputType;
  onSubmit: (data: DeliveryPackageFormInputType) => void;
}

interface StateType {
  isLoading: boolean;
  isCountryPickerShown: boolean;
  countries: string[];
}

class CommonForm extends React.PureComponent<PropsType, StateType> {
  state = {
    isLoading: false,
    isCountryPickerShown: false,
    countries: [],
  };

  handleSubmit = (e: React.FormEvent<any>) => {
    e.preventDefault();
    this.props.form.validateFields((err: any, values: any) => {
      if (err) {
        return;
      }

      if (isEmpty(this.state.countries)) {
        message.error('Choose countries, please');
        return;
      }

      this.props.onSubmit({
        name: propOr('-1', 'name', values),
        maxSize: parseFloat(propOr('-1', 'maxSize', values)),
        minSize: parseFloat(propOr('-1', 'minSize', values)),
        maxWeight: parseFloat(propOr('-1', 'maxWeight', values)),
        minWeight: parseFloat(propOr('-1', 'minWeight', values)),
        deliveriesTo: this.state.countries,
      });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Spin spinning={this.state.isLoading}>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <Form.Item label="Name">
            {getFieldDecorator('name', {
              rules: [{ type: 'string', required: true }],
            })(<Input />)}
          </Form.Item>
          <Form.Item label="Min size">
            {getFieldDecorator('minSize', {
              rules: [
                {
                  type: 'number',
                  required: true,
                  message: 'Please provide correct number',
                  transform: parseFloat,
                },
              ],
            })(<Input />)}
          </Form.Item>
          <Form.Item label="Max size">
            {getFieldDecorator('maxSize', {
              rules: [
                {
                  type: 'number',
                  required: true,
                  message: 'Please provide correct number',
                  transform: parseFloat,
                },
              ],
            })(<Input />)}
          </Form.Item>
          <Form.Item label="Min weight">
            {getFieldDecorator('minWeight', {
              rules: [
                {
                  type: 'number',
                  required: true,
                  message: 'Please provide correct number',
                  transform: parseFloat,
                },
              ],
            })(<Input />)}
          </Form.Item>
          <Form.Item label="Max weight">
            {getFieldDecorator('maxWeight', {
              rules: [
                {
                  type: 'number',
                  required: true,
                  message: 'Please provide correct number',
                  transform: parseFloat,
                },
              ],
            })(<Input />)}
          </Form.Item>
          <div>
            <div className={styles.countryButtonWrapper}>
              <Button
                onClick={() => {
                  this.setState({ isCountryPickerShown: true });
                }}
              >
                Choose countries
              </Button>
              <span>
                &nbsp;&nbsp;Choosed {this.state.countries.length}{' '}
                countries/regions
              </span>
            </div>
            <Modal
              visible={this.state.isCountryPickerShown}
              onOk={() => {
                this.setState({ isCountryPickerShown: false });
              }}
              onCancel={() => {
                this.setState({ isCountryPickerShown: false });
              }}
              destroyOnClose
            >
              <CountryPicker
                onCheck={(keys: string[]) => {
                  this.setState({ countries: keys });
                }}
                checkedCountries={this.state.countries}
              />
            </Modal>
          </div>
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

export default Form.create()(CommonForm);
