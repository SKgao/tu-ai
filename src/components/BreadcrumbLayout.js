import { Link } from 'dva/router';
import { Breadcrumb } from 'antd';

const BreadcrumbLayout = ({
	data,
	path
}) => {
	const pathArr = path.split('/').slice(1,-1);
	return (
		<Breadcrumb className="main-breadcrumb" separator=">">
		    <Breadcrumb.Item>{data.name1}</Breadcrumb.Item>
		    {
		    	pathArr[1] && pathArr.length > 1 && <Breadcrumb.Item><Link to={`/${pathArr.slice(0,2).join('/')}`}>{data.name2}</Link></Breadcrumb.Item>
		    }
		    {
		    	pathArr[2] && pathArr.length > 2 && <Breadcrumb.Item><Link to={`/${pathArr.slice(0,3).join('/')}`}>{data.name3}</Link></Breadcrumb.Item>
		    }
		    {
		    	pathArr[3] && pathArr.length > 3 && <Breadcrumb.Item><Link to={`/${pathArr.join('/')}`}>{data.name4}</Link></Breadcrumb.Item>
		    }
		    <Breadcrumb.Item>{data.cname}</Breadcrumb.Item>
		</Breadcrumb>
	);
};

export default BreadcrumbLayout;