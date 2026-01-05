import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: {
    skip?: number;
    take?: number;
    customerId?: number;
    status?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const { skip, take, customerId, status, dateFrom, dateTo } = params || {};

    const where: any = {};

    if (customerId) {
      where.CustomerID = customerId;
    }

    if (status !== undefined) {
      where.Status = status;
    }

    if (dateFrom || dateTo) {
      where.OrderDate = {};
      if (dateFrom) {
        where.OrderDate.gte = dateFrom;
      }
      if (dateTo) {
        where.OrderDate.lte = dateTo;
      }
    }

    const [orders, total] = await Promise.all([
      this.prisma.salesOrderHeader.findMany({
        where,
        skip,
        take,
        orderBy: {
          OrderDate: 'desc',
        },
        select: {
          SalesOrderID: true,
          OrderDate: true,
          DueDate: true,
          ShipDate: true,
          Status: true,
          OnlineOrderFlag: true,
          PurchaseOrderNumber: true,
          AccountNumber: true,
          CustomerID: true,
          SubTotal: true,
          TaxAmt: true,
          Freight: true,
          Comment: true,
        },
      }),
      this.prisma.salesOrderHeader.count({ where }),
    ]);

    return {
      data: orders,
      total,
      skip: skip || 0,
      take: take || total,
    };
  }

  async findOne(id: number) {
    const order = await this.prisma.salesOrderHeader.findUnique({
      where: { SalesOrderID: id },
      include: {
        SalesOrderDetails: {
          include: {
            Product: {
              select: {
                ProductID: true,
                Name: true,
                ProductNumber: true,
                Color: true,
                ListPrice: true,
              },
            },
          },
          orderBy: {
            SalesOrderDetailID: 'asc',
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }

    // Calculate totals
    const itemsTotal = order.SalesOrderDetails.reduce(
      (sum, detail) => sum + Number(detail.UnitPrice) * detail.OrderQty,
      0,
    );
    const discountTotal = order.SalesOrderDetails.reduce(
      (sum, detail) => sum + Number(detail.UnitPriceDiscount) * detail.OrderQty,
      0,
    );

    return {
      ...order,
      summary: {
        itemsTotal,
        discountTotal,
        subTotal: Number(order.SubTotal),
        taxAmount: Number(order.TaxAmt),
        freight: Number(order.Freight),
        grandTotal: Number(order.SubTotal) + Number(order.TaxAmt) + Number(order.Freight),
      },
    };
  }

  async getOrderStatistics(customerId?: number) {
    const where: any = customerId ? { CustomerID: customerId } : {};

    const [totalOrders, totalRevenue, statusBreakdown] = await Promise.all([
      this.prisma.salesOrderHeader.count({ where }),
      this.prisma.salesOrderHeader.aggregate({
        where,
        _sum: {
          SubTotal: true,
          TaxAmt: true,
          Freight: true,
        },
      }),
      this.prisma.salesOrderHeader.groupBy({
        by: ['Status'],
        where,
        _count: {
          Status: true,
        },
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: {
        subTotal: Number(totalRevenue._sum.SubTotal || 0),
        tax: Number(totalRevenue._sum.TaxAmt || 0),
        freight: Number(totalRevenue._sum.Freight || 0),
        total:
          Number(totalRevenue._sum.SubTotal || 0) +
          Number(totalRevenue._sum.TaxAmt || 0) +
          Number(totalRevenue._sum.Freight || 0),
      },
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s.Status,
        count: s._count.Status,
      })),
    };
  }
}
