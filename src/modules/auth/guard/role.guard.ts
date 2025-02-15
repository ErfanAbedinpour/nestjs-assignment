import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLE_TOKEN } from "../decorator/role.decorator";
import { UserRole } from "../../../entities/user.entity";
import { Request } from "express";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }
    canActivate(context: ExecutionContext) {
        const roleMeta = this.reflector.getAllAndOverride<UserRole[]>(ROLE_TOKEN, [context.getHandler(), context.getClass()])
        if (!roleMeta)
            return true;

        const req = context.switchToHttp().getRequest<Request>();

        const isValidRole = roleMeta.some(role => role === req.user.role);
        if (!isValidRole)
            throw new ForbiddenException('you cannot access this route')

        return true;
    }
}