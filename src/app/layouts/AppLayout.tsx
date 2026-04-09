import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { selectAuthLogout, selectAuthUser, useAuthStore } from '@/app/stores/auth';
import logo from '@/assets/logo.png';

type MenuItem = {
  key: string;
  label: string;
};

const menuItems: MenuItem[] = [
  { key: '/dashboard', label: '工作台' },
  { key: '/activities', label: '活动管理' },
  { key: '/special-courses', label: '精品课程' },
  { key: '/course-bags', label: '课程包管理' },
  { key: '/users', label: '用户管理' },
  { key: '/roles', label: '角色管理' },
  { key: '/members', label: '会员管理' },
  { key: '/member-info', label: '会员信息' },
  { key: '/menus', label: '菜单管理' },
  { key: '/member-levels', label: '会员等级' },
  { key: '/orders', label: '订单管理' },
  { key: '/course-orders', label: '课程订单' },
  { key: '/books', label: '教材管理' },
  { key: '/units', label: '单元管理' },
  { key: '/parts', label: 'Part 管理' },
  { key: '/passes', label: '关卡管理' },
  { key: '/subjects', label: '题目管理' },
  { key: '/source-material', label: '素材管理' },
  { key: '/custom-passes', label: '小关卡管理' },
  { key: '/sessions', label: '大关卡管理' },
  { key: '/migration', label: '迁移看板' },
];

export function AppLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore(selectAuthLogout);
  const user = useAuthStore(selectAuthUser);

  return (
    <div className="app-shell">
      <aside className="app-shell__sider">
        <Link to="/dashboard" className="app-shell__brand">
          <img src={logo} alt="图图" />
          <div>
            <strong>图图后台</strong>
            <span>Vite Migration</span>
          </div>
        </Link>
        <nav className="app-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.key}
              className={({ isActive }) =>
                isActive ? 'app-nav__item app-nav__item--active' : 'app-nav__item'
              }
            >
              <span className="app-nav__dot" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="app-shell__main">
        <header className="app-shell__header">
          <div>
            <strong className="app-shell__title">新架构运行中</strong>
            <div className="app-shell__header-subtitle">Vite + React Router + Lightweight UI</div>
          </div>
          <div className="app-shell__actions">
            <div className="app-user-chip">{user?.username || user?.account || '管理员'}</div>
            <button
              type="button"
              className="app-button app-button--ghost"
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
            >
              退出登录
            </button>
          </div>
        </header>
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
