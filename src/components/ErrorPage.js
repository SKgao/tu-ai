
import { Component } from 'react';
import { Card } from 'antd';
import { Icon } from '@ant-design/compatible';
/**
 * 异常页面
 */
class ErrorPage extends Component {
    render() {
        return (
            <div>
                <Card title="404 Not Found...">
                    <Icon type="frown-o"/>   页面找不到了~
                </Card>
            </div>
        );
    }
}

export default ErrorPage;