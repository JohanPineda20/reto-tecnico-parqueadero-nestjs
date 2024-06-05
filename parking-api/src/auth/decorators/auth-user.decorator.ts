import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
   const req = ctx.switchToHttp().getRequest();
   return req.user;
})