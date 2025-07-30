import {
  authenticate,
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/types";
import { MedusaError, ModuleRegistrationName } from "@medusajs/utils";
import { Request } from "express";
import { CACHE_CONFIGS } from "../lib/constants";
import { createCacheHelper } from "./utils/cache-helper";

const isAllowed = (req: any, res: MedusaResponse, next: MedusaNextFunction) => {
  const { restaurant_id, driver_id } = req.auth_context?.app_metadata ?? {};

  if (restaurant_id || driver_id) {
    req.user = {
      actor_type: restaurant_id ? "restaurant" : "driver",
      userId: restaurant_id || driver_id,
    };

    next();
  } else {
    res.status(403).json({
      message: "Forbidden. Reason: No restaurant_id or driver_id in app_metadata",
    });
  }
};

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/products", // ℹ️ The core API route we want to cache
      method: "GET",
      middlewares: [
        async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          const cacheService = req.scope.resolve(ModuleRegistrationName.CACHE);
          const logger = req.scope.resolve("logger");

          // Create cache helper for products
          const productCacheHelper = createCacheHelper(cacheService, CACHE_CONFIGS.PRODUCTS, { logger });

          // Try to get cached response based on query parameters
          const cachedProducts = await productCacheHelper.getByQuery<HttpTypes.StoreProductListResponse>(
            req.query || {}
          );

          if (cachedProducts) {
            const cacheKey = await productCacheHelper.generateQueryCacheKey(req.query || {});
            productCacheHelper.logCacheResult(true, cacheKey);
            res.json(cachedProducts);
            return;
          }

          // Cache miss - log and set up response caching
          const cacheKey = await productCacheHelper.generateQueryCacheKey(req.query || {});
          productCacheHelper.logCacheResult(false, cacheKey);

          const originalJsonFn = res.json;
          Object.assign(res, {
            json: async function (body: HttpTypes.StoreProductListResponse) {
              // Cache the response using query parameters
              await productCacheHelper.setByQuery(req.query || {}, body);
              await originalJsonFn.call(res, body);
            },
          });

          next();
        },
      ],
    },
    {
      matcher: "/test*",
      middlewares: [
        (req: Request, res: MedusaResponse, next: MedusaNextFunction) => {
          console.log("Received a test request!", {
            auth: req.headers,
          });
          next();
        },
        authenticate("user", ["session", "bearer", "api-key"]),
        // authenticate(["restaurant", "admin"], "bearer", {
        //   allowUnauthenticated: true,
        // }),
        // isAllowed,
      ],
    },
    {
      method: ["GET"],
      matcher: "/store/users/me",
      middlewares: [authenticate(["driver", "restaurant"], "bearer"), isAllowed],
    },
    {
      method: ["POST"],
      matcher: "/store/users",
      middlewares: [
        authenticate(["driver", "restaurant"], "bearer", {
          allowUnregistered: true,
        }),
      ],
    },
    {
      method: ["POST", "DELETE"],
      matcher: "/store/restaurants/:id/**",
      middlewares: [authenticate(["restaurant", "admin"], "bearer")],
    },
    {
      matcher: "/store/restaurants/:id/admin/**",
      middlewares: [authenticate(["restaurant", "admin"], "bearer")],
    },
  ],
  errorHandler: (error: Error, req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    let statusCode = 500;
    let message = "An unknown error occurred";

    if (error instanceof MedusaError) {
      statusCode =
        error.code && error.code !== "unknown_error" && isNaN(Number(error.code)) ? Number(error.code) : statusCode;
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    res.status(statusCode).json({ message });
  },
});
