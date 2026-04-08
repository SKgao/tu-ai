import api from './service';
import { filterObj, getUrlParams } from '@/utils/tools';
import { message } from 'antd';

export default {
	namespace: 'unitPart',

	state: {
		partList: [],
		startTime: '',
		endTime: '',
		textBookId: '',
		unitId: 0,
		pageSize: 10,
        pageNum: 1,
        totalCount: 0
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/teachingManage/part') {
					let param = {
						startTime: '',
						endTime: '',
						pageSize: 10,
						pageNum: 1,
						unitId: getUrlParams(location.search, 'unitId'),
						textBookId: getUrlParams(location.search, 'textBookId') || ''
					}
					dispatch({
						type: 'setParam',
						payload: param
					})
					dispatch({ type: 'getPart', param });
				}
			})
		}
	},

	effects: {

		*getPart({ payload }, { call, put, select }) {
			const { pageNum, pageSize, startTime, endTime, unitId } = yield select(state => state.unitPart);
			const _pay = (payload) ? payload : { pageNum, pageSize, startTime, endTime, unitId };
            const res = yield call(api.getPart, filterObj(_pay));
			if (res) {
				yield put({
					type: 'save',
					payload: {
						partList: [],
						totalCount: 0
					}
				})
				yield put({
					type: 'save',
					payload: {
						partList: (res.data.data) ? res.data.data.data : [],
						totalCount: (res.data.data) ? res.data.data.totalCount : 0
					}
				})
			}
		},

		*addPart({ payload }, { call, put, select }) {
			const res = yield call(api.addPart, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getPart' });
			}
		},

		*updatePart({ payload }, { call, put, select }) {
			const res = yield call(api.updatePart, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getPart' });
			}
		},

		*deletePart({ payload }, { call, put, select }) {
			const res = yield call(api.deletePart, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getPart' })
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
