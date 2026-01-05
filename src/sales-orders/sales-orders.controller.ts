import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';

@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.salesOrdersService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      customerId: customerId ? parseInt(customerId, 10) : undefined,
      status: status ? parseInt(status, 10) : undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });
  }

  @Get('statistics')
  async getStatistics(@Query('customerId') customerId?: string) {
    return this.salesOrdersService.getOrderStatistics(
      customerId ? parseInt(customerId, 10) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesOrdersService.findOne(id);
  }
}
