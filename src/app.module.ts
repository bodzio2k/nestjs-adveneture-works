import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';

@Module({
  imports: [PrismaModule, ProductsModule, SalesOrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
