
-- Add currency and file_attachments columns to income table
ALTER TABLE public.income 
ADD COLUMN currency TEXT DEFAULT 'USD',
ADD COLUMN file_attachments TEXT[];

-- Create storage bucket for income attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('income-attachments', 'income-attachments', true);

-- Create RLS policies for income attachments bucket
CREATE POLICY "Users can view their own income attachments" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'income-attachments' AND (storage.foldername(name))[1] IN (
  SELECT id::text FROM public.income WHERE user_id = auth.uid()
));

CREATE POLICY "Users can upload their own income attachments" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'income-attachments' AND (storage.foldername(name))[1] IN (
  SELECT id::text FROM public.income WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their own income attachments" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'income-attachments' AND (storage.foldername(name))[1] IN (
  SELECT id::text FROM public.income WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete their own income attachments" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'income-attachments' AND (storage.foldername(name))[1] IN (
  SELECT id::text FROM public.income WHERE user_id = auth.uid()
));
