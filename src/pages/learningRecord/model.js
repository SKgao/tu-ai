import api from './service';
import { getUrlParams, filterObj } from '@/utils/tools';

export default {
	namespace: 'learningRecord',

	state: {
        list: [],
		pageSize: 10,
		pageNum: 1,
        totalCount: 0,
        startTime: '',
        endTime: '',
		userId: '',      // 用户id
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/learningRecord') {
					dispatch({
						type: 'setParam',
						payload: {
                            list: [],
							pageNum: 1,
							totalCount: 0,
							userId: getUrlParams(location.search, 'userId') - 0 || '',
						}
					}).then(() => {
						dispatch({ type: 'getRecord' })
					})
				}
			})
		},
	},

	effects: {
		*getRecord({ payload }, { call, put, select }) {
			const { userId, pageSize, pageNum, startTime, endTime } = yield select(state => state.learningRecord);
            const res = yield call(api.getRecord, filterObj({ userId, pageSize, pageNum, startTime, endTime }));
			if (res) {
				yield put({
					type: 'save',
					payload: {
						list: (res.data.data) ? res.data.data.data : [],
						totalCount: (res.data.data) ? res.data.data.totalCount : 0
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
