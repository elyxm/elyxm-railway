import { authenticate, defineMiddlewares, validateAndTransformBody } from "@medusajs/framework/http";
import { AdminCreateProduct } from "@medusajs/medusa/api/admin/products/validators";
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
    {
      matcher: "/merchants/products",
      method: ["POST"],
      middlewares: [validateAndTransformBody(AdminCreateProduct)],
    },
  ],
});
