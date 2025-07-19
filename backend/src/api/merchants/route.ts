import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework";
import { MedusaError } from "@medusajs/framework/utils";
import createMerchantWorkflow, { CreateMerchantWorkflowInput } from "workflows/marketplace/create-merchant";
import { z } from "zod";

export const PostMerchantCreateSchema = z
  .object({
    name: z.string(),
    handle: z.string().optional(),
    logo: z.string().optional(),
    admin: z
      .object({
        email: z.string(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
      })
      .strict(),
  })
  .strict();

type RequestBody = z.infer<typeof PostMerchantCreateSchema>;

export const POST = async (req: AuthenticatedMedusaRequest<RequestBody>, res: MedusaResponse) => {
  // If `actor_id` is present, the request carries
  // authentication for an existing merchant admin
  if (req.auth_context?.actor_id) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Request already authenticated as a merchant.");
  }

  const merchantData = req.validatedBody;

  // create merchant admin
  const { result } = await createMerchantWorkflow(req.scope).run({
    input: {
      ...merchantData,
      authIdentityId: req.auth_context.auth_identity_id,
    } as CreateMerchantWorkflowInput,
  });

  res.json({
    merchant: result.merchant,
  });
};
