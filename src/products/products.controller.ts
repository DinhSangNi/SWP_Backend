import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/common/decorators/role.decorator';
import { CreateProductDto } from './dtos/create-product.dto';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UpdateProductDto } from './dtos/update-product.dto';
import { GetProductsQueryDto } from './dtos/get-products-query.dto';

@ApiTags('Product')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(@Query() query: GetProductsQueryDto, @Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      message: 'Get products successfully',
      metadata: await this.productsService.getProducts(query),
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('business', 'admin')
  async createProduct(
    @Body() body: CreateProductDto,
    @Req()
    req: {
      user: {
        userId: string;
      };
    },
    @Res() res: Response,
  ) {
    const { userId } = req.user;
    return res.status(HttpStatus.CREATED).json({
      message: 'Create product successfully',
      metadata: await this.productsService.createProduct(body, userId),
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('business', 'admin')
  async updateProduct(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
    @Req() req: { user: { userId: string; role: UserRole } },
    @Res() res: Response,
  ) {
    const { userId, role } = req.user;
    const product = await this.productsService.updateProduct(
      id,
      body,
      userId,
      role,
    );
    return res.status(HttpStatus.OK).json({
      message: 'Update product successfully',
      metadata: product,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('business', 'admin')
  async deleteProduct(
    @Param('id') productId: string,
    @Req()
    req: {
      user: {
        userId: string;
        role: UserRole;
      };
    },
    @Res() res: Response,
  ) {
    const { userId, role } = req.user;
    return res.status(HttpStatus.OK).json({
      message: 'Delete product successfully',
      metadata: await this.productsService.deleteProduct(
        productId,
        userId,
        role,
      ),
    });
  }
}
