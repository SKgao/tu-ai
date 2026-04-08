import api from './service';
import { getUrlParams } from '@/utils/tools';
import { message } from 'antd';

export default {
	namespace: 'courseList',

	state: {
		tableList: [], // 课程包列表
		modalShow: false,
        totalCount: 0,
		pageSize: 10,
		pageNum: 1,
		icon: '',    // 添加课程--图标
		id: '',      // 课程包id
		title: '',   // 课程包名称
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/courseBag/course') {
					dispatch({
						type: 'setParam',
						payload: {
							pageSize: 10,
							pageNum: 1,
                            totalCount: 0,
							id: getUrlParams(location.search, 'id') - 0,
							title: decodeURI(getUrlParams(location.search, 'title')) || ''
						}
					});
					dispatch({ type: 'getCourseList' });
				}
			});
		}
	},

	effects: {
		*getCourseList({ payload }, { put, call, select }) {
            const _id = yield select(state => state.courseList.id);
            const res = yield call(api.getCourseList);
            if (res) {
				const table = (res.data) ? res.data.data.filter(e => e.id === _id) : []
				yield put({
            		type: 'save',
            		payload: {
						tableList: []
            		}
            	})
            	yield put({
            		type: 'save',
            		payload: {
						tableList: table.length ? table[0].textBookDOS : []
            		}
            	})
            }
		},

		*addCourse({ payload }, { call, put }) {
            const res = yield call(api.addCourse, payload);
		    if (res) {
				message.success(res.data.message);
				yield put({ type: 'getCourseList' })
			}
		},

		*updateCourse({ payload }, { call, put }) {
            const res = yield call(api.updateCourse, payload);
		    if (res) {
				message.success(res.data.message);
				yield put({ type: 'getCourseList' })
			}
		},

		*delCourse({ payload }, { call, put }) {
			const { id } = payload;
			const res = yield call(api.delCourse, id);
            if (res) {
				message.success(res.data.message);
				yield put({ type: 'getCourseList' });
			}
		},

		*changeStatus({ payload }, { call, put }) {
			const res = yield call(api.changeStatus, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getCourseList' });
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
