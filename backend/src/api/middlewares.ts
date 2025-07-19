import { authenticate, defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http";
import { PostMerchantCreateSchema } from "./merchants/route";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/merchants",
      method: ["POST"],
      middlewares: [
        authenticate("merchant", ["session", "bearer"], {
          allowUnregistered: true,
        }),
        validateAndTransformBody(PostMerchantCreateSchema as any),
      ],
    },
    {
      matcher: "/merchants/*",
      middlewares: [authenticate("merchant", ["session", "bearer"])],
    },
  ],
});
