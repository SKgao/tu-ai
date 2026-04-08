import api from './service';
import api_teachingManage from '@/pages/teachingManage/book/service';
import { filterObj } from '@/utils/tools';
import { message } from 'antd';

export default {
	namespace: 'specialCourse',

	state: {
		tableData: [],
		bookList: [],
        pageNum: 1,
        pageSize: 20,
		totalCount: 0,
		type: '1', // 开课方式
        startTime: '',
        endTime: '',
        beginAt: '',
		endAt: '',
		saleBeginAt: '', // 预售开始时间
		saleEndAt: '',   // 预售结束时间
        iconDetail: '',
		iconTicket: '',
		userId: '',   // 用户ID
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/specialCourse') {
					let _search = location.search.slice(1)
					let arr = (_search) ? _search.split('=') : []
					let _userId = (arr.length) ? arr[1] - 0 : ''
					dispatch({
						type: 'setParam',
						payload: {
							pageNum: 1,
                            pageSize: 20,
                            totalCount: 0,
                            startTime: '',
                            endTime: '',
							beginAt: '',
							saleBeginAt: '', // 预售开始时间
		                    saleEndAt: '',   // 预售结束时间
                            endAt: '',
                            iconDetail: '',
                            iconTicket: ''
						}
					});
					if (arr.length) {
						dispatch({
							type: 'setParam',
							payload: {
								userId: _userId
							}
						});
                        dispatch({ type: 'buyCourse' })
					} else {
						dispatch({
							type: 'setParam',
							payload: {
								userId: ''
							}
						});
						dispatch({ type: 'getCourse' })
					}
				}
			});
		}
	},

	effects: {
		*getCourse({ payload }, { call, put, select }) {
            const { startTime, endTime, pageNum, pageSize } = yield select(state => state.specialCourse);
            const res = yield call(api.getCourse, filterObj({ startTime, endTime, pageNum, pageSize }));
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

		*buyCourse({ payload }, { call, put, select }) {
			const { userId } = yield select(state => state.specialCourse);
            const res = yield call(api.buyCourse, userId);
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

		*getBooklist({ payload }, { call, put, select }) {
			const res = yield call(api_teachingManage.getBook, {
                pageNum: 1,
                pageSize: 100
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

		*addCourse({ payload }, { call, put }) {
			const res = yield call(api.addCourse, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getCourse' });
				yield put({
					type: 'setParam',
					payload: {
						modalShow: false
					}
				 });
			}
		},

		*deleteCourse({ payload }, { call, select, put }) {
			const res = yield call(api.deleteCourse, payload.textbookId);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getCourse' });
			}
		},

		*changeCourse({ payload }, { call, put, select }) {
            const handleType = (payload.type === 'down') ? 'downCourse' : 'upCourse';
			const res = yield call(api[handleType], payload.textbookId - 0);
			if (res) {
                message.success(res.data.message);
                yield put({ type: 'getCourse' });
			}
		},

		*updateCourse({ payload }, { call, put, select }) {
			const res = yield call(api.updateCourse, filterObj(payload));
			if (res) {
                message.success(res.data.message);
                yield put({ type: 'getCourse' });
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
