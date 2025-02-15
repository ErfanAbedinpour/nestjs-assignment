import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../auth/dto/create-auth.dto';

export class UpdateUserDto extends OmitType(CreateUserDto, ["username"]) { }
