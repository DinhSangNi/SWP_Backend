import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dtos/create-product.dto';
import { Media, MediaDocument } from 'src/medias/schemas/media.schema';
import { MediaTarget } from 'src/medias/types/media.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import { MediasService } from 'src/medias/medias.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

    @InjectModel(Media.name)
    private readonly mediaService: MediasService,
  ) {}

  async createProduct(
    dto: CreateProductDto,
    userId: string,
  ): Promise<ProductDocument> {
    const ownerId = new Types.ObjectId(userId);

    const product = await this.productModel.create({
      ...dto,
      owner: ownerId,
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

    if (
      product.owner !== new Types.ObjectId(userId) &&
      role !== UserRole.ADMIN
    ) {
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
