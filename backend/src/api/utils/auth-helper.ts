import { ModuleRegistrationName } from "@medusajs/utils";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../lib/constants";

export interface DecodedToken {
  actor_type: string;
  actor_id?: string;
  auth_identity_id?: string;
  [key: string]: any;
}

export interface AuthUser {
  id: string;
  actor_type: string;
  actor_id: string;
}

/**
 * Validates a JWT token and returns the decoded user information
 */
export function validateJwtToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    if (decoded && decoded.actor_type) {
      return {
        id: decoded.auth_identity_id || decoded.actor_id || "unknown",
        actor_type: decoded.actor_type,
        actor_id: decoded.actor_id || decoded.auth_identity_id || "unknown",
      };
    }

    return null;
  } catch (error) {
    console.error("JWT validation failed:", error);
    return null;
  }
}

/**
 * Validates an API key against the database
 */
async function validateApiKey(apiKey: string, container: any): Promise<AuthUser | null> {
  try {
    const apiKeyService = container.resolve(ModuleRegistrationName.API_KEY);

    // Use proper filtering to find the specific API key
    const apiKeys = await apiKeyService.listApiKeys({
      token: apiKey,
      revoked_at: { $eq: null }, // Only non-revoked keys
    });

    if (apiKeys.length > 0) {
      const apiKeyRecord = apiKeys[0];
      return {
        id: apiKeyRecord.id,
        actor_type: "admin", // API keys are typically for admin access
        actor_id: apiKeyRecord.id,
      };
    }

    return null;
  } catch (error) {
    console.error("API key validation failed:", error);
    return null;
  }
}

/**
 * Validates session authentication
 */
async function validateSession(req: any): Promise<AuthUser | null> {
  try {
    // Check for JWT token in cookies (more reliable than session store)
    const jwtToken = req.cookies?.["_medusa_jwt"];
    if (jwtToken) {
      try {
        const user = validateJwtToken(jwtToken);
        if (user && user.actor_type === "admin") {
          return user;
        }
      } catch (jwtError) {
        // JWT validation failed (expired, invalid, etc.)
      }
    }

    // Check for admin session cookie (when no JWT or JWT is customer)
    if (req.cookies && req.cookies["connect.sid"]) {
      const sessionId = req.cookies["connect.sid"];

      // Try to get the session store
      let sessionStore;
      try {
        sessionStore = req.scope.resolve("sessionStore");
      } catch (error) {
        // Session store not available
      }

      if (sessionStore) {
        try {
          // Parse the session ID (remove signature if present)
          const cleanSessionId = sessionId.split(".")[0];
          const session = await sessionStore.get(cleanSessionId);

          if (session && session.user_id) {
            return {
              id: session.user_id,
              actor_type: "admin",
              actor_id: session.user_id,
            };
          }
        } catch (sessionError) {
          console.error("Session store error:", sessionError);
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Session validation failed:", error);
    return null;
  }
}

/**
 * Custom authentication middleware that supports multiple auth methods
 * Falls back to JWT validation if Medusa's authenticate middleware doesn't work
 */
export function createCustomAuthMiddleware() {
  return async (req: any, res: any, next: any) => {
    // Skip authentication for invite endpoint (public)
    console.log("Auth middleware - path:", req.path, "url:", req.url);
    if (req.path === "/custom/invite" || req.url?.startsWith("/custom/invite")) {
      console.log("Skipping authentication for invite endpoint");
      return next();
    }

    // First, try to use the user context set by Medusa's authenticate middleware
    if ((req as any).user) {
      return next();
    }

    // Priority 1: Check for Bearer token (most reliable)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const user = validateJwtToken(token);

      if (user && user.actor_type === "admin") {
        (req as any).user = user;
        return next();
      }
    }

    // Priority 2: Check for API key
    const apiKey = req.headers["x-publishable-api-key"] || req.headers["x-api-key"];
    if (apiKey) {
      const user = await validateApiKey(apiKey, req.scope);
      if (user) {
        (req as any).user = user;
        return next();
      } else {
        return res.status(401).json({ message: "Invalid or revoked API key" });
      }
    }

    // Priority 3: Check for session (optional, since it's not working reliably)
    const sessionUser = await validateSession(req);
    if (sessionUser) {
      (req as any).user = sessionUser;
      return next();
    }

    return res.status(401).json({
      message:
        "Authentication required. Please provide a valid Bearer token or API key. Session authentication is not currently supported.",
    });
  };
}
