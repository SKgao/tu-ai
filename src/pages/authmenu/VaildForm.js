import PropTypes from 'prop-types';
import { formItemLayout } from '@/configs/layout';
import { Button, Input, Radio } from 'antd';
import { Form } from '@ant-design/compatible';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const ValidForm = ({
    submitForm,
    resetForm,
    ...props
}) => {
    let { form } = props;
    const { getFieldDecorator, validateFieldsAndScroll, resetFields } = form;

    // 提交表单
    const handleSubmit = (e) => {
        e.preventDefault();
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                for (let key in values) {
                    if (key === 'parentId' || key === 'sortValue' || key === 'menuScope') {
                        if (values[key]) {
                            values[key] = values[key] - 0
                        }
                    }
                }
                submitForm && submitForm(values);
            }
        });
    }

    // 重置表单
    const handleReset = (e) => {
        resetFields();
        resetForm && resetForm();
    }

	return (
        <div>
            <Form onSubmit={handleSubmit}>
                <FormItem
                    {...formItemLayout}
                    label="菜单名称"
                    >
                    {getFieldDecorator('menuName', {
                        rules: [{ required: true, message: '请输入菜单名称!', whitespace: true }],
                    })(
                        <Input placeholder="请输入菜单名称"/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="父级id"
                    >
                    {getFieldDecorator('parentId', {
                        rules: [{
                            required: true, message: '请输入父级id！（必须为数字）'
                        }],
                    })(
                        <Input placeholder="一级菜单传0"/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="排序字段"
                    >
                    {getFieldDecorator('sortValue', {
                        rules: [{ required: true, message: '请输入排序字段!' }],
                    })(
                        <Input style={{ width: '100%' }} placeholder="请输入排序字段（必须为数字）"/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="路径"
                    >
                    {getFieldDecorator('path', {
                        rules: [{
                            required: true, message: '请输入路径!',
                        }],
                    })(
                        <Input placeholder="请输入路径"/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="图标"
                    >
                    {getFieldDecorator('icon', {
                        rules: [{ required: true, message: '请输入图标!' }],
                    })(
                        <Input placeholder="请输入icon类名"/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="作用"
                    >
                    {getFieldDecorator('menuScope', {
                        rules: [{ required: true, message: '请选择菜单作用!' }],
                    })(
                        <RadioGroup>
                            <Radio value="1">左侧菜单</Radio>
                            <Radio value="2">按钮</Radio>
                            <Radio value="3">接口</Radio>
                        </RadioGroup>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="接口地址"
                    >
                    {getFieldDecorator('url', {
                        rules: [{ message: '请输入接口地址!' }],
                    })(
                        <Input style={{ width: '100%' }} placeholder="请输入接口地址"/>
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
    resetForm: PropTypes.func  // 表单重置
};

export default (Form.create()(ValidForm));
