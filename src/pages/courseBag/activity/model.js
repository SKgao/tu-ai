import api from './service';
import { getUrlParams } from '@/utils/tools';
import { message } from 'antd';

export default {
	namespace: 'bagActivity',

	state: {
		tableList: [], // 课程包列表
		bookList: [],
        totalCount: 0,
		pageSize: 10,
        pageNum: 1,
        id: '',      // 课程包id
        type: '1', // 开课方式
        startTime: '',
        endTime: '',
        beginAt: '',
		endAt: '',
		saleBeginAt: '', // 预售开始时间
		saleEndAt: '',   // 预售结束时间
		alldate: '',     // 预售持续时间
		alldate2: '',    // 开课持续时间
        iconDetail: '',
		iconTicket: '',
		userId: '',   // 用户ID
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/courseBag/activity') {
                    let _id = getUrlParams(location.search, 'id')
					dispatch({
						type: 'setParam',
						payload: {
							pageSize: 10,
							pageNum: 1,
                            totalCount: 0,
                            id: _id || ''
						}
					});
					dispatch({ type: 'getActivity' });
				}
			});
		}
	},

	effects: {
		*getActivity({ payload }, { put, call, select }) {
            const _id = yield select(state => state.bagActivity.id);
            const res = yield call(api.getActivity, {id: _id});
            if (res) {
				yield put({
            		type: 'save',
            		payload: {
						tableList: []
            		}
            	})
            	yield put({
            		type: 'save',
            		payload: {
						tableList: (res.data) ? res.data.data : []
            		}
            	})
            }
        },

        *addActivity({ payload }, { call, put }) {
            const res = yield call(api.addActivity, payload);
		    if (res) {
				message.success(res.data.message);
				yield put({ type: 'getActivity' })
			}
        },

        *updateActivity({ payload }, { call, put }) {
            const res = yield call(api.updateActivity, payload);
		    if (res) {
				message.success(res.data.message);
				yield put({ type: 'getActivity' })
			}
		},

		*deleteActivity({ payload }, { call, put }) {
            const res = yield call(api.deleteActivity, payload);
		    if (res) {
				message.success(res.data.message);
				yield put({ type: 'getActivity' })
			}
		},

		*getBooklist({ payload }, { call, put, select }) {
			const res = yield call(api.getSelect, {
                pageNum: 1,
                pageSize: 100
			});
			if (res) {
				yield put({
					type: 'save',
					payload: {
						bookList: (res.data) ? res.data.data : []
					}
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
