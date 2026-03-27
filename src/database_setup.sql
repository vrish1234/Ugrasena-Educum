-- Create company_info table
CREATE TABLE IF NOT EXISTS company_info (
  id SERIAL PRIMARY KEY,
  contact_number TEXT,
  email_address TEXT,
  office_address TEXT,
  notice_board TEXT,
  about_us TEXT,
  logo_url TEXT
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  video_link TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  school TEXT NOT NULL,
  mobile TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- company_info policies
CREATE POLICY "Allow public read access on company_info" ON company_info FOR SELECT USING (true);
CREATE POLICY "Allow authenticated all access on company_info" ON company_info FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- posts policies
CREATE POLICY "Allow public read access on posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Allow public update likes on posts" ON posts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all access on posts" ON posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- notifications policies
CREATE POLICY "Allow public read access on notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow authenticated all access on notifications" ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- registrations policies
CREATE POLICY "Allow public insert on registrations" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated all access on registrations" ON registrations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create team table
CREATE TABLE IF NOT EXISTS team (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- team policies
CREATE POLICY "Allow public read access on team" ON team FOR SELECT USING (true);
CREATE POLICY "Allow authenticated all access on team" ON team FOR ALL TO authenticated USING (true) WITH CHECK (true);
