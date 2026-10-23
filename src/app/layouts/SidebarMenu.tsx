import { Fragment, useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MenuIcon } from '@/app/lib/menuIcons';
import type { MenuNode } from '@/app/stores/menus';

type SidebarMenuProps = {
  items: MenuNode[];
  pathname: string;
  loading: boolean;
  error: string;
  onRetry: () => void;
};

function containsPath(node: MenuNode, pathname: string): boolean {
  if (node.path === pathname) {
    return true;
  }
  return node.children.some((child) => containsPath(child, pathname));
}

function collectActiveAncestors(
  nodes: MenuNode[],
  pathname: string,
  ancestors: number[] = [],
  result: number[] = [],
): number[] {
  nodes.forEach((node) => {
    if (node.children.length) {
      collectActiveAncestors(node.children, pathname, [...ancestors, node.id], result);
    }
    if (node.path === pathname) {
      ancestors.forEach((id) => {
        if (!result.includes(id)) {
          result.push(id);
        }
      });
    }
  });
  return result;
}

export function SidebarMenu({
  items,
  pathname,
  loading,
  error,
  onRetry,
}: SidebarMenuProps) {
  // 默认展开所有目录，用户点击后再单独收起
  const [closedGroups, setClosedGroups] = useState<Record<number, boolean>>({});
  const activeAncestors = useMemo(
    () => collectActiveAncestors(items, pathname),
    [items, pathname],
  );

  // 进入某个子页面时自动展开它所在的目录
  useEffect(() => {
    if (!activeAncestors.length) {
      return;
    }

    setClosedGroups((prev) => {
      const next = { ...prev };
      let changed = false;
      activeAncestors.forEach((id) => {
        if (next[id]) {
          delete next[id];
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [activeAncestors]);

  if (loading && !items.length) {
    return <div className="app-nav__hint">菜单加载中...</div>;
  }

  if (error && !items.length) {
    return (
      <div className="app-nav__hint">
        <span>{error}</span>
        <button type="button" className="app-nav__retry" onClick={onRetry}>
          重新加载
        </button>
      </div>
    );
  }

  if (!items.length) {
    return <div className="app-nav__hint">当前账号暂未授权任何菜单</div>;
  }

  function renderNodes(nodes: MenuNode[], depth: number) {
    return nodes.map((node) => {
      const indent = { paddingLeft: 14 + depth * 16 };
      const hasChildren = node.children.length > 0;

      if (hasChildren) {
        const open = !closedGroups[node.id];
        const active = containsPath(node, pathname);

        return (
          <Fragment key={node.id}>
            <button
              type="button"
              className={
                active
                  ? 'app-nav__group-toggle app-nav__group-toggle--active'
                  : 'app-nav__group-toggle'
              }
              style={indent}
              aria-expanded={open}
              onClick={() =>
                setClosedGroups((prev) => ({ ...prev, [node.id]: open }))
              }
            >
              <MenuIcon name={node.icon} className="app-nav__icon" />
              <span className="app-nav__group-label">{node.menuName}</span>
              <span
                className={
                  open ? 'app-nav__chevron app-nav__chevron--open' : 'app-nav__chevron'
                }
                aria-hidden="true"
              />
            </button>
            {open ? renderNodes(node.children, depth + 1) : null}
          </Fragment>
        );
      }

      return (
        <NavLink
          key={node.id}
          to={node.path}
          style={indent}
          className={({ isActive }) =>
            isActive ? 'app-nav__item app-nav__item--active' : 'app-nav__item'
          }
        >
          <MenuIcon name={node.icon} className="app-nav__icon" />
          <span className="app-nav__label">{node.menuName}</span>
        </NavLink>
      );
    });
  }

  return <>{renderNodes(items, 0)}</>;
}
