import * as React from 'react';
import { Form, Input, Button, Icon, Menu, Dropdown } from 'antd';
import { FormComponentProps } from 'antd/lib/form'; // tslint:disable-line
import { map } from 'ramda';

import * as styles from './FilterForm.scss';

export enum StatusFilter {
  ALL = 'ALL',
  DRAFT = 'DRAFT',
  MODERATION = 'MODERATION',
  DECLINE = 'DECLINE',
  BLOCKED = 'BLOCKED',
  PUBLISHED = 'PUBLISHED',
}

export interface GoodsFilterType {
  name?: string;
  status?: StatusFilter;
}

interface PropsType extends FormComponentProps {
  onApplyFilter: (data: GoodsFilterType) => void;
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
        <Form.Item label="Name">
          {getFieldDecorator('name')(<Input placeholder="Name" />)}
        </Form.Item>
        <Form.Item label="Status">
          {getFieldDecorator('status', { initialValue: StatusFilter.ALL })(
            <Dropdown
              overlay={
                <Menu
                  onClick={({ key }) => {
                    setFieldsValue({ status: key });
                  }}
                >
                  {map(
                    item => (
                      <Menu.Item key={item}>{item}</Menu.Item>
                    ),
                    Object.keys(StatusFilter),
                  )}
                </Menu>
              }
            >
              <Button>
                {getFieldValue('status')} <Icon type="down" />
              </Button>
            </Dropdown>,
          )}
        </Form.Item>
        <Form.Item>
          <Button onClick={this.handleSubmit}>Apply</Button>
        </Form.Item>
      </Form>
    );
  }
}

const WrapperForm = Form.create()(FilterForm);

export default WrapperForm;
