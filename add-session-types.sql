-- Add session_type and max_participants columns to services table
ALTER TABLE services
ADD COLUMN session_type TEXT DEFAULT 'one-on-one',
ADD COLUMN max_participants INTEGER DEFAULT 1;