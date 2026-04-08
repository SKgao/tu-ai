import api from './service';
import { message } from 'antd';

export default {
	namespace: 'partPass',

	state: {
        tableData: [],
        subjectList: [],
		modalShow: false,
		partsId: '',  // partsId
		pageSize: 10,
        pageNum: 1,
        totalCount: 0
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/teachingManage/pass') {
					let _search = location.search.slice(1)
					let arr = (_search) ? _search.split('=') : []
					if (arr.length) {
						dispatch({ 
							type: 'setParam',
							payload: {
								partsId: arr[1]
							}
						})
						dispatch({ 
							type: 'getPass',
							payload: {
								pageNum: 1,
								pageSize: 10,
								partsId: arr[1]
							}
						})
					}
				}
			});
		}
	},

	effects: {
     	*getPass({ payload }, { call, put }) {
			const res = yield call(api.getPass, payload);
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
						tableData: (res.data) ? res.data.data : [],
						totalCount: (res.data) ? res.data.totalCount : 0
					}
				})
			}
        },
        
        *getSubject({ }, { call, put }) {
			const res = yield call(api.getSubject);
			if (res) {
				yield put({
					type: 'save',
					payload: {
						subjectList: (res.data.data) ? res.data.data.data : []
					}
				})
			}
		},
		
		*addPass({ payload }, { call, put, select }) {
			const res = yield call(api.addPass, payload);
			const { partsId, pageNum, pageSize } = yield select(state => state.partPass);
			if (res) {
				message.success(res.data.message);
				yield put({
                    type: 'getPass',
                    payload: { pageNum, pageSize, partsId}
                });
			}
        },
        
        *updatePass({ payload }, { call, put, select }) {
			const res = yield call(api.updatePass, payload);
			const { partsId, pageNum, pageSize } = yield select(state => state.partPass);
			if (res) {
				message.success(res.data.message);
				yield put({
                    type: 'getPass',
                    payload: { pageNum, pageSize, partsId}
                });
			}
		},

		*deletePass({ payload }, { call, select, put }) {
			const { partsId, pageNum, pageSize } = yield select(state => state.partPass);
			const res = yield call(api.deletePass, payload);
			if (res) {
				message.success(res.data.message);
				yield put({
                    type: 'getPass',
                    payload: { pageNum, pageSize, partsId}
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
	