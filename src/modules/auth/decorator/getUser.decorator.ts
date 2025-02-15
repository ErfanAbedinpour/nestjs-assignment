import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenService } from '../tokenService/accessToken.service';
import { Request } from 'express';

export const getUser = createParamDecorator(
    (data: keyof typeof AccessTokenService, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<Request>();
        return data ? request.user[data] : request.user;
    },
);
