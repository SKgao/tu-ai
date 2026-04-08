import PropTypes from 'prop-types';
import FormInlineLayout from '@/components/FormInlineLayout';
import TableLayout from '@/components/TableLayout';
import PaginationLayout from '@/components/PaginationLayout';
import TablePopoverLayout from '@/components/TablePopoverLayout';
import VaildForm from './VaildForm';
import { filterObj } from '@/utils/tools';

import { connect } from 'dva';
import { Button, Popconfirm, Modal, Badge, Input } from 'antd';
import { Form } from '@ant-design/compatible';
const FormItem = Form.Item;

const Authmenu = ({
	authmenu,
	loading,
    ...props
}) => {
    let { dispatch } = props;
    let { tableData, modalShow, menuName, pageNum, pageSize, totalCount } = authmenu;
    const columns = [
		{
        	title: '菜单id',
        	dataIndex: 'id',
        	sorter: true
        }, {
        	title: '父级id',
        	dataIndex: 'parentId',
			sorter: true,
			render: (text, record) =>
				<TablePopoverLayout
				title={'修改菜单名称'}
				valueData={text || '0'}
				defaultValue={text || '0'}
				onOk={v =>
					dispatch({
						type: 'authmenu/updateMenu',
						payload: {
							id: record.id,
							parentId: v - 0
						}
					})
				}/>
        }, {
        	title: '菜单排序id',
        	dataIndex: 'sortValue',
			sorter: true,
			render: (text, record) =>
				<TablePopoverLayout
				title={'修改菜单排序'}
				valueData={text || '0'}
				defaultValue={text || '0'}
				onOk={v =>
					dispatch({
						type: 'authmenu/updateMenu',
						payload: {
							id: record.id,
							sortValue: v - 0
						}
					})
				}/>
        }, {
        	title: '菜单作用',
        	dataIndex: 'menuScope',
			sorter: true,
			render: (text, record) =>
				<TablePopoverLayout
					title={'修改菜单作用'}
					valueData={[{
						id: 1,
						name: '左侧菜单'
					}, {
						id: 2,
						name: '按钮'
					}, {
						id: 3,
						name: '接口'
					}]}
					optionKey={'id'}
					optionItem={'name'}
					defaultValue={text || 0}
					onOk={v =>
						dispatch({
							type: 'authmenu/updateMenu',
							payload: {
								id: record.id,
								menuScope: v - 0
							}
						})
					}/>
        }, {
        	title: '菜单名称',
        	dataIndex: 'menuName',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改菜单名称'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'authmenu/updateMenu',
							payload: {
								id: record.id,
								menuName: v
							}
						})
					}/>
        }, {
        	title: '菜单路径',
        	dataIndex: 'path',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改菜单路径'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'authmenu/updateMenu',
							payload: {
								id: record.id,
								path: v
							}
						})
					}/>
        }, {
        	title: '菜单状态',
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
        	title: 'url',
        	dataIndex: 'url',
            render: (text, record) =>
				<TablePopoverLayout
					title={'修改url'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'authmenu/updateMenu',
							payload: {
								id: record.id,
								url: v
							}
						})
					}/>
        }, {
        	title: '图标',
			dataIndex: 'icon',
			render: (text, record) =>
				<TablePopoverLayout
					title={'修改icon'}
					valueData={text || '无'}
					defaultValue={text || '无'}
					onOk={v =>
						dispatch({
							type: 'authmenu/updateMenu',
							payload: {
								id: record.id,
								icon: v
							}
						})
					}/>
        }, {
            title: '创建时间',
            dataIndex: 'createdAt'
        }, {
        	title: '更新时间',
        	dataIndex: 'updatedAt'
        }, {
        	title: '操作',
            dataIndex: 'action',
            render: (txt, record, index) => {
                return <span>
                    <Popconfirm title="是否删除?" onConfirm={() => handleDelete(record)}>
                        <Button type="danger" size="small" style={{ marginLeft: 10 }}>删除</Button>
                    </Popconfirm>
                </span>
            }
        }
    ]

    /**
     * 删除菜单
     * @param  {object} 列数据
     */
    const handleDelete = (param) => {
        dispatch({
    		type: 'authmenu/deleteMenu',
    		payload: param.id
        })
    }

    // 添加菜单
    const submitForm = (menuinfo) => {
    	dispatch({
    		type: 'authmenu/addMenu',
    		payload: filterObj(menuinfo)
    	})
    }

    // 展示modal
    const changeModalState = (show) => {
        dispatch({
        	type: 'authmenu/setParam',
        	payload: {
				modalShow: show
			}
        })
    }

	// 输入框收入
	const handleInput = (e) => {
		dispatch({
        	type: 'authmenu/setParam',
        	payload: {
                menuName: e.target.value
            }
        })
	}

	// 操作分页
    const handleChange = (param) => {
        dispatch({
    		type: 'authmenu/setParam',
    		payload: param
        })
        dispatch({ type: 'authmenu/getMenu' })
    }

    // 搜索
    const handleSearch = () => {
		dispatch({
			type: 'authmenu/setParam',
			payload: {
				pageSize: 10,
				pageNum: 1
			}
		})
    	dispatch({ type: 'authmenu/getMenu' })
	}

	return (
		<div>
			<FormInlineLayout>
			    <Form layout="inline" style={{ marginLeft: 15 }}>
					{/*菜单名*/}
                    <FormItem label="菜单名">
                        <Input placeholder="输入菜单名" value={menuName} onChange={(e) => handleInput(e)}/>
                    </FormItem>

                    <FormItem>
                        <Button type="primary" icon="search" onClick={handleSearch}>搜索</Button>
                    </FormItem>

                    <FormItem>
                        <Button type="primary" onClick={() => changeModalState(true)}>添加菜单</Button>
                    </FormItem>

                </Form>
            </FormInlineLayout>

            <Modal
                title="新增菜单"
                visible={modalShow}
                onOk={ () => changeModalState(false) }
                onCancel= { () => changeModalState(false) }
                footer={null}
                >
                <VaildForm
					submitForm={submitForm}
					resetForm={() => changeModalState(false)}
					>
				</VaildForm>
            </Modal>

            <TableLayout
			    pagination={false}
                dataSource={tableData}
				allColumns={columns}
				loading={ loading.effects['authmenu/getMenu'] }
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

Authmenu.propTypes = {
    authmenu: PropTypes.object
};

export default connect(({ authmenu, loading }) => ({ authmenu, loading }))(Authmenu);