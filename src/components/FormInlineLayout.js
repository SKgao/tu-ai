import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Component } from 'react';
import { Button } from 'antd';
import { Icon } from '@ant-design/compatible';

/**
 * 表单布局
 * @props  showFoldBtn [bool]  是否显示展开收起按钮
 * @state  foldForm    [bool]  展开 or 收起
 */
class FormInlineLayout extends Component {
	constructor(props) {
		super(props);
		this.state = {
			foldForm: !!this.props.foldForm,
			showFrom: false
		}
	}

	handleFold = () => {
		this.setState({
			foldForm: !this.state.foldForm
		})
	}

	toggleFromLayout = () => {
		this.setState({
			showFrom: !this.state.showFrom
		})
	}

	render() {
		let { showFoldBtn, mobileLayout, children, className = '' } = this.props;
		let { foldForm, showFrom } = this.state;
		return (
			<div className={classNames({
				"form-wrap": true,
				"form-fold": showFoldBtn,
				"form-unfold": showFoldBtn && foldForm,
				"form-mobile": mobileLayout,
				"show-formlayout": showFrom
			}) + ' ' + className}>
				<div className="header-icon header-form-filter" onClick={this.toggleFromLayout}>
					<Icon type={"filter"} />
				</div>
				<div className="main-shadow" onClick={this.toggleFromLayout}></div>
				{children}
				<a className="form-fold-btn" onClick={this.handleFold}>
					{
						foldForm ? 
						<span>收起<Icon type="up" /></span> :
						<span>展开<Icon type="down" /></span>
					}
				</a>
			</div>
		);
	}
}

FormInlineLayout.propTypes = {
	children: PropTypes.any,
	showFoldBtn: PropTypes.bool,
};

export default FormInlineLayout;