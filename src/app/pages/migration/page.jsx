import React from 'react';

const migrationModules = [
  '角色与权限菜单',
  '权限菜单',
  '教材/单元/课节管理',
  '课程包与活动运营',
  '订单与会员体系',
];

export function MigrationPage() {
  return (
    <div className="page-stack">
      <section className="surface-card">
        <div className="stack-sm">
          <span className="app-badge app-badge--gold">Staged Migration</span>
          <h2 className="page-title page-title--sm">迁移已完成，按模块持续整理</h2>
          <p className="page-copy">
            旧目录和历史封装已经从仓库中移除，当前代码只保留新架构运行所需的页面、服务、状态和公共能力。
            后续会继续按模块整理命名、样式和公共抽象，压缩维护成本。
          </p>
        </div>
      </section>

      <section className="surface-card">
        <h3 className="section-title">待迁移业务模块</h3>
        <ul className="module-list">
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>用户管理</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>角色管理</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>会员管理</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>会员信息</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>菜单管理</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>会员等级管理</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>订单管理</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>课程订单</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>邀请明细</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>学习记录</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>已买课程</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>活动管理</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>精品课程</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>课程包管理</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>课程包课程</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>课程包活动</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>教材管理</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>单元管理</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>Part 管理</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>关卡管理</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>题目管理</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>素材管理</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>小关卡管理</span>
          </li>
          <li className="module-list__item">
            <span className="app-badge app-badge--success">已迁移</span>
            <span>大关卡管理</span>
          </li>
          {migrationModules.map((item, index) => (
            <li key={item} className="module-list__item">
              <span className={index < 2 ? 'app-badge' : 'app-badge app-badge--muted'}>
                {index < 2 ? '优先' : '后续'}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
