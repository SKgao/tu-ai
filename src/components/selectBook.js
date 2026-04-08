import PropTypes from 'prop-types';
import { Component } from 'react';
import { axios } from '@/configs/request';
import { Button, Upload, Select, message } from 'antd';
import { Icon } from '@ant-design/compatible';

const Option = Select.Option;
/**
 * 上传文件组件
 */
class SelectBook extends Component {
    constructor(props) {
        super(props);
        this.state={
          children:[]
        }
    }
    componentWillMount(){
      axios.get('book/version/list', null)
          .then((res) => {
              if (res.data.code === 0) {
                let data=res.data.data
                let childrenData=[];
                console.log(data);
                  for(let i=0;i<data.length;i++){
                    childrenData.push(<Option key={data[i].id} value={data[i].id}>{data[i].name}</Option>);
                  }
                  this.setState({
                     children:childrenData
                  })
              } else {
                  message.error(res.data.message)
              }
          })
          .catch((err) => {

          });
    }

    handleChange = (value) => {
       let {selectVule} = this.props;
       selectVule&&selectVule(value)
    }
    render() {

        return (
          <Select style={{ width: 120 }} onChange={this.handleChange} placeholder="请选择教材">
             {this.state.children}
           </Select>
        );
    }
}

SelectBook.propTypes = {
    selectVule: PropTypes.func
};
export default SelectBook;
