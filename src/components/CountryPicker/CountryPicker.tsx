import * as React from 'react';
import { Query } from 'react-apollo';
import { Tree, Spin } from 'antd';
import { map, sortBy, prop } from 'ramda';

import { COUNTRY_PICKER_QUERY } from './queries';
import {
  CountryPickerQuery,
  CountryPickerQuery_countries as Country1stLvl,
  CountryPickerQuery_countries_children as Country2ndLvl,
  CountryPickerQuery_countries_children_children as Country3rdLvl,
} from './__generated__/CountryPickerQuery';

interface PropsType {
  onCheck: (keys: string[]) => void;
  checkedCountries: string[];
}

interface StateType {
  expandedKeys: string[];
  autoExpandParent: boolean;
  selectedKeys: string[];
}

type TreeNodeType = {
  title: string;
  key: string;
  children: TreeNodeType[];
};

const TreeNode = Tree.TreeNode;
const sortFn = sortBy(prop('title'));

class CountryPicker extends React.Component<PropsType, StateType> {
  state = {
    expandedKeys: ['XAL'],
    autoExpandParent: true,
    // checkedKeys: [],
    selectedKeys: [],
  };

  static getDerivedStateFromProps(nextProps: PropsType, prevState: StateType) {
    return {
      checkedKeys: nextProps.checkedCountries,
    };
  }

  prepareTreeData = (country: Country1stLvl): TreeNodeType[] => [
    {
      title: country.label,
      key: country.alpha3,
      children: sortFn(
        map(
          (country2ndLvl: Country2ndLvl) => ({
            title: country2ndLvl.label,
            key: country2ndLvl.alpha3,
            children: sortFn(
              map(
                (country3rdLvl: Country3rdLvl) => ({
                  title: country3rdLvl.label,
                  key: country3rdLvl.alpha3,
                  children: [],
                }),
                country2ndLvl.children,
              ),
            ),
          }),
          country.children,
        ),
      ),
    },
  ];

  renderTreeNodes = (data: TreeNodeType[]) =>
    map(item => {
      if (item.children.length > 0) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }

      return <TreeNode {...item} />;
    }, data);

  render() {
    return (
      <Query<CountryPickerQuery>
        query={COUNTRY_PICKER_QUERY}
        fetchPolicy="cache-first"
      >
        {({ data, loading, error }) => {
          if (loading || !data) {
            return null;
          }
          const treeData = this.prepareTreeData(data.countries);
          return (
            <Spin spinning={loading}>
              <Tree
                checkable
                onExpand={(keys: string[]) => {
                  this.setState({ expandedKeys: keys });
                }}
                expandedKeys={this.state.expandedKeys}
                autoExpandParent={this.state.autoExpandParent}
                onCheck={(
                  keys: string[] | { checked: string[]; halfChecked: string[] },
                ) => {
                  this.props.onCheck(keys as string[]);
                }}
                checkedKeys={this.props.checkedCountries}
                selectedKeys={this.state.selectedKeys}
              >
                {this.renderTreeNodes(treeData)}
              </Tree>
            </Spin>
          );
        }}
      </Query>
    );
  }
}

export default CountryPicker;
