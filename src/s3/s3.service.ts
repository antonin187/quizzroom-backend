import { Injectable } from '@nestjs/common';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  private bucket = process.env.AWS_BUCKET_NAME;

  // ✅ Génère une URL signée pour lire un fichier (GET)
  async getSignedUrl(key: string): Promise<{
    url: string;
    mimeType: string | null;
  }> {
    // 1️⃣ récupérer les métadonnées
    const head = await this.s3.send(
      new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    // 2️⃣ générer l’URL signée
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.s3, command, {
      expiresIn: 60 * 5,
    });

    return {
      url,
      mimeType: head.ContentType ?? null,
    };
  }

  // ✅ Génère une URL signée pour uploader un fichier (PUT)
  async getUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const response = await getSignedUrl(this.s3, command, {
      expiresIn: 60 * 5,
    });

    return { uploadUrl: response };
  }
}
