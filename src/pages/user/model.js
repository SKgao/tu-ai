import api from './service';
import api_role from '@/pages/role/service';
import { filterObj } from '@/utils/tools';
import { message } from 'antd';

export default {
	namespace: 'userSetting',

	state: {
		tableData: [],
		roleList: [],
		startTime: '',
		endTime: '',
		account: '',
		modalShow: false,
		modal2Show: false,
		avatar: '', // 用户头像url
		userid: '', // 当前行用户id
		pageSize: 10,
        pageNum: 1,
        totalCount: 0
	},

	subscriptions: {
		setup({ dispatch, history }) {
			dispatch({
				type: 'getUser',
				payload: {
					pageNum: 1,
					pageSize: 100
				}
			})

			return history.listen(location => {
				if (location.pathname === '/userSetting') {
					let pay = {
						pageNum: 1,
						pageSize: 10,
						account: '',
						startTime: '',
						endTime: '',
					}
					dispatch({
						type: 'setParam',
						payload: pay
					});
					dispatch({
						type: 'getUser',
						payload: pay
				    });
				}
			})
		},
	},

	effects: {
		*getUser({ payload }, { call, put }) {
			const res = yield call(api.getUser, filterObj(payload));
			if (res) {
				yield put({
					type: 'save',
					payload: {
						tableData: []
					}
				})
				yield put({
					type: 'save',
					payload: {
						tableData: (res.data.data) ? res.data.data.data : [],
						totalCount: (res.data.data) ? res.data.data.totalCount : 0
					}
				})
			}
		},

		*getRoleList({ payload }, { call, put }) {
			const res = yield call(api_role.getRole, payload);
			if (res) {
				yield put({
					type: 'save',
					payload: {
						roleList: (res.data) ? res.data.data : []
					}
				})
			}
		},

		*addUser({ payload }, { call, put, select }) {
			const { startTime, endTime, pageNum, pageSize } = yield select(state => state.userSetting);
			const res = yield call(api.addUser, payload);
			if (res) {
				message.success(res.data.message);
				yield put({
					type: 'getUser',
					payload: { startTime, endTime, pageNum, pageSize }
				})
				yield put({
					type: 'setParam',
					payload: {
						modalShow: false
					}
				})
			}
		},

		*deleteUser({ payload }, { call, select, put }) {
			const { startTime, endTime, pageNum, pageSize, account } = yield select(state => state.userSetting);
			const res = yield call(api.deleteUser, payload);
			if (res) {
				message.success(res.data.message);
				yield put({
					type: 'getUser',
					payload: { startTime, endTime, pageNum, pageSize, account }
				})
			}
		},

		*forbiddenUser({ payload }, { call, select, put }) {
			const { startTime, endTime, pageNum, pageSize, account } = yield select(state => state.userSetting);
			const res = yield call(api.forbiddenUser, payload);
			if (res) {
				message.success(res.data.message);
				yield put({
					type: 'getUser',
					payload: { startTime, endTime, pageNum, pageSize, account }
				})
			}
		},

		*usingUser({ payload }, { call, select, put }) {
			const { startTime, endTime, pageNum, pageSize, account } = yield select(state => state.userSetting);
			const res = yield call(api.usingUser, payload);
			if (res) {
				message.success(res.data.message);
				yield put({
					type: 'getUser',
					payload: { startTime, endTime, pageNum, pageSize, account }
				})
			}
		},

		*updateUser({ payload }, { call, select, put }) {
			const { startTime, endTime, pageNum, pageSize, account } = yield select(state => state.userSetting);
			const res = yield call(api.updateUser, payload);
			if (res) {
				message.success(res.data.message);
				yield put({
					type: 'getUser',
					payload: { startTime, endTime, pageNum, pageSize, account }
				})
			}
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
