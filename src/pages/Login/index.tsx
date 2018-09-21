import * as React from 'react';
import { Form, Input, Button, Spin, Alert } from 'antd';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';
import { FormComponentProps } from 'antd/lib/form'; // tslint:disable-line
import { Redirect } from 'react-router-dom';

import { extractValidationErrorsFromGraphQLError } from '../../utils';
import {
  LoginMutation,
  LoginMutationVariables,
} from './__generated__/LoginMutation';
import { LoginMe } from './__generated__/LoginMe';

import styles from './index.scss';

const LOGIN_MUTATION = gql`
  mutation LoginMutation($input: CreateJWTEmailInput!) {
    getJWTByEmail(input: $input) {
      token
    }
  }
`;

const LOGIN_ME = gql`
  query LoginMe {
    me {
      id
    }
  }
`;

interface Props extends FormComponentProps {
  login: string;
  password: string;
}

class LoginForm extends React.PureComponent<Props> {
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Query<LoginMe> query={LOGIN_ME} fetchPolicy="network-only">
        {({ loading: qLoading, data: qData, error: qError, client }) => {
          console.log({ qLoading, qData, qError });
          return qData && qData.me ? (
            <Redirect to="/" />
          ) : (
            <Mutation<LoginMutation, LoginMutationVariables>
              mutation={LOGIN_MUTATION}
            >
              {(getJWTByEmail, { data, loading, error }) => {
                console.log({ data, loading, error });

                let validationErrors: { [k: string]: string } = {};
                if (error) {
                  validationErrors = extractValidationErrorsFromGraphQLError(
                    error,
                  );
                }

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
                    <Spin
                      spinning={loading || qLoading}
                      size="large"
                      className="spinner"
                    >
                      <Form
                        onSubmit={e => {
                          e.preventDefault();
                          const {
                            login,
                            password,
                          } = this.props.form.getFieldsValue() as {
                            login?: string;
                            password?: string;
                          };
                          if (login && password) {
                            getJWTByEmail({
                              variables: {
                                input: {
                                  clientMutationId: '',
                                  email: login,
                                  password,
                                },
                              },
                            }).then(resp => {
                              if (resp && resp.data) {
                                localStorage.setItem(
                                  'jwt',
                                  resp.data.getJWTByEmail.token,
                                );
                                window.location.href = '/';
                              }
                            });
                          }
                        }}
                      >
                        <Form.Item
                          label="Login"
                          validateStatus={
                            validationErrors.email ? 'error' : 'success'
                          }
                          help={validationErrors.email}
                        >
                          {getFieldDecorator('login')(
                            <Input placeholder="Login" />,
                          )}
                        </Form.Item>
                        <Form.Item
                          label="Password"
                          validateStatus={
                            validationErrors.password ? 'error' : 'success'
                          }
                          help={validationErrors.password}
                        >
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
        }}
      </Query>
    );
  }
}

const WrappedLoginForm = Form.create({})(LoginForm);

export default WrappedLoginForm;
