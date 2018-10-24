import * as React from 'react';
import { Layout, Menu, Icon, Button } from 'antd';
import { Link } from 'react-router-dom';

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
    window.location.href = process.env.PUBLIC_PATH || '/';
  };

  renderSidebar = () => {
    return (
      <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[]}>
          <Menu.Item key="1">
            <Icon type="user" />
            <Link className={styles.menuLink} to="/users">
              Users
            </Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Icon type="shopping" />
            <Link className={styles.menuLink} to="/stores">
              Stores
            </Link>
          </Menu.Item>
          <Menu.Item key="3">
            <Icon type="profile" />
            <Link className={styles.menuLink} to="/categories">
              Categories
            </Link>
          </Menu.Item>
          <Menu.Item key="4">
            <Icon type="global" />
            <Link className={styles.menuLink} to="/delivery">
              Delivery
              <br />
              companies
            </Link>
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
          <Content className={styles.content}>
            {this.props.children || 'Select menu item on the left side'}
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default AppLayout;
