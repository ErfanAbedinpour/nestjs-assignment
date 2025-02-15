import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../auth/dto/create-auth.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) { }
