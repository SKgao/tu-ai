import api from './service';
import { filterObj } from '@/utils/tools';
import { message } from 'antd';

export default {
	namespace: 'authmenu',

	state: {
		tableData: [],
		modalShow: false,
		menuName: '',  // 菜单名称
		pageSize: 10,
        pageNum: 1,
        totalCount: 0
	},

	subscriptions: {
		setup({ dispatch, history }) {
            return history.listen(location => {
				if (location.pathname === '/authMenu') {
					dispatch({
						type: 'setParam',
						payload: {
							pageNum: 1,
							pageSize: 10,
							menuName: ''
						}
					});
					dispatch({ type: 'getMenu' });
				}
			})
		},
	},

	effects: {
		*getMenu({ payload }, { call, put, select }) {
			const { menuName, pageNum, pageSize} = yield select(state => state.authmenu);
			const res = yield call(api.getMenu, filterObj({ menuName, pageNum, pageSize}));
			if (res) {
				yield put({
					type: 'save',
					payload: {
						tableData: []
					}
				});
				yield put({
					type: 'save',
					payload: {
						tableData: (res.data.data) ? res.data.data.data : [],
						totalCount: (res.data.data) ? res.data.data.totalCount : 0
					}
				});
			}
		},

		*addMenu({ payload }, { call, put, select }) {
			const res = yield call(api.addMenu, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getMenu' });
				yield put({
					type: 'setParam',
					payload: {
						modalShow: false
					}
				});
			}
		},

		*deleteMenu({ payload }, { call, select, put }) {
			const res = yield call(api.deleteMenu, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'app/fetch' });
				yield put({ type: 'getMenu' });
			}
		},

		*updateMenu({ payload }, { call }) {
			const res = yield call(api.updateMenu, payload);
			res && message.success(res.data.message);
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
