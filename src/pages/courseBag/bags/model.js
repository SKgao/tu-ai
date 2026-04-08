import api from './service';
import { message } from 'antd';

export default {
	namespace: 'courseBag',

	state: {
        bagList: [], // 课程包列表
        icon: '',    // 添加课程--图标
		activeKey: '0',
        modalShow: false,
        totalCount: 0,
		pageSize: 10,
		pageNum: 1
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/courseBag/bags') {
					dispatch({
						type: 'setParam',
						payload: {
							pageSize: 10,
							pageNum: 1,
							totalCount: 0
						}
					});
					dispatch({ type: 'getBagList' });
				}
			});
		}
	},

	effects: {
		*getBagList({ payload }, { put, call }) {
            const res = yield call(api.getBag);
            if (res) {
				yield put({
            		type: 'save',
            		payload: {
						bagList: []
            		}
            	})
            	yield put({
            		type: 'save',
            		payload: {
						bagList: (res.data) ? res.data.data : []
            		}
            	})
            }
		},

		*deleteBag({ payload }, { call, put }) {
			const { id } = payload;
			const res = yield call(api.deleteBag, id);
            if (res) {
				message.success(res.data.message);
				yield put({ type: 'getBagList' });
			}
		},

		*changeStatus({ payload }, { call, put }) {
			const res = yield call(api.changeStatus, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getBagList' });
			}
		},

		*addBag({ payload }, { call, put }) {
            const res = yield call(api.addBag, payload);
		    if (res) {
				message.success(res.data.message);
				yield put({ type: 'getBagList' })
			}
        },

        *updateBag({ payload }, { call, put }) {
            const res = yield call(api.updateBag, payload);
		    if (res) {
				message.success(res.data.message);
				yield put({ type: 'getBagList' })
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
