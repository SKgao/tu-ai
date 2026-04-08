import api from './service';
import { filterObj } from '@/utils/tools';
import { message } from 'antd';

export default {
	namespace: "teachingmanage",

	state: {
        startTime: '',
        endTime: '',
		gradeId: '',  // 年级id
		bookVersionId: '', // 版本id
        bookList: [], // 教材数据
		gradeList: [], // 年级数据
		versionList: [], // 版本数据
		modalShow: false,
		activeKey: 'book',  // 默认tab-书籍管理
		bookVersionName: '',   // 新增-教材版本名称
		gradeName: '',         // 新增-年级名称
		pageSize: 10,
        pageNum: 1,
        totalCount: 0
	},

	subscriptions: {
        setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/teachingManage/book') {
					dispatch({
						type: 'setParam',
						payload: {
							activeKey: 'book',
							startTime: '',
                            endTime: '',
							pageSize: 10,
							pageNum: 1,
							bookVersionId: '',
							gradeId: ''
						}
					});
					dispatch({ type: 'getBook' });
				}
			})
		},
	},

	effects: {
		*getBook({ payload }, { call, put, select }) {
			const { startTime, endTime,  pageSize, pageNum, gradeId, bookVersionId } = yield select(state => state.teachingmanage);
			const res = yield call(api.getBook, filterObj({ startTime, endTime, pageSize, pageNum, gradeId, bookVersionId }));
            if (res) {
				yield put({
            		type: 'save',
            		payload: {
						bookList: [],
						totalCount: 0
            		}
            	})
            	yield put({
            		type: 'save',
            		payload: {
						bookList: (res.data.data) ? res.data.data.data : [],
						totalCount: (res.data.data) ? res.data.data.totalCount : 0
            		}
            	})
            }
        },

        *addBook({ payload }, { call, put }) {
            const res = yield call(api.addBook, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getBook' });
				yield put({
					type: 'setParam',
					payload: {
            			modalShow: false
            		}
				});
			}
        },

        *deleteBook({ payload }, { call, put }) {
            const res = yield call(api.deleteBook, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getBook' })
			}
		},

		*sendBook({ payload }, { call, put }) {
            const res = yield call(api.sendBook, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getBook' })
			}
		},

		*lockBook({ payload }, { call, put }) {
            const res = yield call(api.lockBook, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getBook' })
			}
		},

		*updateBook({ payload }, { call, put }) {
			const res = yield call(api.updateBook, payload);
			console.log('updateBook', payload)
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getBook' })
			}
		},

		*deleteGrade({ payload }, { call, put }) {
            const res = yield call(api.deleteGrade, payload);
            if (res) {
				message.success(res.data.message);
				yield put({ type: 'getGrade' })
			}
		},

		*deleteVersion({ payload }, { call, put }) {
            const res = yield call(api.deleteVersion, payload);
            if (res) {
				message.success(res.data.message);
				yield put({ type: 'getVersion' })
			}
		},

		*sendVersion({ payload }, { call, put }) {
            const res = yield call(api.sendVersion, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getVersion' })
			}
		},

        *getGrade({ payload }, { call, put }) {
			const res = yield call(api.getGrade, payload);
            if (res) {
				yield put({
            		type: 'save',
            		payload: {
						gradeList: []
            		}
            	})
            	yield put({
            		type: 'save',
            		payload: {
            			gradeList: (res.data) ? res.data.data : []
            		}
            	})
            } else {
            	message.error(res.data.message);
            }
        },

        *addGrade({ payload }, { call, put }) {
            const res = yield call(api.addGrade, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getGrade' });
			}
        },

        *updateGrade({ payload }, { call }) {
            const res = yield call(api.updateGrade, payload);
            res && message.success(res.data.message);
		},

		*sendGrade({ payload }, { call }) {
            const res = yield call(api.sendGrade, payload);
            res && message.success(res.data.message);
		},

		*getVersion({ payload }, { call, put }) {
            const res = yield call(api.getVersion, payload);
			if (res) {
				yield put({
            		type: 'save',
            		payload: {
						versionList: []
            		}
            	})
				yield put({
            		type: 'save',
            		payload: {
            			versionList: (res.data) ? res.data.data : []
            		}
            	})
			}
        },

		*addVersion({ payload }, { call, put }) {
            const res = yield call(api.addVersion, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getVersion' });
			}
        },

        *updateVersion({ payload }, { call }) {
            const res = yield call(api.updateVersion, payload);
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
