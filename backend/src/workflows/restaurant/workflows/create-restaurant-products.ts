import { Modules } from "@medusajs/framework/utils";
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createProductsWorkflow, createRemoteLinkStep } from "../../../../node_modules/@medusajs/core-flows";
import { RESTAURANT_MODULE } from "../../../modules/restaurant";
import { CreateRestaurantProductDTO } from "../../../modules/restaurant/types/mutations";

const createRestaurantProductsWorkflowId = "create-restaurant-products-workflow";

const createRestaurantProductsWorkflow = createWorkflow(
  createRestaurantProductsWorkflowId,
  function (input: CreateRestaurantProductDTO) {
    const products = createProductsWorkflow.runAsStep({
      input: {
        products: input.products,
      },
    });

    const links = transform(
      {
        products,
        input,
      },
      (data) =>
        data.products.map((product) => ({
          [RESTAURANT_MODULE]: {
            restaurant_id: data.input.restaurant_id,
          },
          [Modules.PRODUCT]: {
            product_id: product.id,
          },
        }))
    );

    createRemoteLinkStep(links);

    return new WorkflowResponse(links);
  }
);

export default createRestaurantProductsWorkflow;
