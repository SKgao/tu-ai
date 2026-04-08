import { routerRedux } from 'dva/router';
import TableLayout from '@/components/TableLayout';
import FormInlineLayout from '@/components/FormInlineLayout';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Pagination } from 'antd';
import { Icon, Form } from '@ant-design/compatible';
const FormItem = Form.Item;

const InviteCount = ({
    inviteCount,
    loading,
    ...props
}) => {
    let { dispatch } = props;
    let { inviteList, pageNum, pageSize, totalCount } = inviteCount;

    const allColumns = [
        {
            title: '图图号',
            dataIndex: 'tutuNumber',
            sorter: true
        }, {
            title: '用户昵称',
            dataIndex: 'realName',
            render: (text) => <span>{ text ? text :  '无' }</span>
        }, {
            title: '用户头像',
            dataIndex: 'icon',
            render: (text) => {
                return (text) ? <a href={ text } target='_blank' rel="nofollow noopener noreferrer">
                    <img alt="" src={ text } style={{ width: 50, height: 35 }}/>
                </a> : <span>无</span>
            }
        }, {
            title: '手机号',
            dataIndex: 'mobile',
            render: (text) => <span>{ text ? text :  '无' }</span>
        }, {
            title: '邀请时间',
            dataIndex: 'inviteTime'
        }
    ]

    // 操作分页
    const handleChange = (param) => {
        dispatch({
            type: 'inviteCount/setParam',
            payload: param
        }).then(() => {
            dispatch({ type: 'inviteCount/getInvite' })
        })
    }

    // 返回
    const goBack = () => dispatch(routerRedux.goBack(-1))

	return (
		<div>
            <FormInlineLayout>
			    <Form layout="inline" style={{ marginLeft: 15 }}>
                    <FormItem>
                        <a className={'link-back'} onClick={goBack}><Icon type="arrow-left"/>后退</a>
                    </FormItem>
                </Form>
            </FormInlineLayout>

            <TableLayout
                pagination={false}
                dataSource={inviteList}
                allColumns={allColumns}
                loading={ loading.effects['inviteCount/getInvite'] }
                scrollX={true}
                />

            <div className="main-pagination">
                {
                    totalCount > 0 ? <div className="pagination-info">总人数 <span className="mr10">{totalCount}</span> 第 <span>{pageNum}</span> / {Math.ceil(totalCount/pageSize)} 页</div> : null
                }
                <Pagination
                    showSizeChanger
                    showQuickJumper
                    hideOnSinglePage
                    pageSizeOptions={['10', '20', '50', '100']}
                    onChange={(page, pageSize) => handleChange({
                        pageNum: page,
                        pageSize
                    })}
                    onShowSizeChange={(current, pageSize) => handleChange({
                        pageNum: 1,
                        pageSize
                    })}
                    total={totalCount}
                    current={pageNum}
                    pageSize={pageSize} />
            </div>

		</div>
	)
};

InviteCount.propTypes = {
  inviteCount: PropTypes.object
};

export default connect(({ inviteCount, loading }) => ({ inviteCount, loading }))(Form.create()(InviteCount));
