import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { setAuthAppMetadataStep, useQueryGraphStep } from "@medusajs/medusa/core-flows";
import createMerchantStep from "./steps/create-merchant";
import createMerchantAdminStep from "./steps/create-merchant-admin";

export type CreateMerchantWorkflowInput = {
  name: string;
  handle?: string;
  logo?: string;
  admin: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  authIdentityId: string;
};

const createMerchantWorkflow = createWorkflow("create-merchant", function (input: CreateMerchantWorkflowInput) {
  const merchant = createMerchantStep({
    name: input.name,
    handle: input.handle,
    logo: input.logo,
  });

  const merchantAdminData = transform(
    {
      input,
      merchant,
    },
    (data) => {
      return {
        ...data.input.admin,
        merchant_id: data.merchant.id,
      };
    }
  );

  const merchantAdmin = createMerchantAdminStep(merchantAdminData);

  setAuthAppMetadataStep({
    authIdentityId: input.authIdentityId,
    actorType: "merchant",
    value: merchantAdmin.id,
  });
  // @ts-ignore
  const { data: merchantWithAdmin } = useQueryGraphStep({
    entity: "merchant",
    fields: ["id", "name", "handle", "logo", "admins.*"],
    filters: {
      id: merchant.id,
    },
  });

  return new WorkflowResponse({
    merchant: merchantWithAdmin[0],
  });
});

export default createMerchantWorkflow;
