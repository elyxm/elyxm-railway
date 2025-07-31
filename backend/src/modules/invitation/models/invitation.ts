import { model } from "@medusajs/utils";
import { InviteStatus } from "../types/common";

const Invitation = model.define("invitation", {
  id: model
    .id({
      prefix: "inv",
    })
    .primaryKey(),
  email: model.text(),
  token: model.text().unique(),
  client_id: model.text(),
  role_id: model.text().nullable(),
  inviter_id: model.text(),
  status: model.enum(InviteStatus).default(InviteStatus.PENDING),
  expires_at: model.dateTime().nullable(),
  accepted_at: model.dateTime().nullable(),
});

export default Invitation;
