import PropTypes from 'prop-types';
import { withRouter, routerRedux } from 'dva/router';
// import pathToRegexp from 'path-to-regexp';
import layoutConfig from './configs/layout';

import './scss/layout.scss';

import Loader from './components/Loader';

import HeaderLayout from './components/HeaderLayout';
import SiderLayout from './components/SiderLayout';
import HistoryNavsLayout from './components/HistoryNavsLayout';
import { connect } from 'dva';
import { Layout } from 'antd';

const { Content } = Layout;

const App = ({
	children,
	dispatch,
	loading,
	location,
	app
}) => {
	const { pathname } = location;
	const { singleView, hideLeftView } = layoutConfig;
	let { collapsed, siderList, breadCrumd, historyList, firstMenuText, firPath, secPath, modalShow } = app;

	// 用户未登录跳转到登录页面
	if (!localStorage.getItem('token') && pathname !== '/login') {
		dispatch(routerRedux.push('/login'))
	}

	// 选中菜单
	// let firPath, secPath;
	// if(pathname && pathname.indexOf('/') > -1) {
	// 	let prePath = pathname.split('/').slice(0,-1).join('/')
	// 	firPath = [prePath];
	// 	secPath = [pathname];
	// 	let lastPath = pathname.split('/').slice(-1)[0];
	// 	if(lastPath.indexOf('-') > -1 && pathname.split('/').length >= 4) {
	// 		firPath.push(prePath + '/' + lastPath.split('-')[0])
	// 	}
	// }

	// 展开收缩菜单
	const handleCollapse = () => {
		dispatch({ type: 'app/collapse' })
	}

	// 退出登录
	const handleUser = ({key, selectedKeys}) => {
		switch(key) {
			case 'logout':
				dispatch({ type: 'app/loginout' })
				break;
			case 'setting':
			    changeModalState('modalShow', true)
				break;
		}
	}

	// 页面加载添加一个默认tab
	if(!historyList.length && breadCrumd.cname) {
		dispatch({
			type: 'app/historyNavsAdd',
			payload: {
				tab: breadCrumd.cname,
				key: pathname
			}
		})
	}

	// 左侧导航路由切换, 添加历史记录
	const changeSiderMenu = e => {
		if(pathname !== e.key) {
			dispatch(routerRedux.push(e.key))
			dispatch({
				type: 'app/setPath',
				payload: {
					firPath: e.keyPath.slice(1),
					secPath: [e.key]
				}
			})
			localStorage.setItem('firPath', e.keyPath.slice(1))
			localStorage.setItem('secPath', [e.key])
			dispatch({
				type: 'app/historyNavsAdd',
				payload: {
					tab: e.item.props.title,
					key: e.key
				}
			})
		}
	}

	// 删除历史导航 只剩一个不能关闭
	const tabEdit = (targetKey, action) => {
		if (action === 'remove' && targetKey) {
			dispatch({
				type: 'app/historyNavsRemove',
				payload: {
					targetKey
				}
			})
		}
	}

	// 打开单独视图页面
	if(singleView && singleView.includes(pathname)) {
		return <div>{children}</div>;
	}

	// 移动端展开收起菜单
	const handleToggle = () => dispatch({ type: 'app/toggle' })

	// 历史导航点击
	const tabChange = (key) => {
		if (key && key !== pathname) {
			dispatch(routerRedux.push(key))
		}
	}

	// 展示modal
    const changeModalState = (modal, show) => {
        dispatch({
        	type: 'app/setParam',
        	payload: {
                [modal]: show
            }
        })
    }

	// 筛选项目(改变一级分类)
	const menuSelect = (key) => {
        dispatch({
			type: 'app/firstMenuChange',
			payload: key
		})
	}

	return (
		<Layout className={app.showSider ? "show-menu main-layout" : "main-layout"}>
		    {
				!siderList.length && <Loader fullScreen spinning={loading.effects['app/fetch']} tip="加载中..." />
			}
	    	<div className="main-shadow" onClick={handleToggle}></div>
			{
	    		/*hideLeftView && hideLeftView.includes(pathname) ? null :*/
				<SiderLayout
					sideMenus={siderList}
					firPath={firPath}
					secPath={secPath}
					collapsed={collapsed}
					handleSiderMenu={changeSiderMenu}
					menuSelect={menuSelect}
					firstMenuText={firstMenuText} />
	    	}
		    <Layout className={"main-content"}>
				<HeaderLayout
					collapsed={collapsed}
					handleToggle={handleToggle}
					handleCollapse={handleCollapse}
					handleUser={handleUser}
					breadCrumd={breadCrumd}
					changeModalState={changeModalState}
					modalShow={modalShow}
					pathname={pathname} />
				<HistoryNavsLayout
				    historyList={historyList}
					tabEdit={tabEdit}
					tabChange={tabChange} />
				<Layout className="main-panel scrollbar-primary">
					<Content className="content-panel">
						{ children }
					</Content>
				</Layout>
		    </Layout>
		</Layout>
	);
}

App.propTypes = {
	children: PropTypes.element,
	location: PropTypes.object,
	dispatch: PropTypes.func,
	app: PropTypes.object,
	loading: PropTypes.object,
};

export default withRouter(connect(({ app, loading }) => ({ app, loading }))(App));
