import { routerRedux } from 'dva/router';
import FormInlineLayout from '@/components/FormInlineLayout';
import TableLayout from '@/components/TableLayout';
import PaginationLayout from '@/components/PaginationLayout';
import TablePopoverLayout from '@/components/TablePopoverLayout';
import MyUpload from '@/components/UploadComponent';
import { filterObj } from '@/utils/tools';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formItemLayout } from '@/configs/layout';
import { Badge, Button, Input, Modal, Popconfirm } from 'antd';
import { Icon, Form } from '@ant-design/compatible';
const FormItem = Form.Item;

const CourseList = ({
    courseList,
    loading,
    ...props
}) => {
    let { dispatch, form } = props;
    let { tableList, pageNum, pageSize, totalCount, modalShow } = courseList;
    let { getFieldDecorator, resetFields, validateFieldsAndScroll } = form;

    const columns = [
        {
            title: '课程名称',
            dataIndex: 'name',
            render: (text, record) =>
                <TablePopoverLayout
                    title={'修改课程名称'}
                    valueData={text || '无'}
                    defaultValue={text || '无'}
                    onOk={v =>
                        dispatch({
                            type: 'courseList/updateCourse',
                            payload: {
                                id: record.id - 0,
                                name: v,
                                icon: record.icon,
                                sort: record.sort
                            }
                        })
                    }/>
        }, {
            title: '封面',
            dataIndex: 'icon',
            render: (text) => {
                return (text) ? <a href={ text } target='_blank' rel="nofollow noopener noreferrer">
                    <img alt="" src={ text } style={{ width: 50, height: 35 }}/>
                </a> : <span>无</span>
            }
        }, {
            title: '状态',
            dataIndex: 'status',
            render: (txt) => {
				switch (txt) {
					case 1:
						return <Badge status="processing" text="启用"/>;
					default:
                        return <Badge status="warning" text="禁用"/>;
				}
			}
        }, {
            title: '排序',
            dataIndex: 'sort',
            sorter: true,
            render: (text, record) =>
                <TablePopoverLayout
                    title={'修改排序'}
                    valueData={text && '无'}
                    defaultValue={text || '无'}
                    onOk={v =>
                        dispatch({
                            type: 'courseList/updateCourse',
                            payload: {
                                id: record.id - 0,
                                name: record.name,
                                icon: record.icon,
                                sort: v - 0
                            }
                        })
                    }/>
        }, {
            title: '创建时间',
            dataIndex: 'createdAt'
        }, {
            title: '上传封面',
            dataIndex: 'updateicon',
            render: (txt, record, index) => {
                return <MyUpload uploadTxt={'上传封面'} uploadSuccess={(url) => {
                    changeIcon(url, record)
                }}></MyUpload>
            }
        }, {
            title: '详情',
            dataIndex: 'link',
            render: (txt, record, index) => {
                return <span>
                    <a onClick={() => linktoUnit(record)} style={{ marginLeft: 10 }}>查看单元</a>
                    <a onClick={() => linktoSession(record)} style={{ marginLeft: 10 }}>查看大关卡</a>
                    <a onClick={() => linktoCustomPass(record)} style={{ marginLeft: 10 }}>查看小关卡</a>
                </span>
            }
        }, {
        	title: '操作',
            dataIndex: 'action',
            render: (txt, row, index) => {
                return <span>
                    <Button
                        type={row.status === 1 ? 'danger' : 'primary'}
                        size="small" style={{ marginLeft: 5 }}
                        onClick={() => handleChangeStatus(row)}>
                        {row.status === 1 ? '禁用' : '启用'}
                    </Button>
                    <Popconfirm title="是否删除?" onConfirm={() => handleDelete(row)}>
                        <Button type="danger" size="small" style={{ marginLeft: 5 }}>删除</Button>
                    </Popconfirm>
                    <Button type="primary" size="small" onClick={() => linktoActivity(row)} style={{ marginLeft: 10 }}>查看活动</Button>
                </span>
            }
        }
    ]

    // 跳转到单元页面
    const linktoUnit = (record) => {
        dispatch(routerRedux.push({
            pathname: '/teachingManage/unit',
            search: `textBookId=${record.id}`
        }));
    }

    // 跳转到大关卡
    const linktoSession = (record) => {
        dispatch(routerRedux.push({
            pathname: '/teachingManage/session',
            search: `textbookId=${record.id}`
        }));
    }

    // 调转到小关卡
    const linktoCustomPass = (record) => {
        dispatch(routerRedux.push({
            pathname: '/teachingManage/customPass',
            search: `textbookId=${record.id}`
        }))
    }

    // 调转到课程页面
    const linktoActivity = (record) => {
        dispatch(routerRedux.push({
            pathname: '/courseBag/activity',
            search: `id=${record.id}`
        }))
    }

    // 改变状态
    const handleChangeStatus = (row) => {
        dispatch({
            type: 'courseList/changeStatus',
            payload: {
                id: row.id - 0,
                status: row.status === 1 ? 2 : 1
            }
        })
    }

    // 删除
    const handleDelete = (row) => {
        dispatch({
            type: 'courseList/delCourse',
            payload: {
                id: row.id - 0
            }
        })
    }

    // 修改封面
    const changeIcon = (url, record) => {
        dispatch({
    		type: 'courseList/updateCourse',
    		payload: {
                id: record.id - 0,
                name: record.name,
                sort: record.sort,
                icon: url
            }
    	})
    }

    // 操作分页
    const handleChange = (param) => {
        dispatch({
    		type: 'courseList/setParam',
    		payload: param
        })
        dispatch({ type: 'courseList/getBagList' })
    }

    // 展示modal
    const changeModalState = (flag, show) => {
        dispatch({
        	type: 'courseList/setParam',
        	payload: {
                [flag]: show
            }
        })
    }

    // 返回
    const goBack = () => dispatch(routerRedux.goBack(-1))

    // 添加课程包
	const handleSubmit = (e) => {
		e.preventDefault()
		validateFieldsAndScroll((err, values) => {
			if (!err) {
                const { id, icon } = courseList
                values.bagId = id - 0
                values.icon = icon
                delete values.title
                dispatch({
                    type: 'courseList/addCourse',
                    payload: filterObj(values)
                }).then(() => {
                    handleReset()
                })
			}
		});
    }

    // 表单取消
    const handleReset  = () => {
        resetFields()
        dispatch({
    		type: 'courseList/setParam',
    		payload: {
                modalShow: false
    		}
    	})
    }

    // 文件上传成功
    const uploadSuccess = (url, filed) => {
        dispatch({
    		type: 'courseList/setParam',
    		payload: {
    			[filed]: url
    		}
        })
    }

	return (
		<div>
			<FormInlineLayout>
			    <Form layout="inline" style={{ marginLeft: 15 }}>

                    <FormItem>
                        <Button type="primary" onClick={() => changeModalState('modalShow', true)}>添加课程</Button>
                    </FormItem>

                    <FormItem>
                        <a className={'link-back'} onClick={goBack}><Icon type="arrow-left"/>后退</a>
                    </FormItem>

                </Form>
            </FormInlineLayout>

            <Modal
                title="新增课程"
                visible={modalShow}
                onCancel= { () => changeModalState('modalShow', false) }
                okText="确认"
                cancelText="取消"
                footer={null}
                >
                <Form>
                    <FormItem
                        label="课程包名称"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('title', {
                            initialValue: courseList.title,
                            rules: [{ required: true, message: '请输入课程包id!' }],
                        })(
                            <Input disabled/>
                        )}
                    </FormItem>

                    <FormItem
                        label="课程名称"
                        {...formItemLayout}
                        >
                        {getFieldDecorator('name', {
                            rules: [{ required: true, message: '请输入课程名称!' }],
                        })(
                            <Input placeholder="请输入课程名称"/>
                        )}
                    </FormItem>

                    <FormItem
                        label="图标"
                        {...formItemLayout}
                        >
                        <MyUpload uploadSuccess={url => uploadSuccess(url, 'icon')}></MyUpload>
                    </FormItem>

                    <FormItem
                        {...formItemLayout}>
                        <Button type="primary" onClick={handleSubmit} style={{ marginLeft: 75 }}>提交</Button>
                        <Button onClick={handleReset} style={{ marginLeft: 15 }}>取消</Button>
                    </FormItem>
                </Form>
            </Modal>

            <TableLayout
                pagination={false}
                dataSource={tableList}
                allColumns={columns}
                loading={ loading.effects['courseList/getCourseList'] }
                scrollX={true}
                />
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
		</div>
	)
};

CourseList.propTypes = {
    courseList: PropTypes.object
};

export default connect(({ courseList, loading }) => ({ courseList, loading }))(Form.create()(CourseList));
