import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // set validation Pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  app.setGlobalPrefix("v1");
  // added version
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "v1"
  })
  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    console.log(`server run on http://localhost:${port}`)
  });
}
bootstrap();
