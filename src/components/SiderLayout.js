
import { Layout, Menu } from 'antd';
import { Icon } from '@ant-design/compatible';
const { SubMenu } = Menu;
const { Sider } = Layout;

const SiderLayout = ({
	collapsed,
	firPath,
	secPath,
	sideMenus,
	handleSiderMenu,
	menuSelect,
	firstMenuText
}) => {

	const renderMenu = (item, showIcon) => {
		if(item.children && item.children.length) {
			let ico = (item.icon && item.icon !== 'tongji') ? item.icon: 'bars'
			return (!item.path || item.path == 0) ? null : (
			    <SubMenu
					key={item.id}
					title={
						<span>
							<Icon type={ico} />
							<span>{item.name}</span>
						</span>
					}>
					{
						item.children.map(sub => renderMenu(sub, false))
					}
				</SubMenu>
			)
		} else {
			let _ico = (item.icon && item.icon !== 'tongji') ? item.icon : ''
			let _path = item.path
			return (!_path || _path == 0) ? null : (
				   <Menu.Item key={_path} title={item.name}>
						{_ico && <Icon type={_ico} />}
						<span>{item.name}</span>
					</Menu.Item>
			)
		}
	}

	return (
		<Sider
			className={"main-sider"}
			trigger={null}
			width={240}
			collapsible
			collapsed={collapsed}>
			<div className="sider-top">
				<div className="header-logo">
					<span>图图英语</span>
				</div>
			</div>
			<div className="sider-scroller scrollbar">
				<Menu
					mode="inline"
					theme="dark"
					defaultSelectedKeys={secPath}
					defaultOpenKeys={firPath}
					onClick={handleSiderMenu}>
					{
						sideMenus.map(item => renderMenu(item, true))
					}
				</Menu>
			</div>
		</Sider>
	);
};

export default SiderLayout;