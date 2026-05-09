import * as dotenv from 'dotenv';
dotenv.config();
import { S3Client, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  }
});
const bucket = process.env.AWS_S3_BUCKET;
console.log('Bucket:', bucket, 'Region:', process.env.AWS_REGION);

const key = 'videos/6951515eb08e6cc6cab529bc/1766938223009-1_Introduction.mp4';
try {
  const cmd = new HeadObjectCommand({ Bucket: bucket, Key: key });
  const res = await client.send(cmd);
  console.log('FILE EXISTS:', res.ContentType, 'size:', res.ContentLength);
} catch(e) {
  console.log('ERROR:', e.name, e.message);
}

// Also list files in the instructor's folder
try {
  const listCmd = new ListObjectsV2Command({ Bucket: bucket, Prefix: 'videos/6951515eb08e6cc6cab529bc/', MaxKeys: 10 });
  const listRes = await client.send(listCmd);
  console.log('Files in instructor folder:');
  listRes.Contents?.forEach(f => console.log(' -', f.Key, f.Size));
  if (!listRes.Contents?.length) console.log('  (empty)');
} catch(e) {
  console.log('LIST ERROR:', e.name, e.message);
}
