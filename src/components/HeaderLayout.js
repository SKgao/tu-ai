import BreadcrumbLayout from './BreadcrumbLayout';
import { formItemLayout } from '@/configs/layout';
import { axios } from '@/configs/request';
import { Avatar, Button, Input, Menu, Modal, Tooltip, Layout, message } from 'antd';
import { Icon, Form } from '@ant-design/compatible';
const { SubMenu } = Menu;
const { Header } = Layout;
const FormItem = Form.Item;

const HeaderLayout = ({
	collapsed,
	handleToggle,
	handleCollapse,
	handleUser,
	breadCrumd,
	changeModalState,
	modalShow,
	pathname,
	...props
}) => {
	let { form } = props;
	let { getFieldDecorator, validateFieldsAndScroll, resetFields } = form;

	// 修改密码
	const handlePassword = (e) => {
		e.preventDefault();
		validateFieldsAndScroll((err, values) => {
			if (!err) {
				if (values.password2 !== values.password) {
                    message.warning('两次密码输入不一样！')
                } else {
					axios.post('user/update', {
					   id: localStorage.getItem('id'),
					   password: values.password
					}).then((res) => {
						if (res.data.code === 0) {
                            message.success(res.data.message)
						} else {
							message.error(res.data.message)
						}
					})
                    resetFields()
					changeModalState('modalShow', false)
                }
			}
		});
	}

	return (
		<Header className="header">
			<div className="header-left">

				<div className="header-icon header-toggle" onClick={handleToggle}>
					<Icon type="bars" />
				</div>

				<Tooltip placement="right" title={collapsed ?  '展开导航' : '收起导航'}>
					<div className="header-icon header-collapse" onClick={handleCollapse}>
						<Icon type={collapsed ? 'menu-unfold' : 'menu-fold'} />
					</div>
				</Tooltip>

				<BreadcrumbLayout data={breadCrumd} path={pathname} />
			</div>

			<div className="header-right">

				{/* <div className="header-icon header-search">
					<Icon type={"search"} />
				</div> */}

				<div className="header-icon header-msg">
					<Icon type={"bell"} />
				</div>

				<div className="header-icon header-msg">
					<Avatar
					    icon="user"
					    style={{ backgroundColor: '#ffbf00', verticalAlign: 'middle' }}
					    src={ localStorage.getItem('avatar') || '//web.chengxuyuantoutiao.com/static/tutu_logo.png' }>
					</Avatar>
				</div>

				<Menu
					mode="horizontal"
					className="header-menu header-btns"
					onClick={handleUser}>
					<SubMenu title={<span><em>{ localStorage.getItem('account') || 'admin' }</em></span>}>
						<Menu.Item key="setting"><Icon type="edit"/>修改密码</Menu.Item>
						<Menu.Item key="logout"><Icon type="logout"/>退出</Menu.Item>
					</SubMenu>
				</Menu>

				<Modal
					title="修改密码"
					visible={modalShow}
					onOk={ () => changeModalState('modalShow', false) }
					onCancel= { () => changeModalState('modalShow', false) }
					okText="确认"
					cancelText="取消"
					footer={null}
					>
					<Form>
						{/*App类型*/}
						<FormItem
							label="密码"
							{...formItemLayout}
							>
							{getFieldDecorator('password', {
								rules: [{ required: true, message: '请重新输入密码!' }],
							})(
								<Input type="password" placeholder="请输入密码"/>
							)}
						</FormItem>

						<FormItem
							label="确认密码"
							{...formItemLayout}
							>
							{getFieldDecorator('password2', {
								rules: [{ required: true, message: '请确认密码!', whitespace: false }],
							})(
								<Input type="password" placeholder="请再次输入密码！"/>
							)}
						</FormItem>

						<FormItem
							{...formItemLayout}>
							<Button type="primary" onClick={handlePassword} style={{ marginLeft: 75 }}>提交</Button>
							<Button onClick={ ()=> {
								resetFields()
								changeModalState('modalShow', false)
							}} style={{ marginLeft: 15 }}>取消</Button>
						</FormItem>
					</Form>
				</Modal>
			</div>

		</Header>
	);
};

export default (Form.create()(HeaderLayout));

