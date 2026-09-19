import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { diskStorage } from 'multer';
import { randomBytes } from 'crypto';
import { BadRequestException } from '@nestjs/common';

export const UPLOADS_DIR = join(process.cwd(), 'uploads');
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

/** Shared disk-storage Multer options for any image upload (listing photos,
 * avatars, ...). `fieldErrorKey` names the field the rejection error is
 * reported under, so it slots into the usual { field: [message] } shape. */
export function imageUploadOptions(fieldErrorKey: string, maxFiles = 1) {
  return {
    storage: diskStorage({
      destination: UPLOADS_DIR,
      filename: (_req, file, callback) => {
        const ext = file.originalname.split('.').pop();
        const name = randomBytes(16).toString('hex');
        callback(null, `${name}.${ext}`);
      },
    }),
    limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: maxFiles },
    fileFilter: (
      _req: unknown,
      file: Express.Multer.File,
      callback: (error: Error | null, accept: boolean) => void,
    ) => {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        callback(
          new BadRequestException({ [fieldErrorKey]: ['Only JPEG, PNG, WEBP, or GIF images are allowed.'] }),
          false,
        );
        return;
      }
      callback(null, true);
    },
  };
}
