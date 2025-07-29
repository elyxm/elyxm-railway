import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import zod from "zod";

import { CreateDriverInput, createUserWorkflow } from "../../../workflows";

const schema = zod
  .object({
    email: zod.string().email(),
    first_name: zod.string(),
    last_name: zod.string(),
    phone: zod.string(),
    avatar_url: zod.string().optional(),
    restaurant_id: zod.string().optional(),
    actor_type: zod.ZodEnum.create(["restaurant", "driver"]),
  })
  .required({
    email: true,
    first_name: true,
    last_name: true,
    phone: true,
    actor_type: true,
  });

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const auth_identity_id = process.env.TEST_AUTH_BYPASS_IDENTITY_ID || req.auth_context?.auth_identity_id;

  if (!auth_identity_id) {
    return res.status(401).json({
      error: "Authentication required. For testing, set the TEST_AUTH_BYPASS_IDENTITY_ID environment variable.",
    });
  }

  const validatedBody = schema.parse(req.body) as CreateDriverInput & {
    actor_type: "restaurant" | "driver";
  };

  const { result, errors } = await createUserWorkflow(req.scope).run({
    input: {
      user: validatedBody,
      auth_identity_id,
    },
    throwOnError: false,
  });

  if (Array.isArray(errors) && errors[0]) {
    throw errors[0].error;
  }

  res.status(201).json({ user: result });
};
