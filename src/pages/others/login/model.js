import api from './service';
import { routerRedux } from 'dva/router';
import axios from 'axios';
import { message } from 'antd';

export default {
	namespace: "login",

	state: {
		username: '',
		password: ''
	},

	subscriptions: {
		setup({ dispatch, history }) {
			return history.listen(({ pathname }) => {
				if (pathname === '/') {
					dispatch({ type: 'app/fetch' })
				} else if (pathname === '/login') {
                    dispatch({ type: 'clearStorage' })
				}
			});
		},
	},

	effects: {
		*login({ payload }, { call, put, select }) {
			const res = yield call(api.login, {
				account: payload.username,
				password: payload.password
			});
			if (res) {
				localStorage.setItem('token', res.data.data.token);
				localStorage.setItem('account', res.data.data.account);
				localStorage.setItem('avatar', res.data.data.avatar);
				localStorage.setItem('id', res.data.data.id);
				localStorage.setItem('HAS_LOGIN', true);
				yield put(routerRedux.push('/'));
				yield put({type: 'save', payload});
				axios.defaults.headers = {
					'Content-Type': 'application/json',
					'token': res.data.data.token
				}
			}
		},

		// 进页面先清除localStorage
		*clearStorage({}, {}) {
            localStorage.removeItem('token');
			localStorage.removeItem('account');
			localStorage.removeItem('avatar');
			localStorage.removeItem('firPath');
			localStorage.removeItem('secPath');
			localStorage.removeItem('id');
			localStorage.removeItem('HAS_LOGIN', false);
			axios.defaults.headers = {
				'Content-Type': 'application/json',
				'token': ''
			}
		}
	},

	reducers: {
		save(state, { payload }) {
			return { ...state, ...payload }
		}
	},
};
