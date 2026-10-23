import { Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { findFirstMenuPath } from '@/app/lib/menuAccess';
import { useMenuStore } from '@/app/stores/menus';

type ErrorStatePageProps = {
  code: '403' | '404';
  title: string;
  description: string;
  hint?: string;
  art: string;
  artAlt: string;
  from?: string;
};

export function ErrorStatePage({
  code,
  title,
  description,
  hint,
  art,
  artAlt,
  from,
}: ErrorStatePageProps) {
  const navigate = useNavigate();
  const menus = useMenuStore((state) => state.items);
  const homePath = findFirstMenuPath(menus);

  return (
    <div className="error-page">
      <div className="error-page__card">
        <div className="error-page__art-wrap">
          <img className="error-page__art" src={art} alt={artAlt} />
        </div>
        <div className="error-page__content">
          <span className="error-page__code">{code}</span>
          <h1 className="error-page__title">{title}</h1>
          <p className="error-page__desc">{description}</p>
          {from ? (
            <p className="error-page__from">
              访问地址：<code>{from}</code>
            </p>
          ) : null}
          {hint ? <p className="error-page__hint">{hint}</p> : null}
          <Space size="middle" wrap>
            {homePath ? (
              <Button type="primary" onClick={() => navigate(homePath, { replace: true })}>
                回到首页
              </Button>
            ) : null}
            <Button onClick={() => navigate(-1)}>返回上一页</Button>
          </Space>
        </div>
      </div>
    </div>
  );
}
