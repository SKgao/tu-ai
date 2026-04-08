import PropTypes from 'prop-types';
import { routerRedux } from 'dva/router';
import FormInlineLayout from '@/components/FormInlineLayout';
import TableLayout from '@/components/TableLayout';
import PaginationLayout from '@/components/PaginationLayout';
import TablePopoverLayout from '@/components/TablePopoverLayout';
import MyUpload from '@/components/UploadComponent';
import { filterObj } from '@/utils/tools';

import { connect } from 'dva';
import { formItemLayout } from '@/configs/layout';
import { Input, Button, Badge, Modal, Popconfirm } from 'antd';
import { Form } from '@ant-design/compatible';
const FormItem = Form.Item;

const CourseBag = ({
    courseBag,
    loading,
    ...props
}) => {
    let { dispatch, form } = props;
    let { bagList, pageNum, pageSize, totalCount, modalShow, icon } = courseBag;
    let { getFieldDecorator, resetFields, validateFieldsAndScroll } = form;

    const columns = [
        {
            title: '课程包标题',
            dataIndex: 'title',
            render: (text, record) =>
                <TablePopoverLayout
                    title={'修改标题'}
                    valueData={text || '无'}
                    defaultValue={text || '无'}
                    onOk={v =>
                        dispatch({
                            type: 'courseBag/updateBag',
                            payload: {
                                id: record.id - 0,
                                title: v,
                                icon: record.icon,
                                sort: record.sort
                            }
                        })
                    }/>
        }, {
            title: '图标',
            dataIndex: 'icon',
            render: (text) => {
                return (text) ? <a href={ text } target='_blank' rel="nofollow noopener noreferrer">
                    <img alt="" src={ text } style={{ width: 50, height: 35 }}/>
                </a> : <span>无</span>
            }
        }, {
            title: '状态',
            dataIndex: 'status',
            sorter: true,
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
                            type: 'courseBag/updateBag',
                            payload: {
                                id: record.id - 0,
                                title: record.title,
                                icon: record.icon,
                                sort: v - 0
                            }
                        })
                    }/>
        }, {
            title: '上传图标',
            dataIndex: 'updateicon',
            render: (txt, record, index) => {
                return <MyUpload uploadTxt={'上传图标'} uploadSuccess={(url) => {
                    changeIcon(url, record)
                }}></MyUpload>
            }
        },
        {
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
                    <Button type="primary" size="small" onClick={() => linktoCourse(row)} style={{ marginLeft: 10 }}>查看精品课程</Button>
                </span>
            }
        }
    ]

    // 调转到页面
    const linktoCourse = (record) => {
        dispatch(routerRedux.push({
            pathname: '/courseBag/course',
            search: `id=${record.id}&title=${record.title}`
        }))
    }

    // 操作分页
    const handleChange = (param) => {
        dispatch({
    		type: 'courseBag/setParam',
    		payload: param
        })
        dispatch({ type: 'courseBag/getBagList' })
    }

    // 改变状态
    const handleChangeStatus = (row) => {
        dispatch({
            type: 'courseBag/changeStatus',
            payload: {
                id: row.id - 0,
                status: row.status === 1 ? 2 : 1
            }
        })
    }

    // 展示modal
    const changeModalState = (flag, show) => {
        dispatch({
        	type: 'courseBag/setParam',
        	payload: {
                [flag]: show
            }
        })
    }

    // 删除
    const handleDelete = (row) => {
        dispatch({
            type: 'courseBag/deleteBag',
            payload: {
                id: row.id - 0
            }
        })
    }

    // 修改图标
    const changeIcon = (url, record) => {
        dispatch({
    		type: 'courseBag/updateBag',
    		payload: {
                id: record.id - 0,
                title: record.title,
                sort: record.sort,
                icon: url
            }
    	})
    }

    // 添加课程包
	const handleSubmit = (e) => {
		e.preventDefault()
		validateFieldsAndScroll((err, values) => {
			if (!err) {
                values.icon = icon
                dispatch({
                    type: 'courseBag/addBag',
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
    		type: 'courseBag/setParam',
    		payload: {
                modalShow: false
    		}
    	})
    }

    // 文件上传成功
    const uploadSuccess = (url, filed) => {
        dispatch({
    		type: 'courseBag/setParam',
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
                        <Button type="primary" onClick={() => changeModalState('modalShow', true)}>添加课程包</Button>
                    </FormItem>

                </Form>
            </FormInlineLayout>

            <Modal
                title="新增课程包"
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
                            rules: [{ required: true, message: '请输入课程包名称!' }],
                        })(
                            <Input placeholder="请输入课程包名称"/>
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
                dataSource={bagList}
                allColumns={columns}
                loading={ loading.effects['courseBag/getBagList'] }
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

CourseBag.propTypes = {
    courseBag: PropTypes.object
};

export default connect(({ courseBag, loading }) => ({ courseBag, loading }))(Form.create()(CourseBag));
