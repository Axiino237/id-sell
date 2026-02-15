-- Create the 'products' storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);

-- Policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'products' );

-- Policy to allow public access to view images
CREATE POLICY "Public access to product images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'products' );

-- Policy to allow users to delete their own images (optional, good practice)
CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1] );
