import PropTypes from 'prop-types';
import { Tabs } from 'antd';
const TabPane = Tabs.TabPane;

const HistoryNavsLayout = ({
	historyList,
	tabEdit,
	tabChange
}) => {
	let hs = window.location.hash.slice(1);
	let idx = hs.indexOf('?');
	idx > -1 && hs.slice(0, idx);
	return (
		<div className={`main-tabs ${historyList.length ? '': 'hide'}`}>
			<Tabs
				hideAdd
				type="editable-card"
				onEdit={tabEdit}
				onChange={tabChange}
				activeKey={hs}
				tabBarGutter={5}>
				{historyList.map(e => <TabPane tab={e.tab} key={e.key}></TabPane>)}
			</Tabs>
		</div>
	);
};

HistoryNavsLayout.propTypes = {
	historyList: PropTypes.array.isRequired
};

export default HistoryNavsLayout;