import {
  authenticate,
  defineMiddlewares,
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { MedusaError } from "@medusajs/utils";
import { Request } from "express";

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
