import PropTypes from 'prop-types';
import { Transfer } from 'antd';

/**
 * 穿梭框选择
 * @param  {[type]}    options.hideLeftList      是否显示左侧
 * @param  {[type]}    options.leftTitle         左侧列表标题
 * @param  {[type]}    options.leftList          左侧列表
 * @param  {[type]}    options.leftRender        展示dom
 * @param  {[type]}    options.leftRowkey        左侧列表key
 * @param  {[type]}    options.leftSelectedIndex 选中
 * @param  {[type]}    options.onChangeTransfer  点击事件
 * @param  {...[type]} options.props             [description]
 * @return {[type]}                              [description]
 */
const TransferLayout = ({
	hideLeftList,
	leftTitle,
	leftList,
	leftRender,
	leftRowkey,
	leftSelectedIndex,
	leftSelectKey,
	onChangeTransfer,
	...props
}) => {

	return (
		<div className="main-transfer">
			<div className="ant-transfer-list transfer-left-list">
				<div className="ant-transfer-list-header">
					<span className="ant-transfer-list-header-title">{leftTitle}</span>
				</div>
				<div className="ant-transfer-list-body">
					<div className="ant-transfer-list-content transfer-left-content">
						{
							!leftList || !leftList.length ?
							<div className="transfer-left-list-body-not-found">无匹配结果</div> :
							<ul className="transfer-left-list-content">
								{
									leftList.map((item, i) => 
										<li 
											className={leftSelectedIndex === i ? 'active': ''}
											onClick={() => onChangeTransfer(item, i)} 
											key={leftRowkey(item, i)}>
											{leftRender(item)}
										</li>
									)
								}
							</ul>
						}
					</div>
				</div>
			</div>
			<Transfer {...props}/>
		</div>
	);
};

TransferLayout.propTypes = {
	hideLeftList: PropTypes.bool,
	leftTitle: PropTypes.string,
	leftList: PropTypes.array,
	leftRender: PropTypes.func,
	leftRowkey: PropTypes.func,
	leftSelectedIndex: PropTypes.number,
	onChangeTransfer: PropTypes.func,
};

TransferLayout.defaultProps = {
	hideLeftList: false,
	leftList: [],
	leftRender: l => l,
	leftRowkey: (item, i) => i,
}

export default TransferLayout;