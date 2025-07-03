-- Supabase Database Setup for Lan Wellness Website
-- Run these SQL commands in your Supabase SQL Editor

-- Create contacts table for contact form submissions
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    telefon VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    mesej TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table for appointment bookings
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    telefon VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    perkhidmatan VARCHAR(100) NOT NULL,
    tarikh DATE NOT NULL,
    masa TIME NOT NULL,
    catatan TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table for tracking website interactions
CREATE TABLE IF NOT EXISTS analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    page_url TEXT,
    user_agent TEXT,
    action VARCHAR(255),
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create testimonials table for customer reviews (optional)
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT NOT NULL,
    perkhidmatan VARCHAR(100),
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous users to insert data
-- Policy for contacts table (allow anonymous inserts)
CREATE POLICY "Allow anonymous contact submissions" ON contacts
    FOR INSERT WITH CHECK (true);

-- Policy for bookings table (allow anonymous inserts)
CREATE POLICY "Allow anonymous booking submissions" ON bookings
    FOR INSERT WITH CHECK (true);

-- Policy for analytics table (allow anonymous inserts)
CREATE POLICY "Allow anonymous analytics tracking" ON analytics
    FOR INSERT WITH CHECK (true);

-- Policy for testimonials table (allow anonymous inserts, admin approval needed)
CREATE POLICY "Allow anonymous testimonial submissions" ON testimonials
    FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_tarikh ON bookings(tarikh);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(approved);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - remove if not needed)
INSERT INTO testimonials (nama, rating, review, perkhidmatan, approved) VALUES
('Siti Ahmad', 5, 'Sangat berpuas hati dengan perkhidmatan Lan. Penyembuhan mistik benar-benar berkesan!', 'penyembuhan_mistik', true),
('Ahmad Rahman', 5, 'Urutan tradisional yang terbaik di KL. Lan memang pakar dalam bidang ini.', 'urutan_tradisional', true),
('Lisa Tan', 4, 'Terapi holistik sangat membantu mengurangkan stress. Akan datang lagi!', 'terapi_holistik', true);

-- Create view for dashboard statistics (for admin use)
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM contacts) as total_contacts,
    (SELECT COUNT(*) FROM bookings) as total_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as confirmed_bookings,
    (SELECT COUNT(*) FROM analytics WHERE event_type = 'page_view') as total_page_views,
    (SELECT COUNT(*) FROM testimonials WHERE approved = true) as approved_testimonials;

-- Create view for popular services
CREATE OR REPLACE VIEW popular_services AS
SELECT 
    perkhidmatan,
    COUNT(*) as booking_count,
    AVG(CASE WHEN t.rating IS NOT NULL THEN t.rating END) as avg_rating
FROM bookings b
LEFT JOIN testimonials t ON b.perkhidmatan = t.perkhidmatan AND t.approved = true
GROUP BY perkhidmatan
ORDER BY booking_count DESC;

-- Grant permissions for views (if using authenticated users later)
-- GRANT SELECT ON dashboard_stats TO authenticated;
-- GRANT SELECT ON popular_services TO authenticated;

COMMENT ON TABLE contacts IS 'Stores contact form submissions from website visitors';
COMMENT ON TABLE bookings IS 'Stores appointment booking requests from customers';
COMMENT ON TABLE analytics IS 'Tracks website interactions and page views for insights';
COMMENT ON TABLE testimonials IS 'Stores customer reviews and ratings (requires admin approval)';

-- Final message
SELECT 'Supabase database setup completed successfully!' as message; 