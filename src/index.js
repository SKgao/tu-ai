import dva from 'dva';
import '@ant-design/compatible/assets/index.css';
import 'antd/dist/antd.css';
import './scss/reset.scss';
import './../public/iconfont/iconfont.css';
// import { createLogger } from 'redux-logger';

import createLoading from 'dva-loading';
import { message } from 'antd';

// 1. Initialize
const app = dva({
	// ...createLoading({
	// 	effects: true,
	// }),
	onError(e) {
		message.error(e.message, 3);
	},
	// onAction: createLogger(),
});

// 2. Plugins
app.use(createLoading());

// 3. Model
app.model(require('./model').default);

// 4. Router
// 5. Start
hashChangeFire()

// url变化监听器 浏览器支持onhashchange事件
if( ('onhashchange' in window) && ((typeof document.documentMode==='undefined') || document.documentMode === 8)) {
    window.onhashchange = hashChangeFire;
}

function hashChangeFire() {
	// var href = window.location.href
	// if(href.indexOf('/dftt/dftt-zq/') > -1) {
	// 	import(/* webpackChunkName: "dftt-dftt-zq" */ './routes/dftt-dftt-zq.js').then(res => {
	// 		app.router(res.default);
	// 		app.start('#root');
	// 	})
	// }  else {
	// 	app.router(require('./router').default);
	// 	app.start('#root');
	// }
	app.router(require('./router').default);
	app.start('#root');
}
