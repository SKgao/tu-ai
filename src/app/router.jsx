import React, { Suspense, lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

const ProtectedRoute = lazy(() =>
  import('@/app/routes/ProtectedRoute').then((module) => ({ default: module.ProtectedRoute })),
);
const AppLayout = lazy(() =>
  import('@/app/layouts/AppLayout').then((module) => ({ default: module.AppLayout })),
);
const LoginPage = lazy(() =>
  import('@/app/pages/login/page').then((module) => ({ default: module.LoginPage })),
);
const ActivityManagementPage = lazy(() =>
  import('@/app/pages/activities/page').then((module) => ({
    default: module.ActivityManagementPage,
  })),
);
const SpecialCourseManagementPage = lazy(() =>
  import('@/app/pages/special-courses/page').then((module) => ({
    default: module.SpecialCourseManagementPage,
  })),
);
const CourseBagManagementPage = lazy(() =>
  import('@/app/pages/course-bags/page').then((module) => ({
    default: module.CourseBagManagementPage,
  })),
);
const CourseBagCourseManagementPage = lazy(() =>
  import('@/app/pages/course-bag-courses/page').then((module) => ({
    default: module.CourseBagCourseManagementPage,
  })),
);
const CourseBagActivityManagementPage = lazy(() =>
  import('@/app/pages/course-bag-activities/page').then((module) => ({
    default: module.CourseBagActivityManagementPage,
  })),
);
const DashboardPage = lazy(() =>
  import('@/app/pages/dashboard/page').then((module) => ({ default: module.DashboardPage })),
);
const MigrationPage = lazy(() =>
  import('@/app/pages/migration/page').then((module) => ({ default: module.MigrationPage })),
);
const UserManagementPage = lazy(() =>
  import('@/app/pages/users/page').then((module) => ({
    default: module.UserManagementPage,
  })),
);
const RoleManagementPage = lazy(() =>
  import('@/app/pages/roles/page').then((module) => ({
    default: module.RoleManagementPage,
  })),
);
const MemberManagementPage = lazy(() =>
  import('@/app/pages/members/page').then((module) => ({
    default: module.MemberManagementPage,
  })),
);
const MemberInfoManagementPage = lazy(() =>
  import('@/app/pages/member-info/page').then((module) => ({
    default: module.MemberInfoManagementPage,
  })),
);
const MenuManagementPage = lazy(() =>
  import('@/app/pages/menus/page').then((module) => ({
    default: module.MenuManagementPage,
  })),
);
const InviteCountPage = lazy(() =>
  import('@/app/pages/invite-count/page').then((module) => ({
    default: module.InviteCountPage,
  })),
);
const LearningRecordPage = lazy(() =>
  import('@/app/pages/learning-record/page').then((module) => ({
    default: module.LearningRecordPage,
  })),
);
const CourseUserManagementPage = lazy(() =>
  import('@/app/pages/course-users/page').then((module) => ({
    default: module.CourseUserManagementPage,
  })),
);
const CourseOrderManagementPage = lazy(() =>
  import('@/app/pages/course-orders/page').then((module) => ({
    default: module.CourseOrderManagementPage,
  })),
);
const MemberLevelManagementPage = lazy(() =>
  import('@/app/pages/member-levels/page').then((module) => ({
    default: module.MemberLevelManagementPage,
  })),
);
const OrderManagementPage = lazy(() =>
  import('@/app/pages/orders/page').then((module) => ({
    default: module.OrderManagementPage,
  })),
);
const BookManagementPage = lazy(() =>
  import('@/app/pages/books/page').then((module) => ({
    default: module.BookManagementPage,
  })),
);
const UnitManagementPage = lazy(() =>
  import('@/app/pages/units/page').then((module) => ({
    default: module.UnitManagementPage,
  })),
);
const PartManagementPage = lazy(() =>
  import('@/app/pages/parts/page').then((module) => ({
    default: module.PartManagementPage,
  })),
);
const PassManagementPage = lazy(() =>
  import('@/app/pages/passes/page').then((module) => ({
    default: module.PassManagementPage,
  })),
);
const SubjectsManagementPage = lazy(() =>
  import('@/app/pages/subjects/page').then((module) => ({
    default: module.SubjectsManagementPage,
  })),
);
const SourceMaterialManagementPage = lazy(() =>
  import('@/app/pages/source-material/page').then((module) => ({
    default: module.SourceMaterialManagementPage,
  })),
);
const CustomPassManagementPage = lazy(() =>
  import('@/app/pages/custom-passes/page').then((module) => ({
    default: module.CustomPassManagementPage,
  })),
);
const SessionManagementPage = lazy(() =>
  import('@/app/pages/sessions/page').then((module) => ({
    default: module.SessionManagementPage,
  })),
);

function withSuspense(node) {
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
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: withSuspense(<DashboardPage />),
          },
          {
            path: '/activities',
            element: withSuspense(<ActivityManagementPage />),
          },
          {
            path: '/activity',
            element: withSuspense(<ActivityManagementPage />),
          },
          {
            path: '/special-courses',
            element: withSuspense(<SpecialCourseManagementPage />),
          },
          {
            path: '/specialCourse',
            element: withSuspense(<SpecialCourseManagementPage />),
          },
          {
            path: '/course-bags',
            element: withSuspense(<CourseBagManagementPage />),
          },
          {
            path: '/courseBag/bags',
            element: withSuspense(<CourseBagManagementPage />),
          },
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
          {
            path: '/users',
            element: withSuspense(<UserManagementPage />),
          },
          {
            path: '/roles',
            element: withSuspense(<RoleManagementPage />),
          },
          {
            path: '/members',
            element: withSuspense(<MemberManagementPage />),
          },
          {
            path: '/member',
            element: withSuspense(<MemberManagementPage />),
          },
          {
            path: '/member-info',
            element: withSuspense(<MemberInfoManagementPage />),
          },
          {
            path: '/memberInfo',
            element: withSuspense(<MemberInfoManagementPage />),
          },
          {
            path: '/menus',
            element: withSuspense(<MenuManagementPage />),
          },
          {
            path: '/invite-count',
            element: withSuspense(<InviteCountPage />),
          },
          {
            path: '/inviteCount',
            element: withSuspense(<InviteCountPage />),
          },
          {
            path: '/learning-record',
            element: withSuspense(<LearningRecordPage />),
          },
          {
            path: '/learningRecord',
            element: withSuspense(<LearningRecordPage />),
          },
          {
            path: '/course-users',
            element: withSuspense(<CourseUserManagementPage />),
          },
          {
            path: '/couUser',
            element: withSuspense(<CourseUserManagementPage />),
          },
          {
            path: '/course-orders',
            element: withSuspense(<CourseOrderManagementPage />),
          },
          {
            path: '/couOrder',
            element: withSuspense(<CourseOrderManagementPage />),
          },
          {
            path: '/member-levels',
            element: withSuspense(<MemberLevelManagementPage />),
          },
          {
            path: '/memberLevel',
            element: withSuspense(<MemberLevelManagementPage />),
          },
          {
            path: '/orders',
            element: withSuspense(<OrderManagementPage />),
          },
          {
            path: '/order',
            element: withSuspense(<OrderManagementPage />),
          },
          {
            path: '/books',
            element: withSuspense(<BookManagementPage />),
          },
          {
            path: '/units',
            element: withSuspense(<UnitManagementPage />),
          },
          {
            path: '/parts',
            element: withSuspense(<PartManagementPage />),
          },
          {
            path: '/passes',
            element: withSuspense(<PassManagementPage />),
          },
          {
            path: '/subjects',
            element: withSuspense(<SubjectsManagementPage />),
          },
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
          {
            path: '/sessions',
            element: withSuspense(<SessionManagementPage />),
          },
          {
            path: '/migration',
            element: withSuspense(<MigrationPage />),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
