import PropTypes from 'prop-types';
import MyUpload from '@/components/UploadComponent';
import { connect } from 'dva';
import { formItemLayout } from '@/configs/layout';
import { Input, Button } from 'antd';
import { Form } from '@ant-design/compatible';
const FormItem = Form.Item;

const editForm = ({
    sourcematerial,
    ...props
}) => {
    let { form,dispatch } = props;
    const { getFieldDecorator, validateFieldsAndScroll, resetFields } = form;
    let { audio, icon,text, id, phonetic, translation, explainsArray } = sourcematerial;
    // 提交表单
    const handleSubmit = (e) => {
        e.preventDefault();
        let data = {
            id: id,
            icon: icon || '',
            audio: audio || '',
            text: text || '',
            phonetic: phonetic || '',
            translation: translation || '',
            explainsArray: explainsArray || ''
        }
        validateFieldsAndScroll((err, values) => {
            validateFieldsAndScroll((err, values) => {
                if (!err) {
                    for (let key in values) {
                        if (values[key]) {
                            if (key === 'id') {
                                data[key] = values[key] -0
                            } else if (values[key] == data[key]) {
                                data[key] = ''
                            } else {
                                data[key] = values[key]
                            }
                        }
                    }
                }
            })
        });
        // dispatch({
        //     type: 'sourcematerial/editSource',
        //     payload: filterObj(data)
        // })
    }

    // 取消重置表单
    const handleReset = (e) => {
        resetFields();
        dispatch({
            type: 'sourcematerial/setParam',
            payload: {
                modal2Show:false
            }
        })
    }

    // 上传音频回调
    const iconUploadSuccess = (url) => {
        dispatch({
            type: 'sourcematerial/setParam',
            payload: {
                icon:url
            }
        })
    }

    // 上传音频回调
    const audioUploadSuccess = (url) => {
        dispatch({
            type: 'sourcematerial/setParam',
            payload: {
                audio: url
            }
        })
    }
	return (
        <div>
            <Form>
                <FormItem
                    {...formItemLayout}
                    label="素材内容"
                    >
                    {getFieldDecorator('text', {
                        initialValue:text || '',
                        rules: [{ required: true, message: '请输入素材内容!', whitespace: true }],
                    })(
                        <Input placeholder="请输入素材内容"/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="素材图标地址"
                    >
                    {getFieldDecorator('icon',{
                        initialValue: icon || ''
                    })(
                        <Input placeholder="请输入素材内容" disabled/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="上传素材图标"
                    >
                    {getFieldDecorator('icon')(
                        <MyUpload uploadSuccess={iconUploadSuccess}></MyUpload>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="音频地址"
                    >
                    {getFieldDecorator('audio',{
                        initialValue: audio || ''
                    })(
                        <Input placeholder="请输入素材内容" disabled/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="音频地址"
                    >
                    {getFieldDecorator('audio', {
                        rules: [{ required: true, message: '请输入音频地址!' }],
                    })(
                        <MyUpload uploadSuccess={audioUploadSuccess}></MyUpload>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="音标"
                    >
                    {getFieldDecorator('phonetic', {
                        initialValue: phonetic || '',
                    })(
                        <Input placeholder="请输入音标"/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="释义"
                    >
                    {getFieldDecorator('translation', {
                        initialValue: translation || '',
                    })(
                        <Input placeholder="请输入释义"/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="多次释义"
                    >
                    {getFieldDecorator('explainsArray', {
                        initialValue: explainsArray || '',
                    })(
                        <Input placeholder="请输入多次释义"/>
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
editForm.propTypes = {
    sourcematerial: PropTypes.object // 表单提交
};

export default connect(({sourcematerial}) => ({ sourcematerial }))(Form.create()(editForm));
