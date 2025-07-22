import { IsEnum, IsNumber, IsNumberString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderSortBy, OrderStatus } from '../types/order.enum';
import { SortOrder } from 'src/common/enums/sort-order.enum';

export class GetOrderQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Trường sắp xếp',
    enum: OrderSortBy,
  })
  @IsOptional()
  @IsEnum(OrderSortBy)
  sortBy?: OrderSortBy;

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', enum: SortOrder })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
