import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** The authenticated principal attached to the request by `JwtStrategy.validate`. */
export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Extracts the authenticated user (or one of its fields) from the request.
 *
 *   findAll(@CurrentUser('id') userId: string)   // just the id
 *   me(@CurrentUser() user: AuthUser)             // the whole principal
 *
 * Keeps controllers from reaching into `req.user` by hand.
 */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | string => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    const user = request.user;
    return field ? user[field] : user;
  },
);
