import api from './service';
import { filterObj } from '@/utils/tools';

export default {
	namespace: 'couOrder',

	state: {
		orderList: [],
		selectList: [],
		levelList: [],
		courseList: [],
		id: '',     // 活动id
		pageSize: 10,
        pageNum: 1,
        totalCount: 0,
        startTime: '',
        startPayTime: '',
        endTime: '',
		endPayTime: '',
		tutuNumber: '', // 图图号
		orderNo: '',   // 订单号
		orderStatus: '', // 支付状态
		payType: '',   // 支付方式
		activityId: '',
		itemId: '',     // 会员等级id
		textbookId: '', // 课程id
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/couOrder') {
					dispatch({
						type: 'setParam',
						payload: {
							id: '',
							pageNum: 1,
							pageSize: 10,
							totalCount: 0,
							startTime: '',
							startPayTime: '',
							endTime: '',
							endPayTime: '',
							tutuNumber: '', // 图图号
							orderNo: '',   // 订单号
							orderStatus: '', // 支付状态
							payType: '',   // 支付方式
							activityId: '',
							itemId: '',    // 会员等级id
							textbookId: ''
						}
					});
					dispatch({ type: 'getOrder' });
				}
			})
		},
	},

	effects: {
		*getOrder({ payload }, { call, put, select }) {
			const { startTime, endTime, pageNum, pageSize, id, tutuNumber, orderNo, payType, activityId, orderStatus, itemId, textbookId } = yield select(state => state.couOrder);
			const res = yield call(api.getOrder, filterObj({ startTime, endTime, pageNum, pageSize, id, tutuNumber, orderNo, payType, activityId, orderStatus, itemId, textbookId }));
			if (res) {
				yield put({
					type: 'save',
					payload: {
						orderList: (res.data.data) ? res.data.data.data : [],
						totalCount: (res.data.data) ? res.data.data.totalCount : 0
					}
				});
			}
		},

		*getMemberLevel({ payload }, { call, put, select }) {
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

		*courseSelect({ payload }, { call, put }) {
			const res = yield call(api.getCourse, payload);
			if (res) {
				yield put({
					type: 'save',
					payload: {
						courseList: (res.data) ? [{textbookId: '', textbookName: '全部'}, ...res.data.data] : []
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