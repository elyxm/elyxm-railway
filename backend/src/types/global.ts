// Extend MedusaRequest with custom properties for RBAC
declare global {
  namespace Express {
    interface Request {
      permissionContext?: {
        userId: string;
        clientId?: string;
        resource: string;
        action: string;
        hasPermission: boolean;
        isPlatformAdmin?: boolean;
      };
      clientContext?: {
        userId: string;
        clientIds: string[];
        isPlatformUser: boolean;
      };
    }
  }
}

export {};
