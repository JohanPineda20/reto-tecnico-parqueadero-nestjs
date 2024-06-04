import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { Payload } from "src/common/interfaces/payload";

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
   const req = ctx.switchToHttp().getRequest();
   return req.user;
})