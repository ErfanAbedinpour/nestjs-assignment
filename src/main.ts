import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // set validation Pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  app.setGlobalPrefix("api");

  // config swagger
  const config = new DocumentBuilder()
    .setTitle('Nadin-Soft')
    .setDescription('the Api For Nestjs Assingment')
    .setVersion('2.0.1')
    .addTag('Task Managment')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, documentFactory);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    console.log(`server run on http://localhost:${port}`)
    console.log(`OpenApi http://localhost:${port}/doc`)
  });
}
bootstrap();
