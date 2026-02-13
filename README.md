# Audio Processing Workflow with Supabase Integration

## Overview

This system processes audio files uploaded by users, converts them to HLS format with multiple quality levels, generates transcripts, and updates the database with the final streaming URL.

## Workflow

```
1. User uploads audio file via Next.js form
   ↓
2. Next.js creates song record in Supabase (status: 'processing')
   ↓
3. Next.js uploads audio to S3 temp bucket with pattern: songs/{userId}/{songId}-{slug}.mp3
   ↓
4. S3 triggers SQS notification
   ↓
5. Python worker picks up job from SQS
   ↓
6. Python processes audio (transcoding, transcription)
   ↓
7. Python uploads HLS files to production S3 bucket
   ↓
8. Python updates Supabase with base URL (status: 'ready')
   ↓
9. User can now stream the song at {baseUrl}/master.m3u8
```

## Key Features

### 1. Predictable S3 Key Pattern
- **Pattern**: `songs/{userId}/{songId}-{slug}.ext`
- **Example**: `songs/user_123/a1b2c3d4-my-awesome-song.mp3`
- This allows Python to extract the `songId` and update the correct database record

### 2. Base URL Storage
Instead of storing the full path to `master.m3u8`, we store just the base URL:
- **Stored in DB**: `https://your-bucket.s3.amazonaws.com/a1b2c3d4-my-awesome-song`
- **Client constructs**: `{baseUrl}/master.m3u8` for master playlist
- **Benefits**: 
  - Cleaner URLs
  - Easy to construct paths for captions: `{baseUrl}/captions.vtt`
  - Flexible for future file additions

### 3. Status Tracking
Songs have three statuses:
- `processing`: Initial state when song is uploaded
- `ready`: Processing complete, ready to stream
- `failed`: Processing failed (error stored in error_message)

## Setup Instructions

### 1. Database Migration
Run the SQL migration in Supabase:

```sql
-- See supabase_migration.sql
ALTER TABLE songs 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'processing',
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS error_message TEXT;
```

### 2. Environment Variables

#### Next.js (.env.local)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AWS (for uploading to temp bucket)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-south-1
TEMP_BUCKET_NAME=your-temp-bucket
```

#### Python (.env)
```bash
# AWS
SQS_URL=https://sqs.ap-south-1.amazonaws.com/123456789/your-queue
AWS_REGION=ap-south-1
TEMP_BUCKET_NAME=your-temp-bucket
PRODUCTION_BUCKET_NAME=your-production-bucket

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key  # Use service role, not anon key!

# Optional: CloudFront
CLOUDFRONT_DOMAIN=d1234567890abc.cloudfront.net
```

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure S3 Bucket Events
Set up S3 event notification on temp bucket:
- Event: `s3:ObjectCreated:*`
- Prefix: `songs/`
- Destination: SQS Queue

## File Structure After Processing

```
Production S3 Bucket:
└── a1b2c3d4-my-awesome-song/
    ├── master.m3u8          # Master playlist
    ├── captions.vtt         # Transcript
    ├── 32k/
    │   ├── playlist.m3u8
    │   ├── segment_000.ts
    │   ├── segment_001.ts
    │   └── ...
    ├── 64k/
    │   ├── playlist.m3u8
    │   └── ...
    └── 128k/
        ├── playlist.m3u8
        └── ...
```

## Usage in Frontend

```typescript
// Fetch song from Supabase
const { data: song } = await supabase
  .from('songs')
  .select('*')
  .eq('id', songId)
  .single();

// Check if ready
if (song.status === 'ready') {
  const hlsUrl = `${song.songUrl}/master.m3u8`;
  const captionsUrl = `${song.songUrl}/captions.vtt`;
  
  // Use with video.js, hls.js, or native HLS support
  videoElement.src = hlsUrl;
}

// Show processing state
if (song.status === 'processing') {
  console.log('Song is still processing...');
}

// Handle errors
if (song.status === 'failed') {
  console.error('Processing failed:', song.error_message);
}
```

## Error Handling

### Next.js
- If Supabase insert fails, no file is uploaded to S3
- Returns error to user immediately

### Python
- If processing fails, song status is set to 'failed'
- Error message is stored in database
- SQS message is NOT deleted (will retry)
- After multiple retries, message goes to Dead Letter Queue (configure in AWS)

## Monitoring

### Check Processing Status
```sql
-- See all processing songs
SELECT id, title, status, created_at 
FROM songs 
WHERE status = 'processing'
ORDER BY created_at DESC;

-- See failed songs
SELECT id, title, error_message, created_at 
FROM songs 
WHERE status = 'failed';
```

### Python Logs
The Python worker logs all operations:
- `🆔 Song ID: abc123` - Extracted song ID
- `📁 Output folder: abc123-my-song` - Folder name in prod bucket
- `🔗 Base URL: https://...` - Final URL stored in database
- `✅ Supabase updated successfully` - DB update confirmation

## Security Notes

1. **Service Role Key**: Python uses `SUPABASE_SERVICE_KEY` because it needs to bypass Row Level Security (RLS) to update any song
2. **Anon Key**: Next.js uses `SUPABASE_ANON_KEY` with RLS to ensure users can only create their own songs
3. **S3 Bucket Policies**: Ensure temp bucket is private, production bucket can be public-read if using direct S3 URLs

## Optimization Tips

1. **Use CloudFront**: Set `CLOUDFRONT_DOMAIN` to serve files via CDN
2. **Batch Processing**: Increase `MaxNumberOfMessages` in SQS if you want to process multiple files in parallel
3. **Faster Transcription**: Use GPU if available by changing `device="cpu"` to `device="cuda"`
4. **Quality Profiles**: Adjust `QUALITY_PROFILES` array to add/remove quality levels

## Troubleshooting

### Song stuck in 'processing'
- Check Python worker logs
- Check SQS queue for messages
- Verify S3 event notification is configured

### Wrong songUrl in database
- Check S3 key pattern matches: `songs/{userId}/{songId}-{slug}.mp3`
- Verify song ID extraction regex in Python

### Cannot access HLS stream
- Check S3 bucket CORS settings
- Verify bucket permissions (public-read or CloudFront access)
- Test URL: `{baseUrl}/master.m3u8` should return a text file