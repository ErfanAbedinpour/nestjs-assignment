import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AccessTokenGuard } from "./accessToken.guard";
import { Reflector } from "@nestjs/core";
import { AUTH_TOKEN, AuthStrategy } from "../decorator/auth.decorator";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private readonly reflector: Reflector, private readonly accessTokenGuard: AccessTokenGuard) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const strategy = this.reflector.getAllAndOverride<AuthStrategy[]>(AUTH_TOKEN, [context.getHandler(), context.getClass()]) ?? [AuthStrategy.NONE];



        for (const s of strategy) {
            if (s === AuthStrategy.Bearer) {
                try {
                    await this.accessTokenGuard.canActivate(context)
                } catch (err) {
                    throw err
                }
            }
        }

        return true
    }
}