import PropTypes from 'prop-types';
import classNames from 'classnames';
import '../scss/loader.scss';
import { Spin } from 'antd';

const Loader = ({ spinning, fullScreen, tip }) => {
	return (
		<div className={classNames('loader', {
			'hidden': !spinning,
			'fullScreen': fullScreen,
			})}>
			<div className='warpper'>
				<Spin size="large" tip={ tip || "loading..."} />
			</div>
		</div>
	)
}

Loader.propTypes = {
	spinning: PropTypes.bool,
	fullScreen: PropTypes.bool,
	tip: PropTypes.string,
}

export default Loader
