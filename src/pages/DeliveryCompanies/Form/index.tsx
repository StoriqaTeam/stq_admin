import * as React from 'react';
import { Form, Modal, Button, Spin, Input, Upload, Icon, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form'; // tslint:disable-line
import { pathOr } from 'ramda';

import { CountryPicker } from '../../../components/CountryPicker';
import * as styles from './Form.scss';

export type FormInputsType = {
  name: string;
  label: string;
  description: string | null;
  deliveriesFrom: string[];
  logo: string;
  currency: string;
};

interface PropsType extends FormComponentProps {
  onSubmit: (data: FormInputsType) => void;
  initialFormData?: FormInputsType;
}

interface StateType {
  isCountryPickerShown: boolean;
  logoUrl: string | null;
  isLogoUploading: boolean;
  countries: string[] | null;
}

class CommonForm extends React.Component<PropsType, StateType> {
  state = {
    isCountryPickerShown: false,
    logoUrl: null,
    isLogoUploading: false,
    countries: null,
  };

  static getDerivedStateFromProps(nextProps: PropsType, prevState: StateType) {
    const isCountriesInState = prevState.countries != null;
    const isLogoInState = prevState.logoUrl != null;
    return {
      logoUrl: isLogoInState
        ? prevState.logoUrl
        : nextProps.initialFormData
          ? nextProps.initialFormData.logo
          : null,
      countries: isCountriesInState
        ? prevState.countries
        : nextProps.initialFormData
          ? nextProps.initialFormData.deliveriesFrom
          : null,
    };
  }

  handleSubmit = (e: React.FormEvent<any>) => {
    e.preventDefault();

    if (!this.state.logoUrl) {
      message.error('Please upload logo');
      return;
    }

    const countries = this.state.countries || [];
    if (countries.length === 0) {
      message.error('Please choose countries');
      return;
    }

    this.props.form.validateFieldsAndScroll((err: any, values: any) => {
      if (!err) {
        this.props.onSubmit({
          name: values.name as string,
          label: values.label as string,
          description: values.description,
          deliveriesFrom: this.state.countries || [],
          logo: this.state.logoUrl || '',
          currency: 'STQ',
        });
      }
    });
  };

  beforeUpload = (file: any): boolean => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG or PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  handleChangeUpload = (info: any) => {
    if (pathOr(null, ['file', 'status'], info) === 'uploading') {
      this.setState({ isLogoUploading: true });
      return;
    } else if (pathOr(null, ['file', 'status'], info) === 'done') {
      this.setState({
        isLogoUploading: false,
        logoUrl: pathOr(null, ['file', 'response', 'url'], info),
      });
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { initialFormData } = this.props;
    const countries = this.state.countries || [];
    return (
      <Spin spinning={false}>
        <Form onSubmit={this.handleSubmit}>
          <Form.Item label="Name">
            {getFieldDecorator('name', {
              initialValue: initialFormData && initialFormData.name,
              rules: [
                {
                  required: true,
                  message: 'Please input name!',
                  whitespace: true,
                },
              ],
            })(<Input placeholder="Name" />)}
          </Form.Item>
          <Form.Item label="Label">
            {getFieldDecorator('label', {
              initialValue: initialFormData && initialFormData.label,
              rules: [
                {
                  required: true,
                  message: 'Please input label!',
                  whitespace: true,
                },
              ],
            })(<Input placeholder="Label" />)}
          </Form.Item>
          <Form.Item label="Description">
            {getFieldDecorator('description', {
              initialValue: initialFormData && initialFormData.description,
            })(<Input placeholder="Description" />)}
          </Form.Item>
          <Form.Item label="Choose countries">
            <div>
              <Button
                onClick={() => {
                  this.setState({ isCountryPickerShown: true });
                }}
                data-test="choose-countries-button"
              >
                Choose
              </Button>
              <span>&nbsp;&nbsp;Choosed {countries.length} items</span>
            </div>
          </Form.Item>
          <Form.Item label="Upload logo">
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              action={`${process.env.PRODUCT_URL}/images`}
              beforeUpload={this.beforeUpload}
              onChange={this.handleChangeUpload}
              headers={{
                Authorization: `Bearer ${localStorage.getItem('jwt')}`,
              }}
            >
              <div>
                <Icon type={this.state.isLogoUploading ? 'loading' : 'plus'} />
                <div className="ant-upload-text">Upload</div>
              </div>
            </Upload>
            {this.state.logoUrl && (
              <img
                src={this.state.logoUrl || ''}
                alt="logo"
                style={{ width: 100 }}
              />
            )}
          </Form.Item>
          <Form.Item className={styles.submitButtonWrapper}>
            <Button
              type="default"
              htmlType="submit"
              data-test="apply-delivery-company-button"
            >
              Apply
            </Button>
          </Form.Item>
        </Form>
        <Modal
          visible={this.state.isCountryPickerShown}
          onCancel={() => {
            this.setState({ isCountryPickerShown: false });
          }}
          onOk={() => {
            this.setState({ isCountryPickerShown: false });
          }}
        >
          <h3>Choose countries</h3>
          <CountryPicker
            onCheck={(keys: string[]) => {
              this.setState({ countries: keys });
            }}
            checkedCountries={countries}
          />
        </Modal>
      </Spin>
    );
  }
}

export default Form.create()(CommonForm);
