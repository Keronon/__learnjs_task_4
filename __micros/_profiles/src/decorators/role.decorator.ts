import { SetMetadata } from "@nestjs/common";

export const ROLES_DECOR = `roles`;

export const Roles = (...roles: string[]) => SetMetadata( ROLES_DECOR, roles );