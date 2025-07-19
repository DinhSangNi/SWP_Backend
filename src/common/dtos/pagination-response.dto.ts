import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponse<T> {
  @ApiProperty({ description: 'Mảng kết quả trả về' })
  items: T[];

  @ApiProperty({ example: 1, description: 'Trang hiện tại' })
  page: number;

  @ApiProperty({ example: 10, description: 'Số lượng mục mỗi trang' })
  limit: number;

  @ApiProperty({ example: 100, description: 'Tổng số lượng tất cả kết quả' })
  total: number;

  @ApiProperty({ example: 10, description: 'Tổng số trang' })
  totalPages: number;

  constructor(partial: Partial<PaginationResponse<T>>) {
    Object.assign(this, partial);
  }
}
