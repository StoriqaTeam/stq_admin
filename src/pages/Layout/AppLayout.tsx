import * as React from 'react';
import { Layout, Menu, Icon, Button } from 'antd';

import * as styles from './AppLayout.scss';

const { Header, Sider, Content } = Layout;

interface PropsType {
  children?: React.ReactNode;
}

interface StateType {
  collapsed: boolean;
}

class AppLayout extends React.PureComponent<PropsType, StateType> {
  state = {
    collapsed: false,
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  handleLogout = () => {
    localStorage.removeItem('jwt');
    window.location.href = '/';
  };

  renderSidebar = () => {
    return (
      <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[]}>
          <Menu.Item key="1">
            <Icon type="user" />
            <a
              className={styles.menuLink}
              href={`${process.env.PUBLIC_PATH}/users`}
            >
              Users
            </a>
          </Menu.Item>
          <Menu.Item key="2">
            <Icon type="shopping" />
            <a
              className={styles.menuLink}
              href={`${process.env.PUBLIC_PATH}/stores`}
            >
              Stores
            </a>
          </Menu.Item>
          <Menu.Item key="3">
            <Icon type="profile" />
            <a
              className={styles.menuLink}
              href={`${process.env.PUBLIC_PATH}/categories`}
            >
              Categories
            </a>
          </Menu.Item>
        </Menu>
      </Sider>
    );
  };

  render() {
    return (
      <Layout className={styles.container}>
        {this.renderSidebar()}
        <Layout>
          <Header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fff',
              padding: 0,
            }}
          >
            <Icon
              className={styles.trigger}
              type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
            <h2>Storiqa admin panel</h2>
            <Button
              type="primary"
              shape="circle"
              icon="logout"
              size="large"
              className={styles.logout}
              onClick={this.handleLogout}
            />
          </Header>
          <Content className={styles.content}>{this.props.children}</Content>
        </Layout>
      </Layout>
    );
  }
}

export default AppLayout;
