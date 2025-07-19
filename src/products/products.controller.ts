import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Post,
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

@ApiTags('Product')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

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

  @Delete('id')
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
