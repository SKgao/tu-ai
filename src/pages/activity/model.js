import api from './service';
import { filterObj } from '@/utils/tools';
import { message } from 'antd';

export default {
	namespace: 'activity',

	state: {
		tableData: [],   // 表格数据
		selectList: [],  // 下拉框数据
		levelList: [],   // 等级下拉
		startTime: '',
		endTime: '',
		beginAt: '',
		endAt: '',
		id: '',   // 活动id
		pageSize: 10,
    	pageNum: 1,
		totalCount: 0,
		modalShow: false,
		modal2Show: false,
		addStatus: 1,   // 添加活动的状态
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/activity') {
					dispatch({
						type: 'setParam',
						payload: {
							pageNum: 1,
							pageSize: 10,
							startTime: '',
							endTime: '',
							id: ''
						}
					});
					dispatch({ type: 'getActivity' });
				}
			})
		},
	},

	effects: {
		*getActivity({ payload }, { call, put, select }) {
			const { startTime, endTime, pageNum, pageSize, id } = yield select(state => state.activity);
			const res = yield call(api.getActivity, filterObj({ id, startTime, endTime, pageNum, pageSize }));
			if (res) {
				yield put({
					type: 'save',
					payload: {
						tableData: [],
						totalCount: 0
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

		*getMemberLevel({ payload }, { call, put }) {
			const res = yield call(api.getMemberLevel);
			if (res) {
				yield put({
					type: 'save',
					payload: {
						levelList: (res.data) ? res.data.data : []
					}
				});
			}
		},

		*addActivity({ payload }, { call, put, select }) {
			const res = yield call(api.addActivity, payload);
			if (res) {
				message.success(res.data.message);
				yield put({	type: 'getActivity' });
				yield put({
					type: 'setParam',
                    payload: {
						modalShow: false,
						addStatus: 1
				    }
				})
			}
		},

		*updateActivity({ payload }, { call, put }) {
			const res = yield call(api.updateActivity, payload);
			if (res) {
				message.success(res.data.message);
				yield put({	type: 'getActivity' });
			}
		},

		*changeStatus({ payload }, { call, put }) {
			const res = yield call(api.changeStatus, payload);
			if (res) {
				message.success(res.data.message);
				yield put({	type: 'getActivity' });
			}
		},

		*deleteActivity({ payload }, { call, put }) {
			const res = yield call(api.deleteActivity, payload);
			if (res) {
				message.success(res.data.message);
				yield put({	type: 'getActivity' });
			}
		},

		*activeSelect({ payload }, { call, put }) {
			const res = yield call(api.activeSelect, payload);
			if (res) {
				yield put({
					type: 'save',
					payload: {
						selectList: (res.data) ? [{id: '', title: '全部'}, ...res.data.data] : []
					}
				});
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
