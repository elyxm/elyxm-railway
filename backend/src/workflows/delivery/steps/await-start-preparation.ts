import { createStep } from "@medusajs/workflows-sdk";

export const awaitStartPreparationStepId = "await-start-preparation-step";

const awaitStartPreparationStep = createStep(
  { name: awaitStartPreparationStepId, async: true, timeout: 60 * 15 },
  async function (_, { container }) {
    const logger = container.resolve("logger");
    logger.info("Awaiting start of preparation...");
  }
);

export default awaitStartPreparationStep;
