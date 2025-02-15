import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenService } from '../tokenService/accessToken.service';
import { Request } from 'express';
import { AccessTokenPayload } from '../tokenService/token.service';

export const getUser = createParamDecorator(
    (data: keyof AccessTokenPayload, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<Request>();
        return data ? request.user?.[data] : request.user ?? null;
    },
);
