// 拼接0
const add0 = s => s > 9 ? s : '0' + s;

/**
 * 展开数组
 * @param  {Array}
 * @return {Array}     [description]
 */
const _flatten = (arr) => {
	return arr.reduce((prev, cur) => {
		return prev.concat(Array.isArray(cur) ? _flatten(cur) : cur)
	}, [])
};

/**
 * 获取字段
 * @param  {Array}  arr 目标数组
 * @param  {String} field 要获取字段
 * @return {Array}     [description]
 */
const _getField = (arr, field) => {
	return arr.map(e => {
		return (e.children && e.children.length) ? _getField(e.children, field) : e[field]
	})
}

module.exports = {
	/**
	 * 获取日期格式化
	 * @param  {[type]} d 日期差 默认获取昨天
	 * @param  {[type]} m 月差
	 * @return {[type]}   format: 20180505
	 */
	getFormatDate: (d = -1, m = 0) => {
		const diff = 1000 * 60 * 60 * 24 * d + 1000 * 60 * 60 * 24 * 30 * m;
		const n = new Date(Date.now() + diff);

		return n.getFullYear() + add0(n.getMonth() + 1) + add0(n.getDate())
	},

	/**
	 * 获取月份格式化
	 * @param  {[type]} d 日期差 默认获取昨天
	 * @param  {[type]} m 月差
	 * @return {[type]}   format: 20180505
	 */
	getFormatMonth: (m = 0) => {
		const diff = 1000 * 60 * 60 * 24 * 30 * m;
		const n = new Date(Date.now() + diff);

		return n.getFullYear() + add0(n.getMonth() + 1)
	},

	/**
	 * 过滤值为空的对象key
	 * @param  {Object}
	 */
	filterObj: (obj = {}) => {
		for (var key in obj) {
			if (obj[key] === '' || obj[key] === null || obj[key] === undefined) {
				delete obj[key]
			}
		}
		return obj
	},

	/**
	 * 数字千分符
	 * @param  {String|Number} 数字或字符串
	 */
	thousandBit: (str) => {
        let reg = /\d(?=(?:\d{3})+(?:\.\d+|$))/g;
        return (str + '').replace(reg, '$&,');
	},

	/**
	 * 获取URL参数
	 * @param  {String}
	 */
	getUrlParams: (str, name) => {
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); //定义正则表达式
		let r = str.substr(1).match(reg);
		if (r != null) return r[2];
		return null;
	},

	// 展开数组
	flatten: _flatten,

	// 获取字段
	getField: _getField
}