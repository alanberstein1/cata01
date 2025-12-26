-- Supabase Schema for cata01
-- Run this in Supabase Dashboard > SQL Editor

-- Template Styles table
CREATE TABLE template_styles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Library Items table
CREATE TABLE library_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT,
  short_description_en TEXT,
  short_description_es TEXT,
  long_description_en TEXT,
  long_description_es TEXT,
  associated_styles UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Templates table
CREATE TABLE family_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  style_id UUID REFERENCES template_styles(id),
  members JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE template_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read template_styles" ON template_styles FOR SELECT USING (true);
CREATE POLICY "Allow public insert template_styles" ON template_styles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update template_styles" ON template_styles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete template_styles" ON template_styles FOR DELETE USING (true);

CREATE POLICY "Allow public read library_items" ON library_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert library_items" ON library_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update library_items" ON library_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete library_items" ON library_items FOR DELETE USING (true);

CREATE POLICY "Allow public read family_templates" ON family_templates FOR SELECT USING (true);
CREATE POLICY "Allow public insert family_templates" ON family_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update family_templates" ON family_templates FOR UPDATE USING (true);
CREATE POLICY "Allow public delete family_templates" ON family_templates FOR DELETE USING (true);

-- Create storage bucket for library item images
-- Note: Storage bucket needs to be created via Dashboard > Storage > New bucket
-- Name: library-items
-- Public: Yes
