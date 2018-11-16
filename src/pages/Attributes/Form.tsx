import * as React from 'react';
import { Form, Spin, Input, Row, Col, Button, Radio, Tag, Icon } from 'antd';
import { map, filter, contains, assoc, last, head, toPairs, isEmpty, reduce, dissoc } from 'ramda';
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

interface StateType {
  id: string | null;
  translations: {
    [key: string]: string;
  };
  inputVisible: boolean;
  inputValue: string;
  values: string[];
  translatedValues: TranslatedValue[];
  valuesTranslations: {
    [key: string]: string;
  };
  valuesType: 'UNTRANSLATABLE' | 'TRANSLATABLE';
  uiElement: UIType;
}

interface PropsType {
  isLoading: boolean;
  attribute?: Attribute;
  onSave: (data: any) => void;
}

class CommonForm extends React.Component<PropsType, StateType> {
  private inputRef = React.createRef<Input>();
  constructor(props: PropsType) {
    super(props);
    const { attribute } = props;
    let prepareData: StateType = {
      inputVisible: false,
      inputValue: '',
      valuesTranslations: {},
      id: null,
      translations: {},
      values: [],
      valuesType: 'UNTRANSLATABLE',
      translatedValues: [],
      uiElement: UIType.COMBOBOX,
    };
    if (attribute && attribute.metaField) {
      const { values, translatedValues } = attribute.metaField;
      prepareData = {
        ...prepareData,
        id: attribute.id,
        translations: reduce(
          (acc, item) => assoc(item.lang, item.text, acc),
          {},
          attribute.name,
        ),
        values: values || [],
        valuesType: values ? 'UNTRANSLATABLE' : 'TRANSLATABLE',
        translatedValues: translatedValues ? translatedValues.map((item, index) => ({
          id: `${Date.now()}${index}`,
          translations: map(translation => ({ lang: translation.lang, text: translation.text }), item.translations),
        })) : [],
        uiElement: attribute.metaField.uiElement,
      };
    }

    this.state = prepareData;
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => {
      if (this.state.valuesType === 'UNTRANSLATABLE') {
        this.inputRef.current!.focus();
      }
    });
  };

  handleUIElementChange = (uiElement: UIType) => {
    this.setState({ uiElement });
  };

  handleInputChange = (e: any) => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    this.setState((prevState: StateType) => {
      const { values, inputValue } = prevState;
      return ({
        values: inputValue && !contains(inputValue, values)
          ? [...values, inputValue]
          : values,
        inputVisible: false,
        inputValue: '',
      });
    });
  };

  handleInputsConfirm = () => {
    this.setState((prevState: StateType) => {
      const { translatedValues, valuesTranslations } = prevState;
      const translatedValue = {
        id: Date.now(),
        translations: filter(item => item.text !== '', map(
          item => ({
            lang: head(item),
            text: last(item),
          }),
          toPairs(valuesTranslations))),
      };
      if (isEmpty(translatedValue.translations)) {
        return prevState;
      }
      return ({
        translatedValues: [...translatedValues, translatedValue],
        inputVisible: false,
        valuesTranslations: {},
      });
    });
  };

  handleInputsClosed = () => {
    this.setState({
      inputVisible: false,
      valuesTranslations: {},
    });
  };

  reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  handleDragEnd = (result: any) => {
    this.setState((prevState: StateType) => ({
      values: this.reorder(prevState.values, result.source.index, result.destination.index),
    }));
  };

  handleDragEndTranslatable = (result: any) => {
    this.setState((prevState: StateType) => ({
      translatedValues: this.reorder(prevState.translatedValues, result.source.index, result.destination.index),
    }));
  };

  handleCloseTag = (removedTag: string) => {
    this.setState({ values: filter(item => removedTag !== item, this.state.values) });
  };

  handleCloseItem = (id: string) => {
    this.setState({ translatedValues: filter(item => id !== item.id, this.state.translatedValues) });
  };

  handleValuesTypeChange = (value: 'UNTRANSLATABLE' | 'TRANSLATABLE') => {
    this.setState({ valuesType: value, inputVisible: false });
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
    const {
      id,
      translations,
      values,
      uiElement,
      translatedValues,
      valuesType,
    } = this.state;
    if (
      isEmpty(translations) ||
      valuesType === 'UNTRANSLATABLE' && isEmpty(values) ||
      valuesType === 'TRANSLATABLE' && isEmpty(translatedValues)
    ) {
      return;
    }
    const name = map(
      item => ({
        lang: head(item),
        text: last(item),
      }),
      toPairs(translations),
    ) as TranslationInput[];
    const data = {
      valueType: 'STR',
      name,
      metaField: {
        values: valuesType === 'UNTRANSLATABLE' ? values : null,
        uiElement,
        translatedValues: valuesType === 'TRANSLATABLE'
          ? map(item => item.translations, translatedValues)
          : null,
      },
    };
    this.props.onSave(id ? { ...dissoc('valueType', data), id } : data);
  };

  render() {
    return (
      <Spin spinning={this.props.isLoading}>
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
          <Form.Item label="Values type">
            <Radio.Group
              onChange={(e: any) => { this.handleValuesTypeChange(e.target.value); }}
              value={this.state.valuesType}
            >
              <Radio.Button value="UNTRANSLATABLE">Untranslatable</Radio.Button>
              <Radio.Button value="TRANSLATABLE">Translatable</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Values">
            {this.state.inputVisible && (
              <div>
                {this.state.valuesType === 'UNTRANSLATABLE' ?
                  <Input
                    ref={this.inputRef}
                    type="text"
                    size="small"
                    style={{ width: 78 }}
                    value={this.state.inputValue}
                    onChange={this.handleInputChange}
                    onBlur={this.handleInputConfirm}
                    onPressEnter={this.handleInputConfirm}
                  /> :
                  <div>
                    <Row gutter={24}>
                      {map(
                        lang => (
                          <Col span={4} key={lang} style={{  }}>
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
                    <Tag
                      onClick={this.handleInputsConfirm}
                      style={{ background: '#fff', borderStyle: 'dashed' }}
                    >
                      <Icon type="plus" /> Add
                    </Tag>
                    <Tag
                      color="red"
                      onClick={this.handleInputsClosed}
                      style={{ background: '#fff', borderStyle: 'dashed' }}
                    >
                      Cancel
                    </Tag>
                  </div>
                }
              </div>
            )}
            {!this.state.inputVisible && (
              <Tag
                onClick={this.showInput}
                style={{ background: '#fff', borderStyle: 'dashed' }}
              >
                <Icon type="plus" /> New Value
              </Tag>
            )}
            {this.state.valuesType === 'UNTRANSLATABLE' &&
              <DragDropContext onDragEnd={this.handleDragEnd}>
                <Droppable droppableId="droppable" direction="horizontal">
                  {(providedDroppable) => (
                    <div
                      ref={providedDroppable.innerRef}
                      style={{ display: 'flex' }}
                      {...providedDroppable.droppableProps}
                    >
                      {this.state.values.map((item: string, index: number) => (
                        <Draggable key={item} draggableId={item} index={index}>
                          {(providedDraggable) => (
                            <div
                              ref={providedDraggable.innerRef}
                              {...providedDraggable.draggableProps}
                              {...providedDraggable.dragHandleProps}
                            >
                              <Tag
                                closable
                                color="blue"
                                afterClose={() => this.handleCloseTag(item)}
                              >
                                {item}
                              </Tag>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {providedDroppable.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            }
            {this.state.valuesType === 'TRANSLATABLE' &&
              <DragDropContext onDragEnd={this.handleDragEndTranslatable}>
                <Droppable droppableId="droppable">
                  {(providedDroppable) => (
                    <div
                      ref={providedDroppable.innerRef}
                      style={{ display: 'block' }}
                      {...providedDroppable.droppableProps}
                    >
                      {this.state.translatedValues.map((item: TranslatedValue, index: number) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(providedDraggable) => (
                            <div
                              ref={providedDraggable.innerRef}
                              style={{ display: 'flex' }}
                              {...providedDraggable.draggableProps}
                              {...providedDraggable.dragHandleProps}
                            >
                              <div>
                                {map(value => (
                                  <React.Fragment key={`${index}${value.lang}`}>
                                    <span>{`${value.lang}: `}</span>
                                    <Tag>{value.text}</Tag>
                                  </React.Fragment>
                                ), item.translations)}
                                <Button
                                  shape="circle"
                                  icon="close"
                                  size="small"
                                  onClick={() => this.handleCloseItem(item.id)}
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
            }
          </Form.Item>
          <Form.Item />
        </Form>
        <Button onClick={this.handleSave}>Save</Button>
      </Spin>
    );
  }
}

export default CommonForm;
