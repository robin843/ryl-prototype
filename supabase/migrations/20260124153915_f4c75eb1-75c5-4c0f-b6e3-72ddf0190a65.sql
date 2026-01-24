-- Make the media bucket public for faster video delivery
UPDATE storage.buckets 
SET public = true 
WHERE id = 'media';