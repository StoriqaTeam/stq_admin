import * as React from 'react';
import { Tree, Modal } from 'antd';
import { map, head } from 'ramda';

import { ICategory } from './Table';

const { TreeNode } = Tree;

type PropsType = {
  dataSource: ICategory[];
  sourceCategory: number;
  isOpened: boolean;
  onOk: (sourceCategoryId: number, destinationCategoryId: number) => void;
  onCancel: () => void;
};

type StateType = {
  selected: number | null;
};

class CategoriesTree extends React.Component<PropsType, StateType> {
  state = {
    selected: null,
  };

  onSelect = (selectedKeys: string[]) => {
    const idStr: string | undefined = head(selectedKeys);
    if (idStr != null) {
      const destinationId = parseInt(idStr, 10);
      this.setState({ selected: destinationId });
    }
  };

  render() {
    return (
      <Modal
        visible={this.props.isOpened}
        onOk={() => {
          const selected: number | null = this.state.selected;
          if (selected !== null) {
            this.props.onOk(this.props.sourceCategory, selected);
          }
        }}
        onCancel={this.props.onCancel}
      >
        <Tree showLine defaultExpandedKeys={['0']} onSelect={this.onSelect}>
          {map(
            item => (
              <TreeNode
                title={item.name}
                key={`${item.rawId}`}
                selectable={false}
              >
                {map(
                  subItem => (
                    <TreeNode
                      title={subItem.name}
                      key={`${subItem.rawId}`}
                      selectable={false}
                    >
                      {map(
                        subSubItem => (
                          <TreeNode
                            title={subSubItem.name}
                            key={`${subSubItem.rawId}`}
                          />
                        ),
                        subItem.children || [],
                      )}
                    </TreeNode>
                  ),
                  item.children || [],
                )}
              </TreeNode>
            ),
            this.props.dataSource,
          )}
        </Tree>
      </Modal>
    );
  }
}

export default CategoriesTree;
