import { ModuleRegistrationName, TransactionHandlerType } from "@medusajs/utils";
import { StepResponse, createStep } from "@medusajs/workflows-sdk";
import { DeliveryDTO } from "../../../modules";

type SetStepFailedtepInput = {
  stepId?: string;
  updatedDelivery: DeliveryDTO;
};

export const setStepFailedStepId = "set-step-failed-step";

const setStepFailedStep = createStep(
  setStepFailedStepId,
  async function ({ stepId, updatedDelivery }: SetStepFailedtepInput, { container }) {
    if (!stepId) {
      return;
    }

    const engineService = container.resolve(ModuleRegistrationName.WORKFLOW_ENGINE);

    await engineService.setStepFailure({
      idempotencyKey: {
        action: TransactionHandlerType.INVOKE,
        transactionId: updatedDelivery.transaction_id,
        stepId,
        workflowId: "handle-delivery-workflow",
      },
      stepResponse: new StepResponse(updatedDelivery, updatedDelivery.id),
      options: {
        container,
      },
    });
  }
);

export default setStepFailedStep;
