import { SetMetadata } from "@nestjs/common";

export const SELF_DECOR = `self`;

export const Self = () => SetMetadata( SELF_DECOR, true );