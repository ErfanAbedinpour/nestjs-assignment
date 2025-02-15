import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { AccessTokenService } from "../tokenService/accessToken.service";
import { JsonWebTokenError } from "@nestjs/jwt";
import { AccessTokenPayload } from "../tokenService/token.service";


@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(private readonly accessTokenService: AccessTokenService) { }

    private readonly INVALID_HEADER = "please enter bearer Header"
    private readonly INVALID_TOKEN = "token invalid or expired."
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.getAuthHeader(request);
        if (!token)
            throw new ForbiddenException(this.INVALID_HEADER)

        try {

            const payload = await this.accessTokenService.verify(token);
            request.user = payload;

        } catch (err) {
            if (err instanceof JsonWebTokenError) {
                throw new ForbiddenException(this.INVALID_TOKEN)
            }
        }

        return true;
    }


    private getAuthHeader(req: Request) {
        const [_, token] = req.headers.authorization?.split(' ') || []
        return token
    }
}


declare global {
    namespace Express {
        interface Request {
            user: AccessTokenPayload
        }
    }
}