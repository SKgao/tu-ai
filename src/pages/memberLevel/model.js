import api from './service';
import { message } from 'antd';

export default {
	namespace: 'memberLevel',

	state: {
		levelList: [],
		modalShow: false
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/memberLevel') {
					dispatch({ type: 'getMemberLevel' });
				}
			})
		},
	},

	effects: {
		*getMemberLevel({ payload }, { call, put, select }) {
			const res = yield call(api.getMemberLevel);
			if (res) {
				yield put({
					type: 'save',
					payload: {
						levelList: []
					}
				});
				yield put({
					type: 'save',
					payload: {
						levelList: (res.data) ? res.data.data : []
					}
				});
			}
        },

        *deleteMemberLevel({ payload }, { call, put }) {
			const res = yield call(api.deleteMemberLevel, payload);
			if (res) {
                res && message.success(res.data.message);
				yield put({ type: 'getMemberLevel' });
			}
		},

		*addMemberLevel({ payload }, { call, put }) {
			const res = yield call(api.addMemberLevel, payload);
			if (res) {
                res && message.success(res.data.message);
				yield put({ type: 'getMemberLevel' });
				yield put({
					type: 'setParam',
					payload: {
						modalShow: false
					}
				});
			}
		},

		*updateMemberLevel({ payload }, { call }) {
			const res = yield call(api.updateMemberLevel, payload);
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
