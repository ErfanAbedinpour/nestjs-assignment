import { Module } from '@nestjs/common';
import { internalImports } from './imports/internal.import';
import { externalImports } from './imports/external.import';

@Module({
  imports: [...internalImports, ...externalImports],
})
export class AppModule { }
