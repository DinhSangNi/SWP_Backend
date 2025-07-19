import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(
    file: Express.Multer.File,
    resourceType: 'image' | 'video' | 'raw' = 'image',
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    try {
      return new Promise<UploadApiResponse | UploadApiErrorResponse>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: resourceType },
            (error, result) => {
              if (error) return reject(error);
              if (result) resolve(result);
            },
          );

          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        },
      );
    } catch (error) {
      throw new Error('Cloudinary upload error: ' + error.message);
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new Error('Cloudinary delete error: ' + error.message);
    }
  }
}
