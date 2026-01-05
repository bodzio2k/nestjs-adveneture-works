import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: {
    skip?: number;
    take?: number;
    name?: string;
    color?: string;
  }) {
    const { skip, take, name, color } = params || {};

    const where: any = {};

    if (name) {
      where.Name = {
        contains: name,
      };
    }

    if (color) {
      where.Color = color;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: {
          Name: 'asc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      total,
      skip: skip || 0,
      take: take || total,
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { ProductID: id },
      include: {
        SalesOrderDetails: {
          take: 10,
          orderBy: {
            ModifiedDate: 'desc',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async getProductColors() {
    const colors = await this.prisma.product.findMany({
      where: {
        Color: {
          not: null,
        },
      },
      select: {
        Color: true,
      },
      distinct: ['Color'],
      orderBy: {
        Color: 'asc',
      },
    });

    return colors.map((c) => c.Color).filter(Boolean);
  }
}
