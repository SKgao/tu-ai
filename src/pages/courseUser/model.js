import api from './service';
import { filterObj, getUrlParams } from '@/utils/tools';
import { message } from 'antd';

export default {
	namespace: 'courseUser',

	state: {
        tableList: [],
        bookList: [],
        pageSize: 10,
        pageNum: 1,
		totalCount: 0,
		modalShow: false,
		sex: '',  // 性别
        tutuNumber: '', // 图图号
        realName: '',
        textbookId: '',
		mobile: '',     // 手机号
		courseButton: false  // 是否有 开通精品课程按钮权限
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/couUser') {
					dispatch({
						type: 'setParam',
						payload: {
							pageNum: 1,
							pageSize: 10,
							tutuNumber: getUrlParams(location.search, 'tutuNumber') || '',
                            mobile: '',
                            textbookId: '',
                            realName: '',
							sex: ''
						}
					}).then(() => {
						dispatch({ type: 'getUser' }).then(() => {
							dispatch({ type: 'hasCourseButton' });
						})
					})
				}
			})
		},
	},

	effects: {
		// 是否有 开通精品课程按钮权限
		*hasCourseButton({}, { call, put, select }) {
			const { authsId } = yield select(state => state.app);

			yield put({
				type: 'save',
				payload: {
					// 146 - 开通精品课程 148
					courseButton: authsId.indexOf(146) > -1  || authsId.indexOf(148) > -1
				}
			});
		},

		*getUser({ payload }, { call, put, select }) {
			const _state = yield select(state => state.courseUser);
			const res = yield call(api.getUser, filterObj({
				pageNum: _state.pageNum,
				pageSize: _state.pageSize,
				textbookId: _state.textbookId,
				tutuNumber: _state.tutuNumber,
				mobile: _state.mobile,
                sex: _state.sex,
                realName: _state.realName,
			}));
			if (res) {
				yield put({
					type: 'save',
					payload: {
						tableList: (res.data.data) ? res.data.data.data : [],
						totalCount: (res.data.data) ? res.data.data.totalCount : 0
					}
				});
			}
		},

		*addMember({ payload }, { call, put }) {
			const res = yield call(api.addMember, payload);
			if (res) {
				message.success(res.data.message);
				yield put({ type: 'getUser'})
			}
        },

        *getBooklist({ payload }, { call, put, select }) {
			const res = yield call(api.getBooklist, {
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
