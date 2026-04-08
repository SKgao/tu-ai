import FormInlineLayout from '@/components/FormInlineLayout';
import TableLayout from '@/components/TableLayout';
import PaginationLayout from '@/components/PaginationLayout';
import TablePopoverLayout from '@/components/TablePopoverLayout';
import UploadProgress from '@/components/UploadProgress';
import VaildForm from './VaildForm';
import MyUpload from '@/components/UploadComponent';
import moment from 'moment';
import { filterObj } from '@/utils/tools';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formItemLayout } from '@/configs/layout';
import { isPro } from '@/configs/request';
import { Button, Checkbox, DatePicker, Input, Modal, Popconfirm, Select, Tabs, Upload } from 'antd';
import { Icon, Form } from '@ant-design/compatible';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;
const Option = Select.Option;

const sourceMaterial = ({
    sourcematerial,
    loading,
    ...props
}) => {
    let { dispatch, form } = props;
    let { materialList, modalShow, modal2Show, modal3Show, modal4Show, startTime, endTime, text, pageNum, pageSize, activeKey, audioArray, imageArray, sentensArray, openLike, explainsArray } = sourcematerial;
    let { getFieldDecorator, resetFields } = form;

    const columns = [
        {
            title: '素材内容',
            dataIndex: 'text',
            sorter: true,
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改素材内容'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'sourcematerial/editSource',
							payload: {
								id: record.id - 0,
								text: v
							}
						})
					}/>
        }, {
            title: '素材图标',
            dataIndex: 'icon',
            render: (text) => {
                return (text) ? <Popconfirm cancelText="取消" okText="确定"
                        icon={<img alt="" src={ text } style={{ width: 110, height: 120 }}/>}>
                        <img alt="" src={ text } style={{ width: 30, height: 40 }}/>
                    </Popconfirm>: <span>无</span>
            }
        }, {
            title: '素材音频',
            dataIndex: 'audio',
            render: (audio) => {
                return (audio) ? <audio src={audio} controls="controls"></audio> : <span>无</span>
            }
        },
        // {
        //     title: '音标',
        //     dataIndex: 'phonetic',
        //     render: (text, record) =>
		// 		<TablePopoverLayout
		// 			title={'修改音标'}
		// 			valueData={text || '无'}
		// 			defaultValue={text || '无'}
		// 			onOk={v =>
		// 				dispatch({
		// 					type: 'sourcematerial/editSource',
		// 					payload: {
		// 						id: record.id - 0,
		// 						phonetic: v
		// 					}
		// 				})
		// 			}/>
        // },
        {
            title: '单次释义',
            dataIndex: 'translation',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改单次释义(在[]中输入)'}
					valueData={text || '[]'}
					defaultValue={text || '[]'}
					onOk={v =>
						dispatch({
							type: 'sourcematerial/editSource',
							payload: {
								id: record.id - 0,
								translation: v
							}
						})
					}/>
        }, {
            title: '多次释义',
            dataIndex: 'explainsArray',
            render: (text, record, index) => <span title={text} style={{ cursor: 'pointer' }} onClick={ () => {
                handleUpdateArr(record)
                handleSubmit('modal4Show', true)
           }
         }>{ renderExplainsArray(text) }</span>
        }, {
        	title: '修改音频',
        	dataIndex: 'updateAudio',
            render: (text, record, index) => {
                return <MyUpload uploadTxt={'选择音频'} uploadSuccess={(url) => {
                    changeSource(url, record, 'audio')
                }}></MyUpload>
            }
        }, {
            title: '创建时间',
            dataIndex: 'createdAt'
        },
        {
        	title: '修改图标',
        	dataIndex: 'updateImage',
            render: (text, record, index) => {
                return <MyUpload uploadTxt={'选择图片'} uploadSuccess={(url) => {
                    changeSource(url, record, 'icon')
                }}></MyUpload>
            }
        },
        {
          title: '操作',
            dataIndex: 'action',
            render: (txt, record, index) => {
                return <span>
                    {/* <Button size="small" style={{ marginLeft: 10 }} >修改多次释义</Button> */}
                    <Popconfirm title="是否删除?" onConfirm={() => handleDelete(record)}>
                        <Button type="danger" size="small" style={{ marginLeft: 10 }}>删除</Button>
                    </Popconfirm>
                </span>
            }
        }
    ]

    // 修改多次释义
    const handleUpdateArr = (record) => {
        dispatch({
            type: 'sourcematerial/setParam',
            payload: {
                arrId: record.id - 0,
                explainsArray: record.explainsArray
            }
        })
    }

    const handleExplainsArray = () => {
        dispatch({
            type: 'sourcematerial/editSource',
            payload: {
                id: sourcematerial.arrId,
                explainsArray: explainsArray
            }
        })
    }

    // 修改释义
    const changeArray = (event) => {
        dispatch({
            type: 'sourcematerial/setParam',
            payload: {
                explainsArray: event.target.value
            }
        })
    }

    // 修改用户头像
    const changeSource = (url, record, rowname) => {
        dispatch({
            type: 'sourcematerial/editSource',
            payload: {
                id: record.id - 0,
                [rowname]: url
            }
        })
    }

    // 渲染多释义   text.replace(/\[|\]|\"/g, '')
    const renderExplainsArray = (text) => {
        let str = text
        if (!str) {
            return '[]'
        } else if (str.length < 20) {
            return str
        } else {
            return str.substr(0, 20) + '...'
        }
    }

    /**
     * 删除教材
     * @param  {object} 列数据
     */
    const handleDelete = (param) => {
        dispatch({
          type: 'sourcematerial/deleteSource',
          payload: {
                id: param.id
            }
        })
    }

    // 搜索
    const handleSearch = () => {
        let pageParam = {
            pageSize: 10,
            pageNum: 1,
            sourceIds: [],
            selectedRowKeys: []
        }
        dispatch({
    		type: 'sourcematerial/setParam',
    		payload: pageParam
        })
        dispatch({
            type: 'sourcematerial/getSource',
            payload: filterObj({ startTime, endTime, text, openLike, ...pageParam })
        })
    }

    // 显示添加素材modal
    const handleSubmit=(flag, show)=>{
      dispatch({
        type: 'sourcematerial/setParam',
        payload: {
            [flag]: show
          }
      })
    }

    // 表单取消
    const handleReset  = (m) => {
        resetFields();
        dispatch({
            type: 'sourcematerial/setParam',
            payload: {
                [m]: false,
                audioArray: [],
                imageArray: [],
                sentensArray: []
            }
        })
    }

    // 改版教材id
    const changeTextBookId = (param) => {
        dispatch({
    		type: 'sourcematerial/setParam',
    		payload: param
        })
    }

    // 操作分页
    const handleChange = (param) => {
        dispatch({
    		type: 'sourcematerial/setParam',
    		payload: {
                ...param,
                sourceIds: [],
                selectedRowKeys: []
            }
        })
        dispatch({
    		type: 'sourcematerial/getSource',
    		payload: filterObj({ startTime, endTime, openLike, text, ...param })
    	})
    }

    // 选择时间框
    const datepickerChange = (d, t) => {
        dispatch({
          type: 'sourcematerial/setParam',
          payload: {
                startTime: t[0] ? t[0] + ':00' : '',
                endTime: t[1] ? t[1] + ':00' : ''
            }
        })
    }

    // 搜索素材内容
    const changeText = (event) => {
        dispatch({
            type: 'sourcematerial/setParam',
            payload: {
                text: event.target.value
            }
        })
    }

    // 上传音频、图片目录
    const uploadFileArray = (file, fileList, array) => {
        const MAX_LEN = 500
        fileList.length < MAX_LEN  && dispatch({
            type: 'sourcematerial/setParam',
            payload: {
                [array]: fileList.map(e => e.name)
            }
        })
        return false;
    }

    // 导入资源(音频集合、图片集合)
    const handleSubmitSource = () => {
        dispatch({
            type: 'sourcematerial/addSubjectSource',
            payload: {
                textbookId: sourcematerial.textbookId,
                audioArray: audioArray.filter(e => e.slice(0, 1) !== '.' && e.slice(-4) === '.mp3'),
                imageArray: imageArray.filter(e => e.slice(0, 1) !== '.' && e.slice(-4) === '.png'),
                sentensArray: sentensArray.filter(e => e.slice(0, 1) !== '.')
            }
        })
    }

    // 切换tabs标签页
    const handleTabChange = (key = '0') => {
        if (key === '0') {
            dispatch({
                type: 'sourcematerial/setParam',
                payload: {
                    startTime: '',
                    endTime: '',
                    pageNum: 1,
                    pageSize: 10,
                    text: '',
                    openLike: ''
                }
            })
            dispatch({
                type: 'sourcematerial/getSource',
                payload: { pageNum, pageSize, startTime, endTime, text, openLike }
            })
        }
    	dispatch({
    		type: 'sourcematerial/setParam',
    		payload: {
				activeKey: key
			}
    	})
    }

    // table选中
    const tableRowSelectd = (selectedRowKeys, selectedRows) => {
        let sourceIds = selectedRows.map(e => e.id)
        dispatch({
    		type: 'sourcematerial/setParam',
    		payload: {
                selectedRowKeys,
				sourceIds
			}
    	})
    }

    // 批量删除素材
    const handleBatchDelete = () => {
        dispatch({
    		type: 'sourcematerial/batchDeleteSource',
    		payload: sourcematerial.sourceIds
    	})
    }

    // 批量下载音频素材
    const handleBatchDownload = () => {
        dispatch({
    		type: 'sourcematerial/batchDownloadSource',
    		payload: sourcematerial.sourceIds
    	})
    }

    // 批量同步素材
    const handleBatchSend = () => {
        dispatch({
    		type: 'sourcematerial/batchSendSource',
    		payload: sourcematerial.sourceIds
    	})
    }

    // 是否开启模糊搜索
    const handleOpenlike = (e) => {
        dispatch({
    		type: 'sourcematerial/setParam',
    		payload: {
                openLike: e.target.checked ? '' : 1
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
        <TabPane tab="素材列表" key="0">
            <FormInlineLayout>
                <Form layout="inline" style={{ marginLeft: 15 }}>
                    {/*时间*/}
                    <FormItem label="时间">
                        <RangePicker
                            format="YYYY-MM-DD HH:mm"
                            showTime={{
                                hideDisabledOptions: true,
                                defaultValue: [moment('00:00', 'HH:mm'), moment('11:59', 'HH:mm')],
                            }}
                            onChange={datepickerChange}
                            />
                    </FormItem>
                    {/*素材内容*/}
                    <FormItem label="素材内容">
                            {/*{getFieldDecorator('text')(<Input placeholder="请输入素材内容" onChange={ changeText(text)}/>)} {...getFieldProps('text', {})}*/}
                            <Input placeholder="请输入素材内容" onChange={ changeText}/>
                    </FormItem>

                    <FormItem>
                        <Checkbox onChange={handleOpenlike} checked={openLike ? false : true}>模糊搜索</Checkbox>
                        <Button type="primary" icon="search" onClick={handleSearch}>搜索</Button>
                    </FormItem>

                    <FormItem>
                        <Button type="primary" onClick={() => handleSubmit('modalShow', true)}>添加素材</Button>
                    </FormItem>

                    <FormItem>
                        <Button type="primary" onClick={() => handleSubmit('modal3Show', true)}>导入素材</Button>
                    </FormItem>

                    <FormItem>
                        <Popconfirm title="是否删除选中素材?" onConfirm={handleBatchDelete}>
                            <Button type="danger" icon="delete" disabled={!sourcematerial.sourceIds.length}>批量删除</Button>
                        </Popconfirm>
                    </FormItem>

                    <FormItem>
                        <Popconfirm title="是否删下载选中素材音频?" onConfirm={handleBatchDownload}>
                            <Button
                                type="primary"
                                icon="download"
                                loading={ loading.effects['sourcematerial/batchDownloadSource'] }
                                disabled={!sourcematerial.sourceIds.length}>
                                批量下载音频
                            </Button>
                        </Popconfirm>
                    </FormItem>

                    {
                        isPro ? null : <FormItem>
                            <Popconfirm title="是否同步选中素材?" onConfirm={handleBatchSend}>
                                <Button
                                    type="primary"
                                    icon="reload"
                                    loading={ loading.effects['sourcematerial/batchSendSource'] }
                                    disabled={!sourcematerial.sourceIds.length}>
                                    批量同步
                                </Button>
                            </Popconfirm>
                        </FormItem>
                    }

                </Form>
            </FormInlineLayout>

            <Modal
                title="修改多次释义"
                visible={modal4Show}
                onCancel= { () => handleSubmit('modal4Show', false) }
                okText="确认"
                cancelText="取消"
                footer={null}
                >
                <Form>
                    <FormItem
                        {...formItemLayout}>
                        <TextArea rows={4} value={explainsArray} placeholder="修改释义" onChange={ changeArray }></TextArea>
                    </FormItem>

                    <FormItem
                        {...formItemLayout}>
                        <Button type="primary" onClick={
                            () => {
                                handleSubmit('modal4Show', false)
                                handleExplainsArray()
                            }
                        } style={{ marginLeft: 5 }}>提交</Button>
                    </FormItem>
                </Form>
            </Modal>

            <Modal
                title="新增素材"
                visible={modalShow}
                onCancel= { () => handleSubmit('modalShow',false) }
                okText="确认"
                cancelText="取消"
                footer={null}
                maskClosable={false}
                >
                    <VaildForm></VaildForm>
                </Modal>
                <Modal
                    title="修改素材"
                    visible={modal2Show}
                    onCancel= { () => handleSubmit('modal2Show',false) }
                    okText="确认"
                    cancelText="取消"
                    footer={null}
                    sourcematerial={sourcematerial}
                    maskClosable={false}
                >
                {/* <EditForm></EditForm> */}
                </Modal>

                <Modal
                    title="导入素材"
                    visible={modal3Show}
                    onOk={ () => handleSubmit('modal3Show', false) }
                    onCancel= { () => handleSubmit('modal3Show', false) }
                    okText="确认"
                    cancelText="取消"
                    footer={null}
                    >
                    <Form>
                        <FormItem
                            label="教材"
                            hasFeedback
                            {...formItemLayout}
                            >
                            {getFieldDecorator('textbookId', {
                                initialValue: sourcematerial.textbookId,
                                rules: [{ required: true, message: '请选择教材!' }],
                            })(
                                <Select
                                    showSearch
                                    placeholder="请选择教材"
                                    onChange={v => changeTextBookId({ textbookId: v })}
                                    onFocus={() => dispatch({type: 'sourcematerial/getBook'})}
                                    >
                                    {
                                        sourcematerial.bookList.map(item =>
                                            <Option key={item.id} value={item.id}>{item.name}</Option>
                                        )
                                    }
                                </Select>
                            )}
                        </FormItem>

                        <FormItem
                            label="单词音频目录"
                            help={ audioArray.length ? `已选择${audioArray.length}个音频文件` : '请选择音频文件，不能超过500个' }
                            {...formItemLayout}
                            >
                            {getFieldDecorator('audioArray', {
                                // rules: [{ message: '请上传音频素材!' }],
                            })(
                                <Upload beforeUpload={(a, b) => uploadFileArray(a, b, 'audioArray')} directory multiple showUploadList={false}>
                                    <Button>
                                        <Icon type="upload"/>上传音频
                                    </Button>
                                </Upload>
                            )}
                        </FormItem>

                        <FormItem
                            label="图片文件目录"
                            help={imageArray.length ? `已选择${imageArray.length}个图片文件` : '请选择图片文件，不能超过500个'}
                            {...formItemLayout}
                            >
                            {getFieldDecorator('imageArray', {
                            // rules: [{ message: '请上传图片素材!' }],
                            })(
                                <Upload beforeUpload={(a, b) => uploadFileArray(a, b, 'imageArray')} directory multiple showUploadList={false}>
                                    <Button>
                                        <Icon type="upload"/>上传图片
                                    </Button>
                                </Upload>
                            )}
                        </FormItem>

                        <FormItem
                            label="句子音频目录"
                            help={sentensArray.length ? `已选择${sentensArray.length}个句子文件` : '请选择句子文件，不能超过500个'}
                            {...formItemLayout}
                            >
                            {getFieldDecorator('sentensArray', {
                            // rules: [{ message: '请上传图片素材!' }],
                            })(
                                <Upload beforeUpload={(a, b) => uploadFileArray(a, b, 'sentensArray')} directory multiple showUploadList={false}>
                                    <Button>
                                        <Icon type="upload"/>上传句子文件
                                    </Button>
                                </Upload>
                            )}
                        </FormItem>

                        <FormItem
                            {...formItemLayout}>
                            <Button type="primary" onClick={handleSubmitSource} style={{ marginLeft: 45 }}>提交</Button>
                            <Button onClick={() => {handleReset('modal3Show')}} style={{ marginLeft: 15 }}>取消</Button>
                        </FormItem>
                    </Form>
                </Modal>
            <TableLayout
                //expandedRowRender={ record => <span>{ record.explainsArray }</span> }
                rowSelection={{
                    fixed: true,
                    type: 'checkbox',
                    onChange: tableRowSelectd,
                    selectedRowKeys: sourcematerial.selectedRowKeys
                }}
                pagination={false}
                dataSource={materialList}
                allColumns={columns}
                loading={ loading.effects['sourcematerial/getSource'] }
                scrollX={true}
                />
            <PaginationLayout
                total={sourcematerial.totalCount}
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
            </TabPane>

            {
                (activeKey === '0') ? null :
                <TabPane tab="上传进度" key="1">
                    <UploadProgress
                        cardTitle={'素材上传进度'}
                        url={'subject/source/import/progress'}
                    >
                    </UploadProgress>
                </TabPane>
            }
        </Tabs>
    </div>
  )
};

sourceMaterial.propTypes = {
    sourcematerial: PropTypes.object
};

export default connect(({ sourcematerial, loading }) => ({ sourcematerial, loading }))(Form.create()(sourceMaterial));
