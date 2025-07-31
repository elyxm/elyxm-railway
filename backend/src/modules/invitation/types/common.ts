export enum InviteStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  EXPIRED = "expired",
}

export interface CreateInviteDTO {
  email: string;
  client_id: string;
  role_id?: string;
  inviter_id: string;
  expires_at?: Date;
}
