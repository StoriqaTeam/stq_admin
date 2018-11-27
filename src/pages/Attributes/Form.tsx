import * as React from 'react';
import { Form, Input, Row, Col, Button, Radio, Tag, Icon, Modal } from 'antd';
import { map, filter, assoc, last, head, toPairs, reduce, isNil, omit, fromPairs } from 'ramda';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import {
  EditAttributeAttributesListQuery_node_Attribute as Attribute,
} from './Edit/__generated__/EditAttributeAttributesListQuery';
import {
  Language,
  UIType,
  TranslationInput,
} from '../../../__generated__/globalTypes';

interface TranslatedValue {
  id: string;
  translations: TranslationInput[];
}

interface NewValue {
  id: number;
  code: string;
  translations: TranslationInput[];
}

interface StateType {
  translations: {
    [key: string]: string;
  };
  inputVisible: boolean;
  inputValue: string;
  translatedValues: TranslatedValue[];
  valuesTranslations: {
    [key: string]: string;
  };
  uiElement: UIType;
  newValues: NewValue[];
  code: string | null;
  editableId: number | string | null;
}

interface PropsType {
  isLoading: boolean;
  attribute?: Attribute;
  onCreateAttributeValue?: (data: any) => void;
  onUpdateAttributeValue?: (data: any) => void;
  onDeleteAttributeValue?: (id: number) => void;
  onSave: (data: any) => void;
}

const confirm = Modal.confirm;

class CommonForm extends React.Component<PropsType, StateType> {
  private inputRef = React.createRef<Input>();
  constructor(props: PropsType) {
    super(props);
    const { attribute } = props;
    let prepareData: StateType = {
      inputVisible: false,
      inputValue: '',
      valuesTranslations: {},
      translations: {},
      translatedValues: [],
      uiElement: UIType.COMBOBOX,
      newValues: [],
      code: null,
      editableId: null,
    };
    if (attribute && attribute.metaField) {
      const { translatedValues } = attribute.metaField;
      const { values } = attribute;
      prepareData = {
        ...prepareData,
        translations: reduce(
          (acc, item) => assoc(item.lang, item.text, acc),
          {},
          attribute.name,
        ),
        translatedValues: translatedValues ? translatedValues.map((item, index) => ({
          id: `${Date.now()}${index}`,
          translations: map(translation => ({ lang: translation.lang, text: translation.text }), item.translations),
        })) : [],
        uiElement: attribute.metaField.uiElement,
        newValues: map(item => ({
          id: item.rawId,
          code: item.code,
          translations: item.translations || [],
        }), values || []),
      };
    }

    this.state = prepareData;
  }
  static getDerivedStateFromProps(nextProps: PropsType, prevState: StateType) {
    const { attribute } = nextProps;
    if (attribute) {
      const newValues = map(item => ({
        id: item.rawId,
        code: item.code,
        translations: item.translations || [],
      }), attribute.values || []);
      if (JSON.stringify(newValues) !== JSON.stringify(prevState.newValues)) {
        return {
          newValues,
          inputVisible: false,
          valuesTranslations: {},
          code: null,
          editableId: null,
        };
      }
    }
    return null;
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => {
      // this.inputRef.current!.focus();
    });
  };

  handleUIElementChange = (uiElement: UIType) => {
    this.setState({ uiElement });
  };

  handleInputsConfirm = () => {
    this.setState((prevState: StateType) => {
      const { translatedValues, valuesTranslations, newValues, code, editableId } = prevState;
      const translatedValue = {
        id: Date.now(),
        translations: filter(item => item.text !== '', map(
          item => ({
            lang: head(item),
            text: last(item),
          }),
          toPairs(valuesTranslations))),
      };
      const translations = filter(item => item.text !== '', map(
        item => ({
          lang: head(item),
          text: last(item),
        }),
        toPairs(valuesTranslations)));
      if (!code) {
        return prevState;
      }
      const value = {
        id: Date.now(),
        code,
        translations,
      };

      const { attribute, onCreateAttributeValue, onUpdateAttributeValue } = this.props;

      if (attribute) {
        if (editableId && onUpdateAttributeValue) {
          onUpdateAttributeValue({
            valueId: editableId,
            attributeId: attribute.rawId,
            code,
            translations,
          });
          return;
        }
        if (!editableId && onCreateAttributeValue) {
          onCreateAttributeValue({
            attributeId: attribute.rawId,
            code,
            translations,
          });
        }
        return;
      }

      return ({
        translatedValues: [...translatedValues, translatedValue],
        newValues: editableId
          ? map(item => editableId === item.id ? value : item, newValues)
          : [...newValues, value],
        inputVisible: false,
        valuesTranslations: {},
        code: null,
        editableId: null,
      });
    });
  };

  handleInputsClosed = () => {
    this.setState({
      inputVisible: false,
      valuesTranslations: {},
      editableId: null,
      code: null,
    });
  };

  reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  handleDragEndTranslatable = (result: any) => {
    if (!result.source || !result.destination || this.props.attribute) {
      return;
    }
    this.setState((prevState: StateType) => ({
      newValues: this.reorder(prevState.newValues, result.source.index, result.destination.index),
    }));
  };

  handleDeleteItem = (id: number) => {
    const { attribute, onDeleteAttributeValue } = this.props;
    if (attribute && onDeleteAttributeValue) {
      onDeleteAttributeValue(id);
      return;
    }

    this.setState((prevState: StateType) => ({
      newValues: filter(item => id !== item.id, prevState.newValues),
    }));
  };

  handleEditItem = (value: NewValue) => {
    const translations: any = map(item => ([item.lang, item.text]), value.translations);
    this.setState({
      editableId: value.id,
      code: value.code,
      inputVisible: true,
      valuesTranslations: fromPairs(translations),
    });
  };

  handleTranslatableValuesChange = (lang: Language) => (
    e: React.FormEvent<EventTarget>,
  ) => {
    const target = e.target as HTMLInputElement;
    this.setState(prevState => {
      return {
        valuesTranslations: assoc(lang, target.value, prevState.valuesTranslations),
      };
    });
  };

  handleTranslationChange = (lang: Language) => (
    e: React.FormEvent<EventTarget>,
  ) => {
    const target = e.target as HTMLInputElement;
    this.setState(prevState => {
      return {
        translations: assoc(lang, target.value, prevState.translations),
      };
    });
  };

  handleSave = () => {
    const { attribute } = this.props;
    const {
      translations,
      uiElement,
    } = this.state;
    const name = map(
      item => ({
        lang: head(item),
        text: last(item),
      }),
      toPairs(translations),
    ) as TranslationInput[];
    const newValues = map(item => ({
      code: item.code,
      translations: item.translations,
    }), this.state.newValues);
    const data = {
      valueType: 'STR',
      name,
      values: map(item => ({
        code: item.code,
        translations: item.translations,
      }), newValues),
      metaField: {
        uiElement,
      },
    };
    this.props.onSave(attribute ? { ...omit(['valueType', 'values'], data), id: attribute.id } : data);
  };

  handleNewValueCodeChange = (e: any) => {
    this.setState({ code: e.target.value });
  };

  showConfirmDeleteItem = (id: number) => {
    const { attribute, onDeleteAttributeValue } = this.props;
    confirm({
      title: 'Do you want to delete these item?',
      onOk() {
        if (attribute && onDeleteAttributeValue) {
          onDeleteAttributeValue(id);
        }
      },
      onCancel() {
        //
      },
    });
  };

  render() {
    return (
      <div>
        <Form layout="horizontal">
          <Row gutter={24}>
            <Form.Item label="Attribute name" />
            {map(
              lang => (
                <Col span={8} key={lang}>
                  <Form.Item label={lang} key={lang}>
                    <Input
                      value={this.state.translations[lang]}
                      onChange={this.handleTranslationChange(
                        lang as Language,
                      )}
                    />
                  </Form.Item>
                </Col>
              ),
              Object.keys(Language),
            )}
          </Row>
          <Form.Item label="UI element">
            <Radio.Group
              onChange={(e: any) => { this.handleUIElementChange(e.target.value); }}
              value={this.state.uiElement}
            >
              <Radio.Button value="COMBOBOX">Combobox</Radio.Button>
              <Radio.Button value="CHECKBOX">Checkbox</Radio.Button>
              <Radio.Button value="COLOR_PICKER">Color Picker</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Values">
            <Tag
              onClick={this.showInput}
              style={{ background: '#fff', borderStyle: 'dashed' }}
            >
              <Icon type="plus" /> New Value
            </Tag>
            <DragDropContext onDragEnd={this.handleDragEndTranslatable}>
              <Droppable droppableId="droppable">
                {(providedDroppable) => (
                  <div
                    ref={providedDroppable.innerRef}
                    style={{ display: 'block' }}
                    {...providedDroppable.droppableProps}
                  >
                    {this.state.newValues.map((item: NewValue, index: number) => (
                      <Draggable
                        isDragDisabled={!isNil(this.props.attribute)}
                        key={item.id}
                        draggableId={`${item.id}`}
                        index={index}
                      >
                        {(providedDraggable) => (
                          <div
                            ref={providedDraggable.innerRef}
                            style={{ display: 'flex' }}
                            {...providedDraggable.draggableProps}
                            {...providedDraggable.dragHandleProps}
                          >
                            <div>
                              <span>Code: </span>
                              <Tag color="blue">{item.code}</Tag>
                              {map(value => (
                                <React.Fragment key={`${index}${value.lang}`}>
                                  <span>{`${value.lang}: `}</span>
                                  <Tag>{value.text}</Tag>
                                </React.Fragment>
                              ), item.translations)}
                              <Button
                                shape="circle"
                                icon="edit"
                                size="small"
                                onClick={() => this.handleEditItem(item)}
                              />
                              <Button
                                shape="circle"
                                icon="close"
                                size="small"
                                onClick={() => {
                                  this.props.attribute
                                    ? this.showConfirmDeleteItem(item.id)
                                    : this.handleDeleteItem(item.id);
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {providedDroppable.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Form.Item>
          <Form.Item />
        </Form>
        <Button onClick={this.handleSave}>Save</Button>
        <Modal
          visible={this.state.inputVisible}
          onOk={this.handleInputsConfirm}
          onCancel={this.handleInputsClosed}
          okText={this.state.editableId ? 'Save' : 'Add'}
          okButtonProps={{ loading: this.props.isLoading }}
          cancelText="Cancel"
        >
          <div>
            <Row gutter={24}>
              <Col span={12}>
                <span style={{ marginRight: '0' }}>Code</span>
                <Input
                  ref={this.inputRef}
                  size="small"
                  value={this.state.code || ''}
                  onChange={this.handleNewValueCodeChange}
                />
              </Col>
            </Row>
            <Row gutter={24} style={{ marginTop: '20px' }}>
              {map(
                lang => (
                  <Col span={12} key={lang} style={{ marginTop: '10px' }}>
                    <span style={{ marginRight: '0' }}>{`${lang}:`}</span>
                    <Input
                      size="small"
                      value={this.state.valuesTranslations[lang]}
                      onChange={this.handleTranslatableValuesChange(
                        lang as Language,
                      )}
                    />
                  </Col>
                ),
                Object.keys(Language),
              )}
            </Row>
          </div>
        </Modal>
      </div>
    );
  }
}

export default CommonForm;
