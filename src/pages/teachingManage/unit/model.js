import api from './service';
import { filterObj, getUrlParams } from '@/utils/tools';
import api_teachingManage from '@/pages/teachingManage/book/service';
import { message } from 'antd';

export default {
	namespace: 'bookUnit',

	state: {
		tableData: [],
        modalShow: false,
        startTime: '',
        endTime: '',
        textBookId: '',
		bookList: [],
		pageSize: 10,
        pageNum: 1,
        totalCount: 0
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/teachingManage/unit') {
					let param = {
						startTime: '',
						endTime: '',
						pageSize: 10,
						pageNum: 1,
						textBookId: getUrlParams(location.search, 'textBookId')
					}
					dispatch({
						type: 'setParam',
						payload: param
					})
					dispatch({ type: 'getUnit', param });
				}
			})
		}
	},

	effects: {
     	*getUnit({ payload }, { call, put, select }) {
			const { pageNum, pageSize, startTime, endTime, textBookId } = yield select(state => state.bookUnit);
			const _pay = (payload) ? payload : { pageNum, pageSize, startTime, endTime, textBookId };
            const res = yield call(api.getUnit, filterObj(_pay));
			if (res) {
				yield put({
					type: 'save',
					payload: {
						tableData: [],
						totalCount: 0
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

        *getBook({ payload }, { call, put, select }) {
			const res = yield call(api_teachingManage.getBook, {
                pageNum: 1,
                pageSize: 1000
            });
			if (res) {
				yield put({
					type: 'save',
					payload: {
						bookList: (res.data.data) ? res.data.data.data : []
					}
				})
			}
		},

		*addUnit({ payload }, { call, put }) {
			const res = yield call(api.addUnit, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getUnit' });
			}
		},

		*sendUnit({ payload }, { call }) {
            const res = yield call(api.sendUnit, payload);
            res && message.success(res.data.message);
		},

        *updateUnit({ payload }, { call, put }) {
			const res = yield call(api.updateUnit, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getUnit' });
			}
		},

		*lockUnit({ payload }, { call, put }) {
			const res = yield call(api.lockUnit, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getUnit' });
			}
		},

		*deleteUnit({ payload }, { call, select, put }) {
			const res = yield call(api.deleteUnit, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getUnit' });
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
