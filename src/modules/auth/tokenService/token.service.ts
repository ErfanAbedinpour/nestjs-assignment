import { UserRole } from "../../../entities/user.entity";

export interface AccessTokenPayload {
    id: number,
    role: UserRole,
    username: string
}

export interface RefreshTokenPayload {
    id: number
}

export abstract class TokenService {
    abstract sign(payload: AccessTokenPayload | RefreshTokenPayload): Promise<string>

    abstract verify(token: string): Promise<AccessTokenPayload | RefreshTokenPayload>
}