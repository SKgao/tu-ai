import PropTypes from 'prop-types';
import { Component } from 'react';
import { axios } from '@/configs/request';
import { Row, Col, Card, message } from 'antd';

/**
 * 上传文件进度
 */
class UploadProgress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            progressTxt: '暂无文件上传'
		}
    }

    // 定时刷新
    UNSAFE_componentWillMount() {
        let url = this.props.url
        this.timer = setInterval(() => {
            axios.get(url, null)
                .then((res) => {
                    const data = (res.data) ? res.data.data : '暂无文件上传'
                    if (res.data.code === 0) {
                        this.setState({ progressTxt: data })
                        ~data.indexOf('结束') && clearInterval(this.timer)
                    } else {
                        clearInterval(this.timer)
                        message.error(res.data.message)
                    }
                })
        }, 2 * 1000)
    }

    // 组件卸载清除定时器
    componentWillUnmount() {
        this.timer && clearTimeout(this.timer)
    }

    render() {
        return (
            <div style={{ padding: '5px 0' }}>
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title={this.props.cardTitle} style={{ textAlign: 'center' }} hoverable>
                            <div dangerouslySetInnerHTML={{__html: this.state.progressTxt}} />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

UploadProgress.propTypes = {
    cardTitle: PropTypes.string,     // 组件标题
    url: PropTypes.string.isRequired  // 上传进度接口地址
};

UploadProgress.defaultProps = {
    cardTitle: '文件上传进度'
};

export default UploadProgress;
