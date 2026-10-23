import { Suspense, lazy } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { Navigate, createBrowserRouter, useLocation } from 'react-router-dom';

function lazyNamed<TModule extends Record<string, unknown>, TKey extends keyof TModule>(
  loader: () => Promise<TModule>,
  exportName: TKey,
) {
  return lazy(async () => {
    const module = await loader();
    return {
      default: module[exportName] as ComponentType,
    };
  });
}

const ProtectedRoute = lazyNamed(
  () => import('@/app/routes/ProtectedRoute'),
  'ProtectedRoute',
);
const AppLayout = lazyNamed(() => import('@/app/layouts/AppLayout'), 'AppLayout');
const LoginPage = lazyNamed(() => import('@/app/pages/login/page'), 'LoginPage');
const DashboardPage = lazyNamed(() => import('@/app/pages/dashboard/page'), 'DashboardPage');
const ForbiddenPage = lazyNamed(
  () => import('@/app/pages/errors/ForbiddenPage'),
  'ForbiddenPage',
);
const NotFoundPage = lazyNamed(() => import('@/app/pages/errors/NotFoundPage'), 'NotFoundPage');

// 课程模块
const SpecialCourseManagementPage = lazyNamed(
  () => import('@/app/pages/course/special-courses/page'),
  'SpecialCourseManagementPage',
);
const CourseBagManagementPage = lazyNamed(
  () => import('@/app/pages/course/course-bags/page'),
  'CourseBagManagementPage',
);
const CourseBagCourseManagementPage = lazyNamed(
  () => import('@/app/pages/course/course-bag-courses/page'),
  'CourseBagCourseManagementPage',
);
const CourseBagActivityManagementPage = lazyNamed(
  () => import('@/app/pages/course/course-bag-activities/page'),
  'CourseBagActivityManagementPage',
);
const ActivityManagementPage = lazyNamed(
  () => import('@/app/pages/course/activities/page'),
  'ActivityManagementPage',
);
const CourseUserManagementPage = lazyNamed(
  () => import('@/app/pages/course/course-users/page'),
  'CourseUserManagementPage',
);

// 会员模块
const MemberManagementPage = lazyNamed(
  () => import('@/app/pages/member/members/page'),
  'MemberManagementPage',
);
const MemberInfoManagementPage = lazyNamed(
  () => import('@/app/pages/member/member-info/page'),
  'MemberInfoManagementPage',
);
const MemberLevelManagementPage = lazyNamed(
  () => import('@/app/pages/member/member-levels/page'),
  'MemberLevelManagementPage',
);
const InviteCountPage = lazyNamed(
  () => import('@/app/pages/member/invite-count/page'),
  'InviteCountPage',
);
const LearningRecordPage = lazyNamed(
  () => import('@/app/pages/member/learning-record/page'),
  'LearningRecordPage',
);

// 教材模块
const BookManagementPage = lazyNamed(
  () => import('@/app/pages/material/books/page'),
  'BookManagementPage',
);
const UnitManagementPage = lazyNamed(
  () => import('@/app/pages/material/units/page'),
  'UnitManagementPage',
);
const PartManagementPage = lazyNamed(
  () => import('@/app/pages/material/parts/page'),
  'PartManagementPage',
);
const PassManagementPage = lazyNamed(
  () => import('@/app/pages/material/passes/page'),
  'PassManagementPage',
);
const SubjectsManagementPage = lazyNamed(
  () => import('@/app/pages/material/subjects/page'),
  'SubjectsManagementPage',
);
const CustomPassManagementPage = lazyNamed(
  () => import('@/app/pages/material/custom-passes/page'),
  'CustomPassManagementPage',
);
const SessionManagementPage = lazyNamed(
  () => import('@/app/pages/material/sessions/page'),
  'SessionManagementPage',
);
const SourceMaterialManagementPage = lazyNamed(
  () => import('@/app/pages/material/source-material/page'),
  'SourceMaterialManagementPage',
);

// 订单模块
const OrderManagementPage = lazyNamed(
  () => import('@/app/pages/order/orders/page'),
  'OrderManagementPage',
);
const CourseOrderManagementPage = lazyNamed(
  () => import('@/app/pages/order/course-orders/page'),
  'CourseOrderManagementPage',
);

// 系统模块
const UserManagementPage = lazyNamed(
  () => import('@/app/pages/system/users/page'),
  'UserManagementPage',
);
const RoleManagementPage = lazyNamed(
  () => import('@/app/pages/system/roles/page'),
  'RoleManagementPage',
);
const MenuManagementPage = lazyNamed(
  () => import('@/app/pages/system/menus/page'),
  'MenuManagementPage',
);
const MigrationPage = lazyNamed(
  () => import('@/app/pages/system/migration/page'),
  'MigrationPage',
);

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<div className="route-skeleton" />}>{node}</Suspense>;
}

// 旧地址重定向：保留已有的收藏和外部跳转，同时带上原查询参数
function LegacyRedirect({ to }: { to: string }) {
  const location = useLocation();
  return <Navigate to={{ pathname: to, search: location.search }} replace />;
}

// 未匹配到任何页面时跳到 404，同时把原地址带到错误页展示
function NotFoundRedirect() {
  const location = useLocation();
  return (
    <Navigate
      to="/404"
      replace
      state={{ from: `${location.pathname}${location.search}` }}
    />
  );
}

const legacyRedirects: Array<{ from: string; to: string }> = [
  { from: 'specialCourse', to: '/course/special-courses' },
  { from: 'special-courses', to: '/course/special-courses' },
  { from: 'courseBag/bags', to: '/course/course-bags' },
  { from: 'course-bags', to: '/course/course-bags' },
  { from: 'courseBag/course', to: '/course/course-bag-courses' },
  { from: 'course-bag-courses', to: '/course/course-bag-courses' },
  { from: 'courseBag/activity', to: '/course/course-bag-activities' },
  { from: 'course-bag-activities', to: '/course/course-bag-activities' },
  { from: 'activity', to: '/course/activities' },
  { from: 'activities', to: '/course/activities' },
  { from: 'couUser', to: '/course/course-users' },
  { from: 'course-users', to: '/course/course-users' },
  { from: 'member', to: '/member/members' },
  { from: 'members', to: '/member/members' },
  { from: 'memberInfo', to: '/member/member-info' },
  { from: 'member-info', to: '/member/member-info' },
  { from: 'memberLevel', to: '/member/member-levels' },
  { from: 'member-levels', to: '/member/member-levels' },
  { from: 'inviteCount', to: '/member/invite-count' },
  { from: 'invite-count', to: '/member/invite-count' },
  { from: 'learningRecord', to: '/member/learning-record' },
  { from: 'learning-record', to: '/member/learning-record' },
  { from: 'books', to: '/material/books' },
  { from: 'units', to: '/material/units' },
  { from: 'parts', to: '/material/parts' },
  { from: 'passes', to: '/material/passes' },
  { from: 'subjects', to: '/material/subjects' },
  { from: 'custom-passes', to: '/material/custom-passes' },
  { from: 'sessions', to: '/material/sessions' },
  { from: 'sourceMaterial', to: '/material/source-material' },
  { from: 'source-material', to: '/material/source-material' },
  { from: 'order', to: '/order/orders' },
  { from: 'orders', to: '/order/orders' },
  { from: 'couOrder', to: '/order/course-orders' },
  { from: 'course-orders', to: '/order/course-orders' },
  { from: 'users', to: '/system/users' },
  { from: 'roles', to: '/system/roles' },
  { from: 'menus', to: '/system/menus' },
  { from: 'migration', to: '/system/migration' },
];

export const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    path: '/',
    element: withSuspense(<ProtectedRoute />),
    children: [
      {
        element: withSuspense(<AppLayout />),
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: withSuspense(<DashboardPage />) },
          { path: '403', element: withSuspense(<ForbiddenPage />) },
          { path: '404', element: withSuspense(<NotFoundPage />) },
          {
            path: 'course',
            children: [
              { path: 'special-courses', element: withSuspense(<SpecialCourseManagementPage />) },
              { path: 'course-bags', element: withSuspense(<CourseBagManagementPage />) },
              {
                path: 'course-bag-courses',
                element: withSuspense(<CourseBagCourseManagementPage />),
              },
              {
                path: 'course-bag-activities',
                element: withSuspense(<CourseBagActivityManagementPage />),
              },
              { path: 'activities', element: withSuspense(<ActivityManagementPage />) },
              { path: 'course-users', element: withSuspense(<CourseUserManagementPage />) },
            ],
          },
          {
            path: 'member',
            children: [
              { path: 'members', element: withSuspense(<MemberManagementPage />) },
              { path: 'member-info', element: withSuspense(<MemberInfoManagementPage />) },
              { path: 'member-levels', element: withSuspense(<MemberLevelManagementPage />) },
              { path: 'invite-count', element: withSuspense(<InviteCountPage />) },
              { path: 'learning-record', element: withSuspense(<LearningRecordPage />) },
            ],
          },
          {
            path: 'material',
            children: [
              { path: 'books', element: withSuspense(<BookManagementPage />) },
              { path: 'units', element: withSuspense(<UnitManagementPage />) },
              { path: 'parts', element: withSuspense(<PartManagementPage />) },
              { path: 'passes', element: withSuspense(<PassManagementPage />) },
              { path: 'subjects', element: withSuspense(<SubjectsManagementPage />) },
              { path: 'custom-passes', element: withSuspense(<CustomPassManagementPage />) },
              { path: 'sessions', element: withSuspense(<SessionManagementPage />) },
              {
                path: 'source-material',
                element: withSuspense(<SourceMaterialManagementPage />),
              },
            ],
          },
          {
            path: 'order',
            children: [
              { path: 'orders', element: withSuspense(<OrderManagementPage />) },
              { path: 'course-orders', element: withSuspense(<CourseOrderManagementPage />) },
            ],
          },
          {
            path: 'system',
            children: [
              { path: 'users', element: withSuspense(<UserManagementPage />) },
              { path: 'roles', element: withSuspense(<RoleManagementPage />) },
              { path: 'menus', element: withSuspense(<MenuManagementPage />) },
              { path: 'migration', element: withSuspense(<MigrationPage />) },
            ],
          },
          ...legacyRedirects.map(({ from, to }) => ({
            path: from,
            element: <LegacyRedirect to={to} />,
          })),
          { path: '*', element: <NotFoundRedirect /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);
