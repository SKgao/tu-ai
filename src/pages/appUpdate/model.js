import api from './service';
import { filterObj } from '@/utils/tools';
import { message } from 'antd';

export default {
	namespace: 'appver',

	state: {
        appList: [], // app列表
		verList: [], // 版本列表
		iosList: [], // ios列表
		appname: '', // app类型
		activeKey: '0',
		startTime: '',
		endTime: '',
		appTypeId: '',
		modalShow: false,
		pageSize: 10,
		pageNum: 1,
		totalCount: 0,
		ios: '',
		apkUrl: '',  // 上传apk
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/appverUpdate') {
					dispatch({
						type: 'setParam',
						payload: {
							pageSize: 10,
							pageNum: 1,
							totalCount: 0,
							startTime: '',
							endTime: '',
							appTypeId: '',
							ios: '',
							apkUrl: ''
						}
					});
					dispatch({ type: 'getAppList' });
					dispatch({
						type: 'getVerList',
						payload: {
							pageNum: 1,
							pageSize: 10
						}
					});
				}
			});
		}
	},

	effects: {
		*getAppList({ payload }, { put, call }) {
            const res = yield call(api.getApptype);
            if (res) {
            	yield put({
            		type: 'save',
            		payload: {
						appList: (res.data) ? res.data.data : []
            		}
            	})
            }
		},

		*getVerList({ payload }, { put, call, select }) {
			const { startTime, endTime, appTypeId, pageNum, pageSize } = yield select(state => state.appver);
			const _pay = payload || { startTime, endTime, appTypeId, pageNum, pageSize };
			const res = yield call(api.getVersion, filterObj(_pay));
            if (res) {
            	yield put({
            		type: 'save',
            		payload: {
						verList: (res.data.data) ? res.data.data.data : [],
						totalCount: (res.data.data) ? res.data.data.totalCount : 0
            		}
            	})
            }
		},

		*deleteType({ payload }, { call, put, select }) {
			const { type, id } = payload;
			const _API = (type === 'app') ? 'deleteApptype' : 'deleteVersion';
			const res = yield call(api[_API], id);
            if (res) {
				message.success(res.data.message);
				if (type === 'app') {
					yield put({ type: 'getAppList' });
				} else {
					yield put({ type: 'getVerList' });
				}
			}
		},

		*disableType({ payload }, { call, put, select }) {
			const { type, id } = payload;
			const _API = (type === 'app') ? 'disableApptype' : 'disableVersion';
			const res = yield call(api[_API], id);
			if (res) {
				message.success(res.data.message);
				if (type === 'app') {
					yield put({ type: 'getAppList' });
				} else {
					yield put({ type: 'getVerList' });
				}
			}
		},

		*enableType({ payload }, { call, put, select }) {
			const { type, id } = payload;
			const _API = (payload.type === 'app') ? 'enableApptype' : 'enableVersion';
			const res = yield call(api[_API], id);
            if (res) {
				message.success(res.data.message);
				if (type === 'app') {
					yield put({ type: 'getAppList' });
				} else {
					yield put({ type: 'getVerList' });
				}
			}
		},

		*addApptype({ payload }, { call, put }) {
            const res = yield call(api.addApptype, payload);
		    if (res) {
				message.success(res.data.message);
				yield put({ type: 'getAppList' })
			}
		},

		*addVersion({ payload }, { call, put, select }) {
			const res = yield call(api.addVersion, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getVerList' });
			}
		},

		*getIos({ payload = {} }, { call, put }) {
            const res = yield call(api.getIos, filterObj(payload));
		    if (res) {
				const res = yield call(api.getIos, payload);
				payload.ios && message.success(res.data.message);
				yield put({
					type: 'save',
					ios: res.data.data
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
