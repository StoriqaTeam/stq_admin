import * as React from 'react';
import { Form, TreeSelect, Spin, Input, Row, Col, Button } from 'antd';
import { TreeNodeNormal } from 'antd/lib/tree-select/interface'; // tslint:disable-line
import { map } from 'ramda';

import { Language } from '../../../__generated__/globalTypes';

interface PropsType {
  isLoading: boolean;
  treeData: TreeNodeNormal[];
  parentCategory: string;
  translations: {
    [key: string]: string;
  };
  onTranslationChange: (
    lang: Language,
  ) => (e: React.FormEvent<EventTarget>) => void;
  onSave: () => void;
  onParentCategoryChange: (value: any) => void;
}

class CommonForm extends React.PureComponent<PropsType> {
  render() {
    return (
      <Spin spinning={this.props.isLoading}>
        <Form layout="horizontal">
          <Form.Item label="Parent category">
            <TreeSelect
              treeData={this.props.treeData}
              treeDefaultExpandedKeys={[this.props.parentCategory]}
              onSelect={(value: string) => {
                this.props.onParentCategoryChange(value);
              }}
              value={this.props.parentCategory}
            />
          </Form.Item>
          <Row gutter={24}>
            {map(
              lang => (
                <Col span={8} key={lang}>
                  <Form.Item label={lang} key={lang}>
                    <Input
                      value={this.props.translations[lang]}
                      onChange={this.props.onTranslationChange(
                        lang as Language,
                      )}
                    />
                  </Form.Item>
                </Col>
              ),
              Object.keys(Language),
            )}
          </Row>
          <Form.Item />
        </Form>
        <Button onClick={this.props.onSave}>Save</Button>
      </Spin>
    );
  }
}

export default CommonForm;
