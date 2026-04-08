import React from 'react';

export function DashboardPage() {
  return (
    <div className="page-stack">
      <div className="page-stack__hero">
        <div>
          <span className="app-badge">Modern Stack</span>
          <h2 className="page-title">迁移工作台</h2>
          <p className="page-copy">
            当前仓库已经切到新的 Vite 入口，后续业务页面可以按模块逐步从旧的 dva/roadhog
            代码迁移到这里。
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <section className="surface-card">
          <div className="stat-card__label">构建架构</div>
          <div className="stat-card__value">Vite</div>
        </section>
        <section className="surface-card">
          <div className="stat-card__label">已迁移页面</div>
          <div className="stat-card__value">用户 / 角色 / 菜单 / 教材 / 单元 / Part / 关卡 / 小关卡 / 大关卡</div>
        </section>
        <section className="surface-card">
          <div className="stat-card__label">路由/状态</div>
          <div className="stat-card__value">Router + Zustand</div>
        </section>
      </div>

      <section className="surface-card">
        <h3 className="section-title">建议迁移顺序</h3>
        <ol className="timeline-list">
          <li>先迁移公共布局、鉴权、请求层和菜单配置</li>
          <li>再迁移登录、用户、角色、权限菜单这类管理页</li>
          <li>最后迁移复杂表格、上传、拖拽和富文本页面</li>
        </ol>
      </section>
    </div>
  );
}
