import {
  authenticate,
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/types";
import { MedusaError, ModuleRegistrationName } from "@medusajs/utils";
import { createHash } from "crypto";
import { Request } from "express";
import { PRODUCTS_CACHE_VERSION_KEY } from "../lib/constants";

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

          let cacheVersion = await cacheService.get<number>(PRODUCTS_CACHE_VERSION_KEY);
          if (cacheVersion === null) {
            cacheVersion = 1;
            await cacheService.set(PRODUCTS_CACHE_VERSION_KEY, cacheVersion, 24 * 60 * 60); // 24 hours in seconds
          }

          const queryParams = JSON.stringify(req.query || {});
          const hash = createHash("sha256").update(queryParams).digest("hex");
          const cacheKey = `cache:key:products:${cacheVersion}:${hash}`;

          const cachedProducts = await cacheService.get<HttpTypes.StoreProductListResponse>(cacheKey);

          if (cachedProducts) {
            logger.info(`[${new Date().toISOString()}] Cache HIT for key: ${cacheKey}`);
            res.json(cachedProducts);
            return;
          }

          logger.info(`[${new Date().toISOString()}] Cache MISS for key: ${cacheKey}`);

          const originalJsonFn = res.json;
          Object.assign(res, {
            json: async function (body: HttpTypes.StoreProductListResponse) {
              await cacheService.set(cacheKey, body, 24 * 60 * 60); // cache for 24 hours
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
