import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { Model, Types } from 'mongoose';
import { CreatePostDto } from './dtos/create-post.dto';
import { PostSortBy, PostStatus } from './types/post.enum';
import { MediasService } from 'src/medias/medias.service';
import { MediaTarget, MediaType } from 'src/medias/types/media.enum';
import { UpdatePostDto } from './dtos/update-post.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { GetPostsQueryDto } from './dtos/get-post-query.dto';
import { PaginationResponse } from 'src/common/dtos/pagination-response.dto';
import { JSDOM } from 'jsdom';
import { extractPublicId } from 'src/common/utils/cloudinaryUtil';
import { CreatePostIntroduceProductByAIDto } from './dtos/create-post-introduce-product-by-ai.dto';
import { GeminiService } from 'src/gemini/gemini.service';
import { BusinessService } from 'src/business/business.service';
import { CreatePostIntroduceBusinessByAIDto } from './dtos/create-post-introduce-business-by-AI.dto';
import { ToggleVerifyPostDto } from './dtos/toggle-verify-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly mediaService: MediasService,
    private readonly geminiService: GeminiService,
    private readonly businessService: BusinessService,
  ) {}

  async getPosts(
    query: GetPostsQueryDto,
  ): Promise<PaginationResponse<PostDocument>> {
    const {
      keyword,
      status,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '10',
    } = query;

    const filters: any = {};

    if (keyword) {
      filters.title = { $regex: keyword, $options: 'i' };
    }

    if (status) {
      filters.status = status;
    }

    if (category) {
      filters.categories = new Types.ObjectId(category);
    }

    const sortOptions: any = {};
    sortOptions[sortBy ?? PostSortBy.PUBLISHED_AT] =
      sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      this.postModel
        .find(filters)
        .populate('author', 'name email')
        .populate('categories', 'name')
        .populate('thumbnail')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      this.postModel.countDocuments(filters),
    ]);

    return {
      items: posts,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    };
  }

  async createPost(
    dto: CreatePostDto,
    authorId: string,
  ): Promise<PostDocument> {
    const post = await this.postModel.create({
      ...dto,
      author: new Types.ObjectId(authorId),
      publishedAt: dto.status === PostStatus.APPROVED ? new Date() : undefined,
    });

    if (dto.thumbnail) {
      await this.mediaService.updateMediaTarget(
        [dto.thumbnail],
        MediaTarget.POST,
        post._id as Types.ObjectId,
      );
    }

    return post;
  }

  async createPostIntroduceProductByAI(
    authorId: string,
    dto: CreatePostIntroduceProductByAIDto,
    files: Express.Multer.File[],
  ): Promise<{ text: string }> {
    const medias = await Promise.all(
      files.map((file) =>
        this.mediaService.upload(file, MediaType.IMAGE, authorId),
      ),
    );

    if (medias.length === 0)
      throw new InternalServerErrorException('Can not create media');

    const imagesText = medias
      .map((media, idx) => `Ảnh ${idx + 1}: ${media.url}`)
      .join('\n');

    const businessProfile =
      await this.businessService.getBussinessProfileByOwnerId(authorId);

    const prompt = `
    You are a marketing expert. Please write a professional post in Markdown format to introduce a product.
    Product details: 
      ${dto.name && `- Name: ${dto.name}`}
      ${dto.shortDescription && `- Short description: ${dto.shortDescription}`}
      ${dto.mainFeatures && `- Main benefits: ${dto.mainFeatures}`}
      ${dto.price && `- Price: ${dto.price}`}
      ${dto.salePrice && `- Sale Price: ${dto.salePrice}`}
    
    Mapping images: 
      ${imagesText}

    Requirements:
      - Length: Around 300 to 400 words.
      - Professional and persuasive tone suitable for a business website.
      - Incorporate relevant image descriptions where appropriate.
      - End the article with a strong call-to-action to encourage visitors to learn more or make a purchase.

    ${
      businessProfile &&
      `
      Business details: 
      ${businessProfile.name && `- Name: ${businessProfile.name}`}
      ${businessProfile.address && `- address: ${businessProfile.address}`}
      ${businessProfile.phone && `- Name: ${businessProfile.phone}`}`
    }
    `;

    return await this.geminiService.generateTextFromMultiModal(prompt, files);
  }

  async createPostIntroduceBusinessByAI(
    authorId: string,
    dto: CreatePostIntroduceBusinessByAIDto,
    files: Express.Multer.File[],
  ): Promise<{ text: string }> {
    const medias = await Promise.all(
      files.map((file) =>
        this.mediaService.upload(file, MediaType.IMAGE, authorId),
      ),
    );

    if (medias.length === 0)
      throw new InternalServerErrorException('Can not create media');

    const imagesText = medias
      .map((media, idx) => `Ảnh ${idx + 1}: ${media.url}`)
      .join('\n');

    const businessProfile =
      await this.businessService.getBussinessProfileByOwnerId(authorId);

    const prompt = `
    You are a marketing expert. Please write a professional post in Markdown format to introduce a product.
    
    ${
      businessProfile &&
      `
      Business details: 
      ${businessProfile.name && `- Name: ${businessProfile.name}`}
      ${businessProfile.address && `- address: ${businessProfile.address}`}
      ${businessProfile.phone && `- Name: ${businessProfile.phone}`}`
    }
    
    Mapping images: 
      ${imagesText}

    Requirements:
      - Length: Around 300 to 400 words.
      - Professional and persuasive tone suitable for a business website.
      - Incorporate relevant image descriptions where appropriate.
      - End the article with a strong call-to-action to encourage visitors to learn more or make a purchase.

    
    `;

    return await this.geminiService.generateTextFromMultiModal(prompt, files);
  }

  async updatePost(
    postId: string,
    authorId: string,
    role: UserRole,
    dto: UpdatePostDto,
  ): Promise<PostDocument> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.toString() !== authorId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('You are not allowed to edit this post');
    }

    if (dto.title !== undefined) post.title = dto.title;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.categories !== undefined)
      post.categories = dto.categories.map((id) => new Types.ObjectId(id));
    if (dto.status !== undefined) {
      post.status = dto.status;

      if (dto.status === PostStatus.APPROVED && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }
    if (dto.priority !== undefined) post.priority = dto.priority;
    if (dto.thumbnail !== undefined)
      post.thumbnail = new Types.ObjectId(dto.thumbnail);

    await post.save();
    return post;
  }

  async deletePost(postId: string, authorId: string, role: UserRole) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    if (post.author.toString() !== authorId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('No permission to delete post');
    }

    // Xóa cloudinary file và media tương ứng
    if (post.content) {
      const dom = new JSDOM(post.content);
      const images = dom.window.document.querySelectorAll('img');

      const publicIds: string[] = [];
      for (const img of images) {
        const url = img.getAttribute('src');
        if (url?.includes('res.cloudinary.com')) {
          const publicId = extractPublicId(url);
          if (publicId) {
            publicIds.push(publicId);
          }
        }
      }

      if (publicIds.length > 0) {
        await this.mediaService.deleteMediasByPublicIds(publicIds);
      }
    }

    if (post.thumbnail) {
      await this.mediaService.deleteMedia(post.thumbnail.toString());
    }

    await this.postModel.deleteOne({ _id: post._id });
  }

  async toggleStatusPost(postId: string, dto: ToggleVerifyPostDto) {
    const post = await this.postModel.findById(postId);

    if (!post) throw new NotFoundException('Post not found');

    post.status = dto.status;
    const updatedStatusPost = await post.save();

    return {
      post: updatedStatusPost,
      message: dto.message,
    };
  }
}
