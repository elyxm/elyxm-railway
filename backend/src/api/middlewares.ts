import {
  authenticate,
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { MedusaError, ModuleRegistrationName } from "@medusajs/utils";
import { Request } from "express";
import { CACHE_CONFIGS } from "../lib/constants";
import { createCacheHelper } from "./utils/cache-helper";

// Legacy middleware for restaurant/driver access
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
    // Global admin authentication middleware
    {
      matcher: "/admin/**",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },

    // Legacy routes with cache handling
    {
      matcher: "/admin/restaurants*",
      middlewares: [
        async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          const cacheService = createCacheHelper(
            req.scope.resolve(ModuleRegistrationName.CACHE),
            CACHE_CONFIGS.RESTAURANTS
          );

          res.locals.cacheService = cacheService;

          if (req.method === "GET") {
            const cached = await cacheService.get(req.url);
            if (cached) {
              return res.json(cached);
            }
          }

          next();
        },
      ],
    },
    {
      matcher: "/admin/restaurants*",
      middlewares: [
        async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          const cacheService = res.locals.cacheService;

          if (req.method !== "GET") {
            await cacheService.invalidate();
          }

          next();
        },
      ],
    },

    // Test routes
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
      ],
    },

    // Legacy store routes (driver/restaurant)
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
