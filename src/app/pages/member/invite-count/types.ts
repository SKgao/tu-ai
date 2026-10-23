export type InviteRecord = {
  tutuNumber?: string | number;
  realName?: string;
  icon?: string;
  mobile?: string;
  inviteTime?: string;
} & Record<string, unknown>;
