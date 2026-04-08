import PropTypes from 'prop-types';
import FormInlineLayout from '@/components/FormInlineLayout';
import TableLayout from '@/components/TableLayout';
import PaginationLayout from '@/components/PaginationLayout';
import MyUpload from '@/components/UploadComponent';
import moment from 'moment';

import { filterObj } from '@/utils/tools';

import { connect } from 'dva';
import { formItemLayout } from '@/configs/layout';
import { DatePicker, Input, Button, Popconfirm, Tabs, Modal, Radio, Badge, Select, message } from 'antd';
import { Form } from '@ant-design/compatible';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const AppverUpdate = ({
	appver,
	loading,
	...props
}) => {
	let { dispatch, form } = props;
	let { appList, verList, iosList, activeKey, startTime, endTime, appname, modalShow, appTypeId, pageNum, pageSize, totalCount } = appver;
	let { getFieldDecorator, validateFieldsAndScroll, resetFields, setFieldsValue } = form;

	let appColumns = [
        {
            title: '类型名称',
			dataIndex: 'name',
			sorter: true
		}, {
			title: '状态',
			dataIndex: 'status',
			render: (txt) => {
				switch (txt) {
					case 1:
						return <Badge status="processing" text="正常"/>;
					case 2:
						return <Badge status="warning" text="不可用"/>;
					default:
					    return <Badge status="warning" text="删除"/>;
				}
			}
		}, {
			title: '添加时间',
			dataIndex: 'createdAt',
			sorter: true
		}, {
			title: '操作',
			dataIndex: 'action',
            render: (txt, record, index) => {
                return <span>
                    {
                        record.status === 2 && <Button type="primary" size="small" onClick={() => handleEnable(index, 'app')}>启用</Button>
					}
					{
                        record.status === 1 && <Button size="small" style={{ marginLeft: 5 }} onClick={() => handleDisable(index, 'app')}>禁用</Button>
					}
                    <Popconfirm title="是否删除?" onConfirm={() => handleDelete(index, 'app')}>
                        <Button type="danger" size="small" style={{ marginLeft: 5 }}>删除</Button>
                    </Popconfirm>
                </span>
            }
		}
	];
	let verColumns = [
        {
            title: '版本名称',
			dataIndex: 'versionName',
			sorter: true
		}, {
			title: '状态',
			dataIndex: 'status',
			sorter: true,
			render: (txt) => {
				switch (txt) {
					case 1:
						return <Badge status="processing" text="正常"/>;
					case 2:
						return <Badge status="warning" text="不可用"/>;
					default:
					    return <Badge status="warning" text="删除"/>;
				}
			}
		}, {
			title: '是否需要强制更新',
			dataIndex: 'forceUpdate',
			sorter: true,
			render: (txt) => <span>{ (txt == 1) ? '不需要' : '需要' }</span>
		}, {
			title: '添加时间',
			dataIndex: 'createdAt',
			sorter: true
		}, {
			title: '操作',
			dataIndex: 'action',
            render: (txt, record, index) => {
                return <span>
					{
                        record.status === 2 && <Button type="primary" size="small" onClick={() => handleEnable(index, 'ver')}>启用</Button>
					}
					{
                        record.status === 1 && <Button size="small" style={{ marginLeft: 5 }} onClick={() => handleDisable(index, 'ver')}>禁用</Button>
					}
                    <Popconfirm title="是否删除?" onConfirm={() => handleDelete(index, 'ver')}>
                        <Button type="danger" size="small" style={{ marginLeft: 5 }}>删除</Button>
                    </Popconfirm>

					<Button type="primary" size="small" style={{ marginLeft: 5 }} onClick={() => handleDownload(index)}>下载apk</Button>
                </span>
            }
		}
	];

	let iosColumns = [{
		title: 'App名称',
		dataIndex: 'name'
	}, {
		title: '状态',
		dataIndex: 'status',
		sorter: true,
		render: (txt) => {
			switch (txt) {
				case 1:
					return <Badge status="processing" text="正常"/>;
				case 2:
					return <Badge status="warning" text="不可用"/>;
				default:
					return <Badge status="warning" text="删除"/>;
			}
		}
	}]

	// 表格列配置
	let allColumns = (activeKey === '0') ? appColumns : (activeKey === '1') ? verColumns : iosColumns;
	let dataSource = (activeKey === '0') ? appList : (activeKey === '1') ? verList : iosList;

    /**
     * 删除App、版本类型
     * @param  {object} 列数据
     */
    const handleDelete = (idx, type) => {
		const LIST = (type === 'app') ? appList : verList;
    	dispatch({
    		type: 'appver/deleteType',
    		payload: {
				id: LIST[idx].id,
				type
			}
    	})
	}

	/**
	 * 启用App、版本类型
	 * @param  {object} 列数据
	 */
	const handleEnable = (idx, type) => {
		const LIST = (type === 'app') ? appList : verList;
		dispatch({
			type: 'appver/enableType',
			payload: {
				id: LIST[idx].id,
				type
			}
		})
	}

	/**
	 * 禁用App、版本类型
	 * @param  {object} 列数据
	 */
	const handleDisable = (idx, type) => {
		const LIST = (type === 'app') ? appList : verList;
		dispatch({
			type: 'appver/disableType',
			payload: {
				id: LIST[idx].id,
				type
			}
		})
	}

	// 下载Apk
	const handleDownload = (idx) => {
		window.location.href = verList[idx].apkUrl;
	}

	// 切换tabs
    const handleTabChange = (key = '0') => {
    	dispatch({
    		type: 'appver/setParam',
    		payload: {
				activeKey: key
			}
		})
		if (key === '0') {
            dispatch({ type: 'appver/getAppList' })
		} else if (key === '1') {
			dispatch({
				type: 'appver/getVerList',
				payload: filterObj({ appTypeId, startTime, endTime, pageNum, pageSize })
			})
		} else if (key === '2') {
			dispatch({ type: 'appver/getIos' })
		}
	}

	// 选择时间框
	const datepickerChange = (d, t) => {
		dispatch({
			type: 'appver/setParam',
			payload: {
				startTime: t[0] ? t[0] + ':00' : '',
                endTime: t[1] ? t[1] + ':00' : ''
			}
		})
	}

	// 展示modal
	const changeModalState = (flag, show) => {
		dispatch({
			type: 'appver/setParam',
			payload: {
				modalShow: show
			}
		})
	}

	// 添加App类型
	const handleAddapptype = () => {
		if (appname.trim()) {
			dispatch({
				type: 'appver/addApptype',
				payload: {
					name: appname
				}
			})
		} else{
            message.warning('请输入App名称')
		}
	}

	// 操作分页
    const handleChange = (param) => {
        dispatch({
    		type: 'appver/setParam',
    		payload: param
        })
        dispatch({
    		type: 'appver/getVerList',
    		payload: filterObj({ appTypeId, startTime, endTime, ...param })
    	})
    }

	// 筛选app类型
	const changeApptype = (val) => {
		dispatch({
			type: 'appver/setParam',
			payload: {
				appTypeId: val.appname
			}
		})
	}

	// 筛选ios操作
	const changeIostype = (val) => {
		dispatch({
			type: 'appver/setParam',
			payload: val
		}).then(() => {
            dispatch({ type: 'appver/getIos', payload: val })
		})
	}

	// 添加版本信息
	const handleSubmit = (e) => {
		e.preventDefault();
		validateFieldsAndScroll((err, values) => {
			if (!err) {
				values.appTypeId && (values.appTypeId = values.appTypeId - 0);
				values.forceUpdate && (values.forceUpdate = values.forceUpdate - 0);
				dispatch({
					type: 'appver/addVersion',
					payload: filterObj(values)
				}).then(() => {
					this.handleReset()
				})
			}
		});
	}

	// 表单取消
	const handleReset = () => {
		resetFields()
		dispatch({
			type: 'appver/setParam',
			payload: {
				modalShow: false,
				apkUrl: ''
			}
		})
	}

	// 上传文件回调
	const uploadSuccess = (url) => {
		dispatch({
			type: 'appver/setParam',
			payload: {
				apkUrl: url
			}
		})
		setFieldsValue({'apkUrl': url})
	}

	// 搜索版本信息
	const handleSearch = () => {
		let pageParam = {
			pageSize: 10,
			pageNum: 1
		}
		dispatch({
			type: 'appver/setParam',
			payload: pageParam
		})
		dispatch({
			type: 'appver/getVerList',
			payload: filterObj({
				pageNum: 1,
				pageSize: 10,
				appTypeId,
				startTime,
				endTime,
			})
		})
	}

	// 输入APP类型名称
	const handleInput = (e) => {
		dispatch({
			type: 'appver/setParam',
			payload: {
				appname: e.target.value
			}
		})
	}

	return (
		<div>
			<Tabs
				animated={false}
				activeKey={activeKey}
				onChange={handleTabChange}
            >
			   <TabPane tab="App类型" key="0">
					<FormInlineLayout>
						<Form layout="inline" style={{ marginLeft: 15 }}>
							<FormItem>
								<Input placeholder="输入App名称" onChange={(e) => handleInput(e)}/>
							</FormItem>

							<FormItem>
								<Button type="primary" onClick={handleAddapptype}>添加</Button>
							</FormItem>
						</Form>
					</FormInlineLayout>
				</TabPane>

				<TabPane tab="版本信息" key="1">
				    <FormInlineLayout>
						{/*时间*/}
						<Form layout="inline">
							<FormItem label="时间" style={{ marginLeft: 15 }}>
								<RangePicker
									format="YYYY-MM-DD HH:mm"
									showTime={{
										hideDisabledOptions: true,
										defaultValue: [moment('00:00', 'HH:mm'), moment('11:59', 'HH:mm')],
									}}
									onChange={datepickerChange}
									/>
							</FormItem>

							{/*App类型*/}
							<FormItem label="App类型">
								<Select
									showSearch
									placeholder="请选择App类型"
									onFocus={() => dispatch({type: 'appver/getAppList'})}
									onChange={v => changeApptype({appname: v})}
									>
									{
										[{id: '', name: '全部'}, ...appList].map(item =>
											<Option key={item.id} value={item.id}>{item.name}</Option>
										)
									}
								</Select>
							</FormItem>

							<FormItem>
								<Button type="primary" icon="search" onClick={handleSearch}>搜索</Button>
							</FormItem>

							<FormItem>
								<Button type="primary" onClick={() => changeModalState('modalShow', true)}>添加版本</Button>
							</FormItem>

						</Form>
					</FormInlineLayout>

					<Modal
						title="新增版本"
						visible={modalShow}
						onCancel= { () => changeModalState('modalShow', false) }
						okText="确认"
						cancelText="取消"
						footer={null}
						>
						<Form>
							{/*App类型*/}
							<FormItem
							    label="App类型"
								{...formItemLayout}
								>
								{getFieldDecorator('appTypeId', {
									rules: [{ required: true, message: '请选择App类型!' }],
								})(
									<Select showSearch>
									{
										appList.map(item =>
											<Option key={item.id} value={item.id}>{item.name}</Option>
										)
									}
									</Select>
								)}
							</FormItem>

							<FormItem
								label="版本名称"
								{...formItemLayout}
								>
								{getFieldDecorator('versionName', {
									rules: [{ required: true, message: '请输入版本名!', whitespace: false }],
								})(
									<Input placeholder="请输入版本名"/>
								)}
							</FormItem>

							<FormItem
								label="apk上传"
								help={ appver.apkUrl ? 'apk包上传成功' : '请上传apk包' }
								{...formItemLayout}
								>
								{getFieldDecorator('apkUrl', {
									rules: [{ required: true, message: '请上传apk包!' }],
								})(
									<MyUpload uploadSuccess={uploadSuccess} uploadTxt={'上传apk包'}></MyUpload>
								)}
							</FormItem>

							<FormItem
								label="强制更新"
								{...formItemLayout}
								>
								{getFieldDecorator('forceUpdate', {
									initialValue: 1,
									rules: [{ required: true, message: '请选择是否强制更新!' }],
								})(
									<RadioGroup>
										<Radio value={1}>不需要</Radio>
										<Radio value={2}>需要</Radio>
									</RadioGroup>
								)}
							</FormItem>

							<FormItem
								label="版本描述"
								{...formItemLayout}
								>
								{getFieldDecorator('updateDescribe', {
									rules: [{ message: '输入版本描述' }],
								})(
									<TextArea placeholder="版本描述格式： 1 描述内容# 2 描述内容# 3 描述内容" autosize={{ minRows: 3, maxRows: 6 }} />
								)}
							</FormItem>

							<FormItem
								{...formItemLayout}>
								<Button type="primary" onClick={handleSubmit} style={{ marginLeft: 75 }}>提交</Button>
								<Button onClick={handleReset} style={{ marginLeft: 15 }}>取消</Button>
							</FormItem>
						</Form>
					</Modal>
				</TabPane>

				<TabPane tab="IOS审核" key="2">
					<FormInlineLayout>
						<Form layout="inline" style={{ marginLeft: 15 }}>
							<FormItem label="状态">
							    {/* <Select
									showSearch
									value={appver.ios}
                                    onChange={v => changeIostype({ ios: v })}
                                    >
                                    <Option key="" value="">查询结果</Option>
									<Option key="1" value="1">提交审核</Option>
									<Option key="2" value="2">正式使用</Option>
                                </Select> */}

								<RadioGroup value={appver.ios ? appver.ios + '' : '2'} onChange={e => changeIostype({ ios: e.target.value - 0 })}>
									<Radio value="1">提交审核</Radio>
									<Radio value="2">正式使用</Radio>
								</RadioGroup>
							</FormItem>
						</Form>
					</FormInlineLayout>
				</TabPane>
			</Tabs>
            {
				activeKey === '2' ? null :
				<TableLayout
					loading={ loading.effects['appver/getAppList'] || loading.effects['appver/getIos'] || loading.effects['appver/getVerList']  }
					dataSource={dataSource}
					allColumns={allColumns}
					pagination={false}
				/>
			}
            {
				activeKey === '1' &&
				<PaginationLayout
					total={totalCount}
					onChange={(page, pageSize) => handleChange({
						pageNum: page,
						pageSize
					})}
					onShowSizeChange={(current, pageSize) => handleChange({
						pageNum: 1,
						pageSize
					})}
					current={pageNum}
					pageSize={pageSize} />
			}
		</div>
	)
};

AppverUpdate.propTypes = {
	appver: PropTypes.object,
};

export default connect(({ appver, loading }) => ({ appver, loading }))(Form.create()(AppverUpdate));
