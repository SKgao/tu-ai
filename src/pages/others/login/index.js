import React from 'react';
import PropTypes from 'prop-types';
import './login.scss';
import { connect } from 'dva';
import { Button, Input, Row } from 'antd';
import { Icon, Form } from '@ant-design/compatible';

const FormItem = Form.Item;

const Login = ({
	loading,
	dispatch,
	login,
	form: {
		getFieldDecorator,
		validateFieldsAndScroll
	}
}) => {
	const handleOk = () => {
		validateFieldsAndScroll((errors, values) => {
			if (errors) {
				return;
			}
			dispatch({
				type: 'login/login',
				payload: values
			});
		})
	}

	return (
		<div className="form">
		    <div className="logo">
			    {/* <img src="//test.web.admin.tutukids.com/static/assets/logo.png"/> */}
				<div className="img"></div>
				{/* <span>图图英语</span> */}
			</div>
			<form>
				<FormItem hasFeedback>
					{getFieldDecorator('username', {
						rules: [
							{
								required: true,
								message: '请输入用户名！'
							}
						],
					})(<Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} onPressEnter={handleOk} placeholder="用户名" />)}
				</FormItem>
				<FormItem hasFeedback>
					{getFieldDecorator('password', {
						rules: [
							{
								required: true,
								message: '请输入密码！'
							}
						],
					})(<Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" onPressEnter={handleOk} placeholder="密码" />)}
				</FormItem>
				<Row>
					<Button type="primary" onClick={handleOk} loading={loading.effects.login}>
						登录
					</Button>
				</Row>

			</form>
		</div>
	)
};

Login.propTypes = {
	loading: PropTypes.object,
	dispatch: PropTypes.func,
	login: PropTypes.object
};

export default connect(({ login, loading }) => ({ login, loading }))(Form.create()(Login));
