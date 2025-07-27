import Medusa from "@medusajs/js-sdk";

const dotenv = require("dotenv");
dotenv.config();

export const sdk = new Medusa({
  baseUrl: process.env.VITE_BACKEND_URL || "/",
  debug: process.env.NODE_ENV === "development",
  auth: {
    type: "session",
  },
});
