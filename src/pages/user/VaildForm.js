import PropTypes from 'prop-types';
import MyUpload from '@/components/UploadComponent';
import { formItemLayout } from '@/configs/layout';
import { Button, Input, Radio, Select, message } from 'antd';
import { Form } from '@ant-design/compatible';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

const ValidForm = ({
    submitForm,
    getRoleList,
    roleList,
    resetForm,
    ...props
}) => {
    let { form } = props;
    const { getFieldDecorator, validateFieldsAndScroll, resetFields, setFieldsValue } = form;

    // 提交表单
    const handleSubmit = (e) => {
        e.preventDefault();
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                if (values.confirm !== values.password) {
                    message.warning('两次输入密码不相同!')
                } else {
                    delete values['confirm'];
                    submitForm && submitForm(values);
                    resetFields();
                }
            }
        });
    }

    // 重置表单
    const handleReset = (e) => {
        resetFields();
        resetForm && resetForm();
    }

    // 设置头像
    const uploadSuccess = (url) => {
        setFieldsValue({'avatar': url})
    }

	return (
        <div>
            <Form onSubmit={handleSubmit}>
                <FormItem
                    {...formItemLayout}
                    label="用户名"
                    >
                    {getFieldDecorator('account', {
                        rules: [{ required: true, message: '请输入用户名!', whitespace: true }],
                    })(
                        <Input placeholder="请输入用户名"/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="密码"
                    >
                    {getFieldDecorator('password', {
                        rules: [{
                            required: true, message: '请输入密码!',
                        }],
                    })(
                        <Input type="password" placeholder="请输入密码"/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="确认密码"
                    >
                    {getFieldDecorator('confirm', {
                        rules: [{
                            required: true, message: '请再次确认密码!',
                        }],
                    })(
                        <Input type="password" placeholder="请再次确认密码"/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="E-mail"
                    >
                    {getFieldDecorator('email', {
                        rules: [{
                            type: 'email', message: '邮箱格式有误!',
                        }, {
                            required: true, message: '请输入邮箱!',
                        }],
                    })(
                        <Input placeholder="请输入邮箱"/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="手机号"
                    >
                    {getFieldDecorator('phone', {
                        rules: [{ required: true, message: '手机号格式有误!', pattern: /^[1][0-9]{10}$/ }]
                    })(
                        <Input style={{ width: '100%' }} placeholder="请输入手机号"/>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="头像"
                    >
                    {getFieldDecorator('avatar', {
                        // rules: [{ message: '请输入上传头像图片!' }],
                    })(
                        <MyUpload uploadSuccess={uploadSuccess} uploadTxt={'上传图片'}></MyUpload>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="状态"
                    >
                    {getFieldDecorator('status')(
                        <RadioGroup>
                            <Radio value="1">启用</Radio>
                            <Radio value="2">冻结</Radio>
                            <Radio value="3">删除</Radio>
                        </RadioGroup>
                    )}
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="角色"
                    >
                    {getFieldDecorator('roleid', {
                        // rules: [{ message: '请选择角色!' }],
                    })(
                        <Select
                            showSearch
                            placeholder='请选择角色'
                            onFocus={getRoleList}
                            >
                            {
                                roleList.map(item =>
                                    <Option key={item.id} value={item.id}>{item.name}</Option>
                                )
                            }
                        </Select>
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
    getRoleList: PropTypes.func,   // 获取角色
    roleList: PropTypes.array,     // 角色列表
    resetForm: PropTypes.func,     // 表单重置
};

export default (Form.create()(ValidForm));
