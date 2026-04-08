import api from './service';
import { getUrlParams } from '@/utils/tools';
import { message } from 'antd';

export default {
	namespace: 'customPass',

	state: {
		passList: [], // 小关卡
		subjectList: [], // 题型列表
		modalShow: false,
		modalShow3: false,
		textbookId: '',
		sessionId: '',  // 大关卡id
		sessionTit: '', // 大关卡名称
		partsId: '',    // partid
        totalCount: 0,
		pageSize: 10,
		pageNum: 1,

		// 添加题目参数
		customsPassId: '',  // 关卡id
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/teachingManage/customPass') {
					dispatch({
						type: 'setParam',
						payload: {
							pageSize: 10,
							pageNum: 1,
							totalCount: 0,
							partsId: getUrlParams(location.search, 'partsId') || '',
							textbookId: getUrlParams(location.search, 'textbookId') - 0,
							sessionId: getUrlParams(location.search, 'sessionId') || '',
							sessionTit: decodeURI(getUrlParams(location.search, 'sessionTit')) || ''
						}
					});
					dispatch({ type: 'getPassList' });
				}
			});
		}
	},

	effects: {
		*getPassList({ payload }, { put, call, select }) {
			const { pageSize, pageNum, textbookId } = yield select(state => state.customPass);
            const res = yield call(api.getPass, { pageSize, pageNum, textbookId });
            if (res) {
				yield put({
            		type: 'save',
            		payload: {
						passList: [],
						totalCount: 0
            		}
            	})
            	yield put({
            		type: 'save',
            		payload: {
						passList: (res.data) ? res.data.data : []
            		}
            	})
            }
		},

		*getSubject({ payload }, { put, call }) {
            const res = yield call(api.getSubject);
            if (res) {
            	yield put({
            		type: 'save',
            		payload: {
						subjectList: (res.data) ? res.data.data : []
            		}
            	})
            }
        },

		*deletePass({ payload }, { call, put }) {
			const res = yield call(api.deletePass, payload);
            if (res) {
				message.success(res.data.message);
				yield put({ type: 'getPassList' });
			}
		},

		*addPass({ payload }, { call, put }) {
            const res = yield call(api.addPass, payload);
		    if (res) {
				message.success(res.data.message);
				yield put({ type: 'getPassList' })
			}
		},

		*addTopic({ payload }, { call, put }) {
			const res = yield call(api.addTopic, payload);
			if (res) {
				message.success(res.data.message);
			}
		},

        *updatePass({ payload }, { call, put }) {
            const res = yield call(api.updatePass, payload);
		    if (res) {
				message.success(res.data.message);
				yield put({ type: 'getPassList' })
			}
		},

		*sessionBind({ payload }, { call, put }) {
            const res = yield call(api.sessionBind, payload);
		    if (res) {
				message.success(res.data.message);
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
