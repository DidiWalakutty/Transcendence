import { Module } from '@nestjs/common';
import { TRPCModule } from 'nestjs-trpc';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExampleRouter } from './trpc.router';

@Module({
  imports: [
    TRPCModule.forRoot({
      basePath: '/api/trpc',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ExampleRouter],
})
export class AppModule {}
