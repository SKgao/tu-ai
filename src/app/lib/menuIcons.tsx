import type { CSSProperties, ComponentType } from 'react';
import {
  ApartmentOutlined,
  AppstoreOutlined,
  BookOutlined,
  CrownOutlined,
  DashboardOutlined,
  FileTextOutlined,
  FlagOutlined,
  FolderOpenOutlined,
  GiftOutlined,
  IdcardOutlined,
  MenuOutlined,
  NodeIndexOutlined,
  PartitionOutlined,
  PictureOutlined,
  ProfileOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  SwapOutlined,
  TeamOutlined,
  UserOutlined,
  UserSwitchOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

type MenuIconComponent = ComponentType<{ className?: string; style?: CSSProperties }>;

export type MenuIconMeta = {
  label: string;
  Icon: MenuIconComponent;
};

/**
 * 菜单图标注册表：数据库里只存 key，前端据此渲染。
 * 新增图标时在这里补一项，菜单管理的下拉框会自动出现。
 */
export const MENU_ICONS: Record<string, MenuIconMeta> = {
  dashboard: { label: '工作台', Icon: DashboardOutlined },
  course: { label: '课程', Icon: VideoCameraOutlined },
  star: { label: '精品', Icon: StarOutlined },
  appstore: { label: '应用/课程包', Icon: AppstoreOutlined },
  gift: { label: '活动', Icon: GiftOutlined },
  team: { label: '会员/团队', Icon: TeamOutlined },
  user: { label: '用户', Icon: UserOutlined },
  idcard: { label: '会员信息', Icon: IdcardOutlined },
  crown: { label: '等级', Icon: CrownOutlined },
  book: { label: '教材', Icon: BookOutlined },
  read: { label: '阅读/教材管理', Icon: ReadOutlined },
  folder: { label: '单元/目录', Icon: FolderOpenOutlined },
  partition: { label: 'Part', Icon: PartitionOutlined },
  flag: { label: '关卡', Icon: FlagOutlined },
  profile: { label: '题目', Icon: ProfileOutlined },
  'node-index': { label: '小关卡', Icon: NodeIndexOutlined },
  apartment: { label: '大关卡', Icon: ApartmentOutlined },
  picture: { label: '素材', Icon: PictureOutlined },
  order: { label: '订单', Icon: ShoppingCartOutlined },
  'shopping-cart': { label: '购物车', Icon: ShoppingCartOutlined },
  'file-text': { label: '订单明细', Icon: FileTextOutlined },
  system: { label: '系统', Icon: SettingOutlined },
  'user-switch': { label: '用户管理', Icon: UserSwitchOutlined },
  safety: { label: '权限/角色', Icon: SafetyCertificateOutlined },
  menu: { label: '菜单', Icon: MenuOutlined },
  migration: { label: '迁移', Icon: SwapOutlined },
};

export const DEFAULT_MENU_ICON = 'appstore';

export function getMenuIconMeta(name?: string): MenuIconMeta {
  return MENU_ICONS[name || ''] || MENU_ICONS[DEFAULT_MENU_ICON];
}

export function MenuIcon({
  name,
  className,
  style,
}: {
  name?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const { Icon } = getMenuIconMeta(name);
  return <Icon className={className} style={style} />;
}

export const MENU_ICON_OPTIONS = Object.entries(MENU_ICONS).map(([value, meta]) => ({
  value,
  label: meta.label,
}));
