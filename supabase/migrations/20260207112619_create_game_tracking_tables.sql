/*
  # GameHub Database Schema

  ## Overview
  This migration creates the core tables for tracking game usage, user sessions,
  preferences, and high scores in the GameHub application.

  ## New Tables

  ### `game_launches`
  Tracks each time a user launches a game
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, nullable) - User who launched the game (null for anonymous)
  - `game_id` (text) - Game identifier (e.g., 'snake', 'escape-protocol')
  - `launched_at` (timestamptz) - When the game was launched
  - `session_id` (text, nullable) - Browser session identifier for anonymous tracking

  ### `game_sessions`
  Tracks game session start and end events
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, nullable) - User playing the game
  - `game_id` (text) - Game identifier
  - `event_type` (text) - Event type ('start' or 'end')
  - `timestamp` (timestamptz) - When the event occurred
  - `session_id` (text, nullable) - Browser session identifier

  ### `high_scores`
  Stores high scores for games
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, nullable) - User who achieved the score
  - `game_id` (text) - Game identifier
  - `score` (integer) - The score achieved
  - `metadata` (jsonb) - Additional game-specific data
  - `achieved_at` (timestamptz) - When the score was achieved
  - `player_name` (text, nullable) - Display name for leaderboards

  ### `user_preferences`
  Stores user preferences and settings
  - `user_id` (uuid, primary key) - References auth.users
  - `theme` (text) - UI theme preference
  - `favorite_games` (text[]) - Array of favorite game IDs
  - `notifications_enabled` (boolean) - Whether notifications are enabled
  - `preferences` (jsonb) - Additional preference data
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - All tables have RLS enabled
  - Anonymous users can insert their own data (tracked by session_id)
  - Authenticated users can view and modify only their own data
  - High scores are publicly readable for leaderboards
  - Game launch and session data is private to each user

  ## Notes
  - Tables support both authenticated and anonymous users
  - Session tracking allows analytics even for anonymous users
  - High scores support both authenticated and anonymous players
  - JSONB fields allow flexibility for game-specific data
*/

-- Game launches table
CREATE TABLE IF NOT EXISTS game_launches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id text NOT NULL,
  launched_at timestamptz DEFAULT now() NOT NULL,
  session_id text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('start', 'end')),
  timestamp timestamptz DEFAULT now() NOT NULL,
  session_id text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- High scores table
CREATE TABLE IF NOT EXISTS high_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  game_id text NOT NULL,
  score integer NOT NULL,
  metadata jsonb DEFAULT '{}',
  achieved_at timestamptz DEFAULT now() NOT NULL,
  player_name text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text DEFAULT 'dark',
  favorite_games text[] DEFAULT ARRAY[]::text[],
  notifications_enabled boolean DEFAULT true,
  preferences jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_launches_user_id ON game_launches(user_id);
CREATE INDEX IF NOT EXISTS idx_game_launches_game_id ON game_launches(game_id);
CREATE INDEX IF NOT EXISTS idx_game_launches_session_id ON game_launches(session_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_high_scores_game_id ON high_scores(game_id);
CREATE INDEX IF NOT EXISTS idx_high_scores_score ON high_scores(game_id, score DESC);

-- Enable Row Level Security
ALTER TABLE game_launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE high_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_launches
CREATE POLICY "Users can insert their own game launches"
  ON game_launches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert launches with session_id"
  ON game_launches FOR INSERT
  TO anon
  WITH CHECK (session_id IS NOT NULL);

CREATE POLICY "Users can view their own game launches"
  ON game_launches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for game_sessions
CREATE POLICY "Users can insert their own game sessions"
  ON game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert sessions with session_id"
  ON game_sessions FOR INSERT
  TO anon
  WITH CHECK (session_id IS NOT NULL);

CREATE POLICY "Users can view their own game sessions"
  ON game_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for high_scores
CREATE POLICY "Anyone can view high scores"
  ON high_scores FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own high scores"
  ON high_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert high scores with player name"
  ON high_scores FOR INSERT
  TO anon
  WITH CHECK (player_name IS NOT NULL);

CREATE POLICY "Users can update their own high scores"
  ON high_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
  ON user_preferences FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
