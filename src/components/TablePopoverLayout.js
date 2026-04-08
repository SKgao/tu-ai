import { Component } from 'react';
import { Popover, Button, Input, Select } from 'antd';

const Option = Select.Option;

/**
 * 表单气泡卡片
 * @props  showFoldBtn [bool]  是否显示展开收起按钮
 * @state  foldForm    [bool]  展开 or 收起
 */
class TablePopoverLayout extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: this.props.defaultValue,
			newValue: this.props.defaultValue,
			visible: false
		}
	}

	handleEle = () => {
		let { valueData, focusSelect } = this.props;
		if(typeof(valueData) === 'object' && !valueData.length) {
			focusSelect && focusSelect()
		}
		this.handleVisibleChange();
	}

	// 输入框或下拉
	handleChange = value => {
		this.setState({ value })
	}

	// 显示隐藏popover
	handleVisibleChange = () => {
		this.setState({
			visible: !this.state.visible,
		})
	}

	// 确认
	handleOk = () => {
		let { onOk } = this.props;
		let { value } = this.state;
		if(onOk) {
			// 判断回调函数是promise还是function
			if(Object.prototype.toString.call(onOk) === '[object Promise]') {
				onOk(value).then(res => {
					this.setState({ newValue: res })
				}).catch(e => {});
			}
			else if (Object.prototype.toString.call(onOk) === '[object Function]') {
				onOk(value)
				this.setState({ newValue: value })
			}
		}
		this.handleVisibleChange();
	}

	// 取消
	handleCancel = () => {
		let { onCancel, defaultValue } = this.props;
		let { value, newValue } = this.state;
		onCancel && onCancel(value);
		this.handleVisibleChange();
		this.setState({ value: defaultValue !== newValue ? newValue : defaultValue });
	}

	render() {
		let { valueData, focusSelect, inputProps, selectProps, optionItem, optionKey, ...others } = this.props;
		let { value, visible } = this.state;
		return (
			<Popover
				content={
					<div className="popover-group">
						{
							(typeof(valueData) === 'string' || typeof(valueData) === 'number') &&
							<Input
								value={value}
								onChange={e => this.handleChange(e.target.value)}
								{...inputProps}/>
						}
						{
							(typeof(valueData) === 'object' && valueData.length) &&
								<Select
									value={value}
									onChange={this.handleChange}
									onSelect={() => this.setState({ visible: true })}
									{...selectProps}>
									{
										valueData.map(item =>
											<Option key={item[optionKey] || item}>{item[optionItem] || item}</Option>
										)
									}
								</Select>
						}
						<Button type="primary" icon="check" onClick={this.handleOk}/>
						<Button icon="close" onClick={this.handleCancel}/>
					</div>
				}
				visible={visible}
				onVisibleChange={this.handleVisibleChange}
				placement="top"
				trigger="click"
				{...others}>
				<a onClick={this.handleEle} style={{ color: '#333', textDecoration: 'underline' }}>
					{this.props.defaultValue}
				</a>
			</Popover>
		);
	}
}

TablePopoverLayout.propTypes = {

};

export default TablePopoverLayout;
