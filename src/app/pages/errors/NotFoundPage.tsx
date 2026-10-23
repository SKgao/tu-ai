import { useLocation } from 'react-router-dom';
import notFoundArt from '@/assets/illustration-404.svg';
import { ErrorStatePage } from './ErrorStatePage';

type ErrorLocationState = {
  from?: string;
};

export function NotFoundPage() {
  const location = useLocation();
  const from = (location.state as ErrorLocationState | null)?.from;

  return (
    <ErrorStatePage
      code="404"
      title="哎呀，页面走丢了"
      description="你访问的页面不存在，可能是链接地址输错了，也可能这个页面已经被移动或删除。"
      hint="可以检查一下地址栏，或者从左侧菜单重新进入需要的功能。"
      art={notFoundArt}
      artAlt="拿着放大镜寻找页面的卡通小人"
      from={from}
    />
  );
}
