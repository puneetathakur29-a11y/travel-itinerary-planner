-- ====================================================================
-- Personalized Travel Itinerary Planner: Supabase Database Schema
-- Supports User Isolation, Shared Collaboration & RLS Policies
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    preferred_currency TEXT DEFAULT 'USD',
    default_travel_style TEXT DEFAULT 'solo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TRIPS TABLE
CREATE TABLE IF NOT EXISTS public.trips (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    duration_days INT NOT NULL DEFAULT 3,
    travel_style TEXT NOT NULL DEFAULT 'solo', -- 'solo', 'couple', 'friends', 'family'
    group_size INT NOT NULL DEFAULT 1,
    budget_tier TEXT NOT NULL DEFAULT 'moderate', -- 'budget', 'moderate', 'luxury', 'ultra_luxury'
    pacing TEXT NOT NULL DEFAULT 'balanced', -- 'relaxed', 'balanced', 'packed'
    summary TEXT,
    accommodation JSONB,
    logistics JSONB,
    cost_breakdown JSONB,
    days JSONB NOT NULL DEFAULT '[]'::jsonb,
    share_token TEXT UNIQUE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TRIP COLLABORATORS TABLE (Group Planning / Scenario 3)
CREATE TABLE IF NOT EXISTS public.trip_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id TEXT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor', -- 'viewer', 'editor', 'owner'
    status TEXT NOT NULL DEFAULT 'accepted', -- 'pending', 'accepted'
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (trip_id, email)
);

-- 5. TRIP BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.trip_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trip_id TEXT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, trip_id)
);

-- 6. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_destination ON public.trips(destination);
CREATE INDEX IF NOT EXISTS idx_trips_share_token ON public.trips(share_token);
CREATE INDEX IF NOT EXISTS idx_collaborators_trip ON public.trip_collaborators(trip_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_email ON public.trip_collaborators(email);

-- 7. AUTOMATIC TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_trips_updated_at ON public.trips;
CREATE TRIGGER set_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_bookmarks ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Trips Policies
CREATE POLICY "Users can view their own trips or public/shared trips"
    ON public.trips FOR SELECT
    USING (
        auth.uid() = user_id OR
        is_public = TRUE OR
        EXISTS (
            SELECT 1 FROM public.trip_collaborators tc
            WHERE tc.trip_id = trips.id AND (tc.user_id = auth.uid() OR tc.email = auth.jwt()->>'email')
        )
    );

CREATE POLICY "Users can create their own trips"
    ON public.trips FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Trip owners and editors can update trips"
    ON public.trips FOR UPDATE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.trip_collaborators tc
            WHERE tc.trip_id = trips.id 
              AND tc.role IN ('editor', 'owner')
              AND (tc.user_id = auth.uid() OR tc.email = auth.jwt()->>'email')
        )
    );

CREATE POLICY "Only trip owner can delete trip"
    ON public.trips FOR DELETE
    USING (auth.uid() = user_id);

-- Collaborators Policies
CREATE POLICY "Collaborators can view members of their trips"
    ON public.trip_collaborators FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trips t
            WHERE t.id = trip_collaborators.trip_id AND (t.user_id = auth.uid() OR auth.jwt()->>'email' = trip_collaborators.email)
        )
    );

CREATE POLICY "Trip owner can invite collaborators"
    ON public.trip_collaborators FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trips t
            WHERE t.id = trip_collaborators.trip_id AND t.user_id = auth.uid()
        )
    );
