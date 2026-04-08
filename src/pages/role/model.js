import api from './service';
import { getField, flatten } from '@/utils/tools';
import { message } from 'antd';

export default {
	namespace: 'roleSetting',

	state: {
		tableData: [],
		account: '',
		modalShow: false,
		modal2Show: false,
		siderList: [],
		rolename: '',  // 当前角色
		roleid: '',    // 角色id
		menuIds: [],   // 授权菜单
		defaultCheckedKeys: [],  // 权限树默认选中
		halfCheckedKeys: []
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/roleSetting') {
					dispatch({
						type: 'setParam',
						payload: {
							account: '',
						}
					});
					dispatch({ type: 'getRole' })
			        dispatch({ type: 'getSliderBar' })
				}
			});
		}
	},

	effects: {
		*getSliderBar({ payload }, { call, put, select }) {
			const res = yield call(api.getMenus, {id: 1});
			yield put({
				type: 'save',
				payload: {
					siderList: (res.data) ? res.data.data : []
				}
			});
		},

		// 获取当前角色菜单
		*getMenus({ payload }, { call, put, select }) {
			const res = yield call(api.getMenus, payload);
			const data = (res.data) ? res.data.data : [];
			const _id1 = data.map(e => e.id);
			const _id2 = flatten(getField(data, 'id'));
			const _id = Array.from(new Set(_id1.concat(_id2)));
			yield put({
				type: 'save',
				payload: {
					defaultCheckedKeys: _id.map(e => e + ''),
					halfCheckedKeys: _id1.map(e => e + ''),
					modal2Show: true
				}
			});
		},

		*getRole({ payload }, { call, put, select }) {
			const res = yield call(api.getRole, payload);
			if (res) {
				yield put({
					type: 'save',
					payload: {
						tableData: (res.data) ? res.data.data : []
					}
				})
			}
		},

		*addRole({ payload }, { call, put }) {
			const res = yield call(api.addRole, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getRole' });
				yield put({
					type: 'setParam',
					payload: {
						modalShow: false
					}
				 });
			}
		},

		*deleteRole({ payload }, { call, select, put }) {
			const { tableData } = yield select(state => state.roleSetting);
			const res = yield call(api.deleteRole, payload);
			if (res) {
				message.success(res.data.message);
				yield put({
					type: 'save',
					payload: {
						tableData: tableData.filter(e => e.id !== payload)
					}
				})
			}
		},

		*setauthRole({ payload }, { call, put }) {
			const pay = {
				menuIds: payload.menuIds.map(e => e - 0),
				roleId: payload.roleId - 0
			}
			const res = yield call(api.setauthRole, pay);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'app/fetch' });
				yield put({
					type: 'save',
					payload: {
						modal2Show: false
					}
				});
			}
		},

		*menusRole({ payload }, { call }) {

		},

		*setParam({ payload }, { put }) {
			for (let key in payload) {
				yield put({
					type: 'save',
					payload: {
						[key]: payload[key]
					}
				})
			}
		}
	},

	reducers: {
		save(state, { payload }) {
			return { ...state, ...payload }
		}
	},
};
