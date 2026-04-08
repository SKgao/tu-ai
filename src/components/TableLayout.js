import PropTypes from 'prop-types';
import { flatten, getField } from '@/utils/tools';
import { Component } from 'react';
import { Table, Popover, Tooltip, Tree } from 'antd';
import { Icon } from '@ant-design/compatible';
const { Column, ColumnGroup } = Table;
const { TreeNode } = Tree;

/**
 * 表格组件
 */
class TableLayout extends Component {
	constructor(props) {
		super(props);
		this.state = {
			scrollX: 0,
			colWidth: {},
			checkedKeys: []
		}
	}

	renderColumn = item => {
		let { filterColumns, showColumns } = this.props
		if(item.children && item.children.length) {
			const arr = item.children.map(e => e.dataIndex)
			const a = new Set(filterColumns)
			const b = new Set(arr)
			// 数组交集 (过滤大列)
			const intersection = Array.from(new Set([...a].filter(x => b.has(x))))
			return intersection.join('') === arr.join('') ? null : (
				<ColumnGroup title={item.title} key={item.title}>
					{
						item.children.map(subitem => this.renderColumn(subitem))
					}
				</ColumnGroup>
			)
		} else {
			let hideColumn = (filterColumns && filterColumns.indexOf(item.dataIndex) > -1)
				|| (showColumns && showColumns.indexOf(item.dataIndex) === -1);
			return hideColumn ? null : <Column
				{...item}
			   	key={item.dataIndex}
			   	sorter={item.sorter ? (a, b) => a[item.dataIndex] - b[item.dataIndex] : false}
			/>
		}
	}

	// 筛选树
	renderTree = item => {
		if (item.children && item.children.length) {
            return (
				<TreeNode title={item.title} key={item.title}>
					{
						item.children.map(subitem => this.renderTree(subitem))
					}
				</TreeNode>
			)
		} else {
			return <TreeNode title={item.title} key={item.dataIndex} />
		}
	}

	UNSAFE_componentWillMount() {
		const { allColumns, filterColumns } = this.props
		const getCheckedKeys = e => e.children && e.children.length ? e.title : e.dataIndex
		const title = flatten(getField(allColumns, 'dataIndex'))
		const width = flatten(getField(allColumns, 'width'))
		let obj = {}
		let scrollX = 0
		for (let i = 0, len = title.length; i < len; i++) {
			if (!obj.hasOwnProperty(title[i])) {
				obj[title[i]] = (width[i]) ? width[i] - 0 : 120
			}
			scrollX += (filterColumns.includes(title[i])) ? 0 : width[i]
		}
		this.setState({
			checkedKeys: this.props.allColumns.map(item => getCheckedKeys(item)),
			colWidth: obj,
			scrollX: scrollX
		})
	}

	// 筛选不展示的列
	checkTree = (checkedKeys, e) => {
		let { filterColumns, treeOnCheck } = this.props
		const nodeChild = e.node.props.children
		const fieldArr = (nodeChild) ? nodeChild.map(item => item.key) : [e.node.props.eventKey]
		const a = new Set(fieldArr)
		const b = new Set(filterColumns)
		const res = e.checked ? Array.from(new Set([...b].filter(x => !a.has(x)))) : Array.from(new Set([...a, ...b]))
		return treeOnCheck({ res })
	}

	render() {
		let { allColumns, tableInfo, showToolbar, dataSource, scrollY, pagination, loading, rowSelection, expandedRowRender, expandRowByClick, scrollX, onChange } = this.props
		return (
			<div className="table-wrapper" style={{ padding: 10 }}>
				{
					showToolbar && <div className="table-toolbar clearfix">
						<div className="table-toolbar-title fl">
							<b>表格标题</b>
							<Tooltip placement="right" title={tableInfo || '报表信息说明......'}>
								<Icon type={'question-circle-o'} className="ml10"></Icon>
							</Tooltip>
						</div>

						<div className="table-toolbar-action fr">
							<Popover placement="bottom"
								title={'筛选要展示的列'}
								content={
									<Tree
										checkable
										defaultCheckedKeys={this.state.checkedKeys}
										onCheck={this.checkTree}
									>
										{
											allColumns.map(item => this.renderTree(item))
										}
									</Tree>
								}
								trigger="click">
								<a className="table-toolbar-title">
									显示列 <Icon type="down" />
								</a>
							</Popover>

							<a className="table-toolbar-title ml10">
								导出 <Icon type="download" />
							</a>

							<a className="table-toolbar-title ml10">操作</a>
						</div>
					</div>
				}

				<Table
				    pagination={pagination}
					dataSource={dataSource}
					rowSelection={rowSelection}
					expandedRowRender={expandedRowRender}
					expandRowByClick={expandRowByClick}
					rowKey={(record, index) => index}
					onChange={onChange}
					loading={{
						spinning: loading,
						delay: 100
					}}
					scroll={{
						x: scrollX || false,
						y: scrollY || false
					}}
					>
					{
						allColumns.map(item => this.renderColumn(item))
					}
				</Table>
			</div>
		)
	}
}

TableLayout.propTypes = {
	pagination: PropTypes.bool,    // 是否启用分页
	filterColumns: PropTypes.array,
	showColumns: PropTypes.array,
	allColumns: PropTypes.array,
	dataSource: PropTypes.array,
	showToolbar: PropTypes.bool, // 是否显示工具栏
	tableInfo: PropTypes.string, // 表格说明
	treeOnCheck: PropTypes.func, // 过滤列回调
	getContentWidth: PropTypes.func,
	scrollY: PropTypes.number,
	loading: PropTypes.bool,
	rowSelection: PropTypes.object,
	expandedRowRender: PropTypes.func,
	onChange: PropTypes.func,
	expandRowByClick: PropTypes.bool
};

TableLayout.defaultProps = {
	showToolbar: false,
	pagination: true,
	loading: false,
	expandRowByClick: false,
	filterColumns: []
}

export default TableLayout;