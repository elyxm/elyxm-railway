import { MedusaService } from "@medusajs/utils";
import Invitation from "./models/invitation";

class InvitationModuleService extends MedusaService({
  Invitation,
}) {
  // No custom methods - all business logic moved to workflows
}

export default InvitationModuleService;
