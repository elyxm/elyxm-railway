import UserModule from "@medusajs/medusa/user";
import { defineLink } from "@medusajs/utils";
import ClientModule from "../modules/client";

// Link Users to Clients through Roles (user_roles table)
export default defineLink(
  UserModule.linkable.user,
  {
    linkable: ClientModule.linkable.client,
    isList: true,
  },
  {
    database: {
      table: "user_client_roles",
      extraColumns: {
        role_id: {
          type: "text",
          nullable: false,
        },
        assigned_by: {
          type: "text",
          nullable: false,
        },
      },
    },
  }
);
