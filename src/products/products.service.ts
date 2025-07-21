import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dtos/create-product.dto';
import { MediaTarget } from 'src/medias/types/media.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import { MediasService } from 'src/medias/medias.service';
import { UpdateProductDto } from './dtos/update-product.dto';
import { GetProductsQueryDto } from './dtos/get-products-query.dto';
import { PaginationResponse } from 'src/common/dtos/pagination-response.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly mediaService: MediasService,
  ) {}

  async getProducts(
    query: GetProductsQueryDto,
  ): Promise<PaginationResponse<ProductDocument>> {
    const {
      page = 1,
      limit = 10,
      keyword,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: Record<string, any> = {};

    if (keyword) {
      filter.name = { $regex: keyword, $options: 'i' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = maxPrice;
      }
    }

    const sort: Record<string, 1 | -1> = {
      [sortBy ?? 'createdAt']: sortOrder === 'asc' ? 1 : -1,
    };

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('thumbnail images'),
      this.productModel.countDocuments(filter),
    ]);

    return {
      items: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductById(productId: string) {
    const product = await this.productModel.findById(productId).populate([
      { path: 'category', select: 'name' },
      { path: 'thumbnail', select: 'url publicId' },
      { path: 'images', select: 'url publicId' },
      {
        path: 'owner',
        select: 'email name',
        populate: [
          {
            path: 'avatar',
            select: 'url publicId',
          },
        ],
      },
    ]);

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async createProduct(
    dto: CreateProductDto,
    userId: string,
  ): Promise<ProductDocument> {
    const ownerId = new Types.ObjectId(userId);

    const product = await this.productModel.create({
      ...dto,
      owner: ownerId,
      category: new Types.ObjectId(dto.category),
    });

    let medias: string[] = [];

    if (dto.thumbnail) {
      medias = [...medias, dto.thumbnail];
    }

    if (dto.images && dto.images.length > 0) {
      medias = [...medias, ...dto.images];
    }

    if (medias.length > 0) {
      await this.mediaService.updateMediaTarget(
        medias,
        MediaTarget.PRODUCT,
        product._id as Types.ObjectId,
      );
    }

    return product;
  }

  async updateProduct(
    productId: string,
    dto: UpdateProductDto,
    userId: string,
    role: UserRole,
  ): Promise<ProductDocument | null> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.owner.toString() !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You are not allowed to update this product',
      );
    }

    const updateData: Partial<Product> = {
      ...dto,
      category: new Types.ObjectId(dto.category),
      thumbnail: dto.thumbnail ? new Types.ObjectId(dto.thumbnail) : undefined,
      images:
        dto.images && dto.images.length > 0
          ? dto.images.map((img) => new Types.ObjectId(img))
          : undefined,
    };

    await this.productModel.updateOne({ _id: productId }, updateData);

    const medias: string[] = [];

    if (dto.thumbnail) {
      medias.push(dto.thumbnail);
    }

    if (dto.images?.length) {
      medias.push(...dto.images);
    }

    if (medias.length > 0) {
      await this.mediaService.updateMediaTarget(
        medias,
        MediaTarget.PRODUCT,
        new Types.ObjectId(productId),
      );
    }

    return await this.productModel.findById(productId);
  }

  async deleteProduct(
    productId: string,
    userId: string,
    role: UserRole,
  ): Promise<void> {
    const product = await this.productModel.findOne({
      _id: new Types.ObjectId(productId),
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.owner.toString() !== userId && role !== UserRole.ADMIN) {
      throw new UnauthorizedException("Don't have permission to delete");
    }

    const mediaIdsToDelete = [
      ...(product.images || []),
      ...(product.thumbnail ? [product.thumbnail] : []),
    ];

    await this.mediaService.deleteManyMediaByIds(
      mediaIdsToDelete.map((media) => media.toString()),
    );

    await product.deleteOne();
  }
}
