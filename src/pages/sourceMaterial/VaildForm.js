import PropTypes from 'prop-types';
import { filterObj } from '@/utils/tools';
import MyUpload from '@/components/UploadComponent';
import { connect } from 'dva';
import { formItemLayout } from '@/configs/layout';
import { Input, Button, Select } from 'antd';
import { Form } from '@ant-design/compatible';
const FormItem = Form.Item;
const Option = Select.Option;

const ValidForm = ({
    sourcematerial,
    changeModalState,
    ...props
}) => {
    let { form, dispatch } = props;
    const { getFieldDecorator, validateFieldsAndScroll, resetFields, setFieldsValue } = form;
    // 提交表单
    const handleSubmit = (e) => {
        e.preventDefault();
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.text = sourcematerial.content;
                dispatch({
                    type: 'sourcematerial/addSource',
                    payload: filterObj(values)
                }).then(() => {
                    handleReset()
                })
            }
        });
    }

    // 重置表单
    const handleReset = (e) => {
        resetFields();
        dispatch({
            type: 'sourcematerial/setParam',
            payload: {
                content: '',
                iconUrl: '',
                audioUrl: '',
                modalShow: false
            }
        })
        changeModalState && changeModalState();
    }

    // 上传音频回调
    const iconUploadSuccess = (url) => {
        setFieldsValue({
            'icon': url
        })
        dispatch({
            type: 'sourcematerial/setParam',
            payload: {
                iconUrl: url
            }
        })
    }

    // 获取文件信息
    const getFileInfo = (file, tag) => {
        let str = file.name.trim()
        let idx = str.lastIndexOf('.')
        const FILENAME = str.slice(0, idx)
        if (tag === 'icon') {
            dispatch({
                type: 'sourcematerial/setParam',
                payload: {
                    content: FILENAME
                }
            })
        } else if (tag === 'audio') {
            let reg = /[a-zA-Z]/g;
            if (sourcematerial.iconUrl) {
                return;
            } else {
                dispatch({
                    type: 'sourcematerial/setParam',
                    payload: {
                        content: FILENAME.match(reg).join('').toLowerCase()
                    }
                })
            }
        }
    }

    // 上传音频回调  sourcematerial.bookList
    const audioUploadSuccess = (url) => {
        setFieldsValue({'audio': url})
        dispatch({
            type: 'sourcematerial/setParam',
            payload: {
                audioUrl: url
            }
        })
    }

    // 输入内容
    const handleContent = e => {
        dispatch({
            type: 'sourcematerial/setParam',
            payload: {
                content: e.target.value
            }
        })
    }

    return (
        <div>
            <Form onSubmit={handleSubmit}>
                <FormItem
                    label="教材"
                    hasFeedback
                    {...formItemLayout}
                    >
                    {getFieldDecorator('textbookId', {
                        initialValue: sourcematerial.textbookId ? sourcematerial.textbookId : '',
                        rules: [{ required: true, message: '请选择教材!' }],
                    })(
                        <Select
                            showSearch
                            placeholder="请选择教材"
                            onFocus={() => dispatch({type: 'sourcematerial/getBook'})}
                            >

                            {
                                sourcematerial.bookList.map(item =>
                                    <Option key={item.id} value={item.id}>{item.name}</Option>
                                )
                            }
                        </Select>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="素材内容"
                    >
                    {getFieldDecorator('text', {
                        initialValue: sourcematerial.content,
                        rules: [{ required: true, message: '请输入素材内容!', whitespace: true }],
                    })(
                        <Input placeholder="请上传素材图片、音频" onChange={e => handleContent(e)}/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="素材图标地址"
                    >
                    {getFieldDecorator('icon')(
                        <MyUpload
                           uploadSuccess={iconUploadSuccess}
                           getFileInfo={ (file) => getFileInfo(file, 'icon') }>
                        </MyUpload>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="素材音频地址"
                    >
                    {getFieldDecorator('audio', {
                        rules: [{ message: '请上传音频!' }],
                    })(
                        <MyUpload
                            uploadSuccess={audioUploadSuccess}
                            getFileInfo={ (file) => getFileInfo(file, 'audio') }>>
                        </MyUpload>
                    )}
                </FormItem>

                <FormItem>
                    <Button type="primary" onClick={handleSubmit} style={{ marginLeft: 75 }}>提交</Button>

                    <Button onClick={handleReset} style={{ marginLeft: 15 }}>取消</Button>
                </FormItem>
            </Form>
        </div>
    )
};

ValidForm.propTypes = {
    submitForm: PropTypes.func, // 表单提交
    changeTextBookId: PropTypes.func,
    changeModalState: PropTypes.func
};

export default connect(({ sourcematerial }) => ({ sourcematerial }))(Form.create()(ValidForm));