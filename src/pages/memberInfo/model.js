import api from './service';
import { filterObj } from '@/utils/tools';
import { message } from 'antd';

export default {
	namespace: 'memberInfo',

	state: {
        memberList: [],
		memberLevelList: [],
		feedList: [],    // 反馈列表
        pageSize: 10,
        pageNum: 1,
        totalCount: 0,
        expireStartTime: '', // 会员到期起始时间
		expireEndTime : '',  // 会员到期截止时间
		payStartTime: '',  // 会员开始起始时间
		payEndTime: '',    // 会员开始截止时间
		registerStartTime: '', // 会员注册起始时间
		registerEndTime: '',   // 会员注册截止时间
		userLevel: '', // 用户等级
		userLevelIds: [], // 用户等级id数组
		bookVersionId: '',  // 教材版本id
		sex: '',  // 性别
		tutuNumber: '', // 图图号
		mobile: '',     // 手机号
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(location => {
				if (location.pathname === '/memberInfo') {
					dispatch({
						type: 'setParam',
						payload: {
							pageNum: 1,
							pageSize: 10,
							hasSetPassword: '',
							tutuNumber: '',
							mobile: '',
							userLevelIds: [],
							expireStartTime: '', // 会员起始时间
							expireEndTime : '',  // 会员截止时间
							payStartTime: '',  // 会员开始起始时间
		                    payEndTime: '',    // 会员开始截止时间
							registerStartTime: '', // 会员注册起始时间
		                    registerEndTime: '',   // 会员注册截止时间
							bookVersionId: '',
							sex: ''
						}
					});

					dispatch({ type: 'getMemberLevel' })
					.then(() => {
						dispatch({ type: 'getMember' });
					})
				}
			})
		},
	},

	effects: {
		*getMember({ payload }, { call, put, select }) {
			const _state = yield select(state => state.memberInfo);
			const idArr = _state.userLevelIds.filter(e => e);
			const res = yield call(api.getMember, filterObj({
				userLevelIds: idArr.length ? idArr.map(e => e - 0) : '',
				expireStartTime: _state.expireStartTime,
				expireEndTime: _state.expireEndTime,
				payStartTime: _state.payStartTime,
				payEndTime: _state.payEndTime,
				registerStartTime: _state.registerStartTime,
		        registerEndTime: _state.registerEndTime,
				pageNum: _state.pageNum,
				pageSize: _state.pageSize,
				bookVersionId: _state.bookVersionId,
				tutuNumber: _state.tutuNumber,
				mobile: _state.mobile,
				sex: _state.sex
			}));
			if (res) {
				yield put({
					type: 'save',
					payload: {
						memberList: (res.data.data) ? res.data.data.data : [],
						totalCount: (res.data.data) ? res.data.data.totalCount : 0
					}
				});
			}
        },

        *getMemberLevel({ payload }, { call, put }) {
			const res = yield call(api.getMemberLevel, payload);
			if (res) {
				const filterData = res.data ? res.data.data.filter(e => e.levelName !== '普通用户') : []
				yield put({
					type: 'save',
					payload: {
						userLevelIds: filterData.map(e => e.userLevel - 0),
						memberLevelList: filterData
					}
				});
			}
		},

		*updateUserLevel({ payload }, { call }) {
			const res = yield call(api.updateUserLevel, payload);
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
