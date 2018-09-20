import * as React from 'react';
import { Form, Input, Button, Spin, Alert } from 'antd';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

import {
  LoginMutation,
  LoginMutationVariables,
} from './__generated__/LoginMutation';

import styles from './index.scss';

const LOGIN_MUTATION = gql`
  mutation LoginMutation($input: CreateJWTEmailInput!) {
    getJWTByEmail(input: $input) {
      token
    }
  }
`;

class LoginForm extends React.PureComponent {
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Mutation<LoginMutation, LoginMutationVariables>
        mutation={LOGIN_MUTATION}
      >
        {(getJWTByEmail, { data, loading, error }) => {
          console.log({ data, loading, error });
          return (
            <div className={styles.container}>
              {error && (
                <Alert
                  type="error"
                  message="Something went wrong"
                  closable
                  className={styles.banner}
                />
              )}
              <Spin spinning={loading} size="large" className="spinner">
                <Form
                  onSubmit={e => {
                    e.preventDefault();
                    const {
                      login,
                      password,
                    } = this.props.form.getFieldsValue();
                    getJWTByEmail({
                      variables: {
                        input: {
                          clientMutationId: '',
                          email: login,
                          password,
                        },
                      },
                    });
                  }}
                >
                  <Form.Item>
                    {getFieldDecorator('login')(<Input placeholder="Login" />)}
                  </Form.Item>
                  <Form.Item>
                    {getFieldDecorator('password')(
                      <Input placeholder="Password" type="password" />,
                    )}
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Login
                    </Button>
                  </Form.Item>
                </Form>
              </Spin>
            </div>
          );
        }}
      </Mutation>
    );
  }
}

const WrappedLoginForm = Form.create()(LoginForm);

export default WrappedLoginForm;
