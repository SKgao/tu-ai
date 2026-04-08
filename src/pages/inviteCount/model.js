import api from './service';
import { getUrlParams } from '@/utils/tools';

export default {
	namespace: 'inviteCount',

	state: {
    	inviteList: [],
		pageSize: 10,
		pageNum: 1,
		totalCount: 0,
		userId: '',      // 用户id
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/inviteCount') {
					dispatch({
						type: 'setParam',
						payload: {
							inviteList: [],
							pageNum: 1,
							totalCount: 0,
							userId: getUrlParams(location.search, 'userId') - 0 || '',
						}
					}).then(() => {
						dispatch({ type: 'getInvite' })
					})
				}
			})
		},
	},

	effects: {
		*getInvite({ payload }, { call, put, select }) {
			const { userId } = yield select(state => state.inviteCount);
			const res = yield call(api.getInvite, userId);
			if (res) {
				yield put({
					type: 'save',
					payload: {
						inviteList: (res.data) ? res.data.data : [],
						totalCount: (res.data) ? res.data.totalCount : 0
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
