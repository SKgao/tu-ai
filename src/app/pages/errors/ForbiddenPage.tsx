import { useLocation } from 'react-router-dom';
import forbiddenArt from '@/assets/illustration-403.svg';
import { ErrorStatePage } from './ErrorStatePage';

type ErrorLocationState = {
  from?: string;
};

export function ForbiddenPage() {
  const location = useLocation();
  const from = (location.state as ErrorLocationState | null)?.from;

  return (
    <ErrorStatePage
      code="403"
      title="这里暂时没有你的通行证"
      description="当前账号还没有这个页面的菜单授权，所以无法查看。"
      hint="如果确实需要访问，请联系管理员在「用户管理 → 授权」中为你开通对应菜单，或换一个有权限的账号登录。"
      art={forbiddenArt}
      artAlt="举着钥匙和盾牌的卡通守卫"
      from={from}
    />
  );
}
