import PropTypes from 'prop-types'
import { Route, Switch, Redirect, routerRedux } from 'dva/router';
import zhCN from 'antd/es/locale/zh_CN';
import dynamic from 'dva/dynamic';
import App from './App';
import ErrorPage from '@/components/ErrorPage';
import { ConfigProvider } from 'antd';

// 动态加载component和model
const { ConnectedRouter } = routerRedux;
const Routers = ({
	history,
	app
}) => {

	const routes = [
		{
			path: '/login',
			component: () => import(/* webpackChunkName: "login" */ './pages/others/login/index'),
			models: () => [import(/* webpackChunkName: "login" */ './pages/others/login/model')]
		},
		{
			path: '/userSetting',
			component: () => import(/* webpackChunkName: "userSetting" */ './pages/user/index'),
			models: () => [import(/* webpackChunkName: "userSetting" */ './pages/user/model')]
		},
		{
			path: '/roleSetting',
			component: () => import(/* webpackChunkName: "roleSetting" */ './pages/role/index'),
			models: () => [import(/* webpackChunkName: "roleSetting" */ './pages/role/model')]
		},
		{
			path: '/authMenu',
			component: () => import(/* webpackChunkName: "authMenu" */ './pages/authmenu/index'),
			models: () => [import(/* webpackChunkName: "authMenu" */ './pages/authmenu/model')]
		},
		{
			path: '/teachingManage/book',
			component: () => import(/* webpackChunkName: "teachingManage/book" */ './pages/teachingManage/book/index'),
			models: () => [import(/* webpackChunkName: "teachingManage/book" */ './pages/teachingManage/book/model')]
		},
		{
			path: '/teachingManage/unit',
			component: () => import(/* webpackChunkName: "teachingManage/unit" */ './pages/teachingManage/unit/index'),
			models: () => [import(/* webpackChunkName: "teachingManage/unit" */ './pages/teachingManage/unit/model')]
		},
		{
			path: '/teachingManage/part',
			component: () => import(/* webpackChunkName: "teachingManage/part" */ './pages/teachingManage/part/index'),
			models: () => [import(/* webpackChunkName: "teachingManage/part" */ './pages/teachingManage/part/model')]
		},
		{
			path: '/teachingManage/session',
			component: () => import(/* webpackChunkName: "teachingManage/session" */ './pages/teachingManage/session/index'),
			models: () => [import(/* webpackChunkName: "teachingManage/session" */ './pages/teachingManage/session/model')]
		},
		{
			path: '/teachingManage/customPass',
			component: () => import(/* webpackChunkName: "teachingManage/customPass" */ './pages/teachingManage/customPass/index'),
			models: () => [import(/* webpackChunkName: "teachingManage/customPass" */ './pages/teachingManage/customPass/model')]
		},
		{
			path: '/appverUpdate',
			component: () => import(/* webpackChunkName: "appverUpdate" */ './pages/appUpdate/index'),
			models: () => [import(/* webpackChunkName: "appverUpdate" */ './pages/appUpdate/model')]
		},
		{
			path: '/sourceMaterial',
			component: () => import(/* webpackChunkName: "sourceMaterial" */ './pages/sourceMaterial/index'),
			models: () => [import(/* webpackChunkName: "sourceMaterial" */ './pages/sourceMaterial/model')]
		},
		{
			path: '/subjects',
			component: () => import(/* webpackChunkName: "subjects" */ './pages/subjects/index'),
			models: () => [import(/* webpackChunkName: "subjects" */ './pages/subjects/model')]
		},
		{
			path: '/member',
			component: () => import(/* webpackChunkName: "member" */ './pages/member/index'),
			models: () => [import(/* webpackChunkName: "member" */ './pages/member/model')]
		},
		{
			path: '/inviteCount',
			component: () => import(/* webpackChunkName: "inviteCount" */ './pages/inviteCount/index'),
			models: () => [import(/* webpackChunkName: "inviteCount" */ './pages/inviteCount/model')]
		},
		{
			path: '/learningRecord',
			component: () => import(/* webpackChunkName: "learningRecord" */ './pages/learningRecord/index'),
			models: () => [import(/* webpackChunkName: "learningRecord" */ './pages/learningRecord/model')]
		},
		{
			path: '/memberLevel',
			component: () => import(/* webpackChunkName: "memberLevel" */ './pages/memberLevel/index'),
			models: () => [import(/* webpackChunkName: "memberLevel" */ './pages/memberLevel/model')]
		},
		{
			path: '/memberInfo',
			component: () => import(/* webpackChunkName: "memberInfo" */ './pages/memberInfo/index'),
			models: () => [import(/* webpackChunkName: "memberInfo" */ './pages/memberInfo/model')]
		},
		{
			path: '/order',
			component: () => import(/* webpackChunkName: "order" */ './pages/order/index'),
			models: () => [import(/* webpackChunkName: "order" */ './pages/order/model')]
		},
		{
			path: '/activity',
			component: () => import(/* webpackChunkName: "activity" */ './pages/activity/index'),
			models: () => [import(/* webpackChunkName: "activity" */ './pages/activity/model')]
		},
		{
			path: '/specialCourse',
			component: () => import(/* webpackChunkName: "specialCourse" */ './pages/specialCourse/index'),
			models: () => [import(/* webpackChunkName: "specialCourse" */ './pages/specialCourse/model')]
		},
		{
			path: '/couOrder',
			component: () => import(/* webpackChunkName: "courseOrder" */ './pages/courseOrder/index'),
			models: () => [import(/* webpackChunkName: "courseOrder" */ './pages/courseOrder/model')]
		},
		{
			path: '/couUser',
			component: () => import(/* webpackChunkName: "courseUser" */ './pages/courseUser/index'),
			models: () => [import(/* webpackChunkName: "courseUser" */ './pages/courseUser/model')]
		},
		{
			path: '/courseBag/bags',
			component: () => import(/* webpackChunkName: "courseBag/bags" */ './pages/courseBag/bags/index'),
			models: () => [import(/* webpackChunkName: "courseBag/bags" */ './pages/courseBag//bags/model')]
		},
		{
			path: '/courseBag/activity',
			component: () => import(/* webpackChunkName: "courseBag/activity" */ './pages/courseBag/activity/index'),
			models: () => [import(/* webpackChunkName: "courseBag/activity" */ './pages/courseBag//activity/model')]
		},
		{
			path: '/courseBag/course',
			component: () => import(/* webpackChunkName: "courseBag/course" */ './pages/courseBag/course/index'),
			models: () => [import(/* webpackChunkName: "courseBag/course" */ './pages/courseBag//course/model')]
		}
	]

	return (
		<ConnectedRouter history={history}>
			<ConfigProvider
				locale={zhCN}
				theme={{
					token: {
						colorPrimary: '#3f94e2'
					}
				}}
			>
				<App>
					<Switch>
						{
							routes.map(({ path, ...dynamics}, key) => (
								<Route key={key}
									path={path}
									component={dynamic({ app, ...dynamics })}
								/>
							))
						}
						<Redirect exact from='/'  to='/userSetting'/>
            			<Route exact path='*' component={ErrorPage} />
					</Switch>
				</App>
			</ConfigProvider>
		</ConnectedRouter>
	);
};

Routers.propTypes = {
	history: PropTypes.object,
	app: PropTypes.object,
};

export default Routers;
