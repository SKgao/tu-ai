import { Suspense, lazy } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

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
const ActivityManagementPage = lazyNamed(
  () => import('@/app/pages/activities/page'),
  'ActivityManagementPage',
);
const SpecialCourseManagementPage = lazyNamed(
  () => import('@/app/pages/special-courses/page'),
  'SpecialCourseManagementPage',
);
const CourseBagManagementPage = lazyNamed(
  () => import('@/app/pages/course-bags/page'),
  'CourseBagManagementPage',
);
const CourseBagCourseManagementPage = lazyNamed(
  () => import('@/app/pages/course-bag-courses/page'),
  'CourseBagCourseManagementPage',
);
const CourseBagActivityManagementPage = lazyNamed(
  () => import('@/app/pages/course-bag-activities/page'),
  'CourseBagActivityManagementPage',
);
const DashboardPage = lazyNamed(() => import('@/app/pages/dashboard/page'), 'DashboardPage');
const MigrationPage = lazyNamed(() => import('@/app/pages/migration/page'), 'MigrationPage');
const UserManagementPage = lazyNamed(() => import('@/app/pages/users/page'), 'UserManagementPage');
const RoleManagementPage = lazyNamed(() => import('@/app/pages/roles/page'), 'RoleManagementPage');
const MemberManagementPage = lazyNamed(() => import('@/app/pages/members/page'), 'MemberManagementPage');
const MemberInfoManagementPage = lazyNamed(
  () => import('@/app/pages/member-info/page'),
  'MemberInfoManagementPage',
);
const MenuManagementPage = lazyNamed(() => import('@/app/pages/menus/page'), 'MenuManagementPage');
const InviteCountPage = lazyNamed(() => import('@/app/pages/invite-count/page'), 'InviteCountPage');
const LearningRecordPage = lazyNamed(
  () => import('@/app/pages/learning-record/page'),
  'LearningRecordPage',
);
const CourseUserManagementPage = lazyNamed(
  () => import('@/app/pages/course-users/page'),
  'CourseUserManagementPage',
);
const CourseOrderManagementPage = lazyNamed(
  () => import('@/app/pages/course-orders/page'),
  'CourseOrderManagementPage',
);
const MemberLevelManagementPage = lazyNamed(
  () => import('@/app/pages/member-levels/page'),
  'MemberLevelManagementPage',
);
const OrderManagementPage = lazyNamed(() => import('@/app/pages/orders/page'), 'OrderManagementPage');
const BookManagementPage = lazyNamed(() => import('@/app/pages/books/page'), 'BookManagementPage');
const UnitManagementPage = lazyNamed(() => import('@/app/pages/units/page'), 'UnitManagementPage');
const PartManagementPage = lazyNamed(() => import('@/app/pages/parts/page'), 'PartManagementPage');
const PassManagementPage = lazyNamed(() => import('@/app/pages/passes/page'), 'PassManagementPage');
const SubjectsManagementPage = lazyNamed(
  () => import('@/app/pages/subjects/page'),
  'SubjectsManagementPage',
);
const SourceMaterialManagementPage = lazyNamed(
  () => import('@/app/pages/source-material/page'),
  'SourceMaterialManagementPage',
);
const CustomPassManagementPage = lazyNamed(
  () => import('@/app/pages/custom-passes/page'),
  'CustomPassManagementPage',
);
const SessionManagementPage = lazyNamed(
  () => import('@/app/pages/sessions/page'),
  'SessionManagementPage',
);

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<div className="route-skeleton" />}>{node}</Suspense>;
}

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
          { path: '/dashboard', element: withSuspense(<DashboardPage />) },
          { path: '/activities', element: withSuspense(<ActivityManagementPage />) },
          { path: '/activity', element: withSuspense(<ActivityManagementPage />) },
          { path: '/special-courses', element: withSuspense(<SpecialCourseManagementPage />) },
          { path: '/specialCourse', element: withSuspense(<SpecialCourseManagementPage />) },
          { path: '/course-bags', element: withSuspense(<CourseBagManagementPage />) },
          { path: '/courseBag/bags', element: withSuspense(<CourseBagManagementPage />) },
          {
            path: '/course-bag-courses',
            element: withSuspense(<CourseBagCourseManagementPage />),
          },
          {
            path: '/courseBag/course',
            element: withSuspense(<CourseBagCourseManagementPage />),
          },
          {
            path: '/course-bag-activities',
            element: withSuspense(<CourseBagActivityManagementPage />),
          },
          {
            path: '/courseBag/activity',
            element: withSuspense(<CourseBagActivityManagementPage />),
          },
          { path: '/users', element: withSuspense(<UserManagementPage />) },
          { path: '/roles', element: withSuspense(<RoleManagementPage />) },
          { path: '/members', element: withSuspense(<MemberManagementPage />) },
          { path: '/member', element: withSuspense(<MemberManagementPage />) },
          {
            path: '/member-info',
            element: withSuspense(<MemberInfoManagementPage />),
          },
          { path: '/memberInfo', element: withSuspense(<MemberInfoManagementPage />) },
          { path: '/menus', element: withSuspense(<MenuManagementPage />) },
          { path: '/invite-count', element: withSuspense(<InviteCountPage />) },
          { path: '/inviteCount', element: withSuspense(<InviteCountPage />) },
          { path: '/learning-record', element: withSuspense(<LearningRecordPage />) },
          { path: '/learningRecord', element: withSuspense(<LearningRecordPage />) },
          { path: '/course-users', element: withSuspense(<CourseUserManagementPage />) },
          { path: '/couUser', element: withSuspense(<CourseUserManagementPage />) },
          { path: '/course-orders', element: withSuspense(<CourseOrderManagementPage />) },
          { path: '/couOrder', element: withSuspense(<CourseOrderManagementPage />) },
          {
            path: '/member-levels',
            element: withSuspense(<MemberLevelManagementPage />),
          },
          { path: '/memberLevel', element: withSuspense(<MemberLevelManagementPage />) },
          { path: '/orders', element: withSuspense(<OrderManagementPage />) },
          { path: '/order', element: withSuspense(<OrderManagementPage />) },
          { path: '/books', element: withSuspense(<BookManagementPage />) },
          { path: '/units', element: withSuspense(<UnitManagementPage />) },
          { path: '/parts', element: withSuspense(<PartManagementPage />) },
          { path: '/passes', element: withSuspense(<PassManagementPage />) },
          { path: '/subjects', element: withSuspense(<SubjectsManagementPage />) },
          {
            path: '/source-material',
            element: withSuspense(<SourceMaterialManagementPage />),
          },
          {
            path: '/sourceMaterial',
            element: withSuspense(<SourceMaterialManagementPage />),
          },
          {
            path: '/custom-passes',
            element: withSuspense(<CustomPassManagementPage />),
          },
          { path: '/sessions', element: withSuspense(<SessionManagementPage />) },
          { path: '/migration', element: withSuspense(<MigrationPage />) },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
