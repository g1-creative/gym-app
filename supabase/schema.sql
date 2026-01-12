-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
-- We'll use auth.users for authentication, this is for additional profile data if needed
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Programs table
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Workouts table (templates within programs)
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  rest_timer_seconds INTEGER DEFAULT 90,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Exercises table (reference data)
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  muscle_groups TEXT[],
  equipment TEXT,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Workout exercises (junction table: workouts -> exercises)
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  rest_timer_seconds INTEGER, -- Override workout default
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(workout_id, exercise_id, order_index)
);

-- Workout sessions (actual logged workouts)
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  total_volume DECIMAL(10, 2), -- Calculated: sum of all sets (weight × reps)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Sets (actual logged sets)
CREATE TABLE sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE SET NULL,
  set_number INTEGER NOT NULL,
  weight DECIMAL(8, 2),
  reps INTEGER,
  rpe DECIMAL(3, 1), -- Rate of Perceived Exertion (1-10)
  tempo TEXT, -- e.g., "2-0-1-0" (eccentric-pause-concentric-pause)
  rest_seconds INTEGER,
  volume DECIMAL(10, 2), -- Calculated: weight × reps
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Notes table (for sets, exercises, workouts)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'set', 'exercise', 'workout', 'session'
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_programs_user_id ON programs(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_programs_active ON programs(user_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_workouts_program_id ON workouts(program_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workout_exercises_exercise_id ON workout_exercises(exercise_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workout_sessions_started_at ON workout_sessions(user_id, started_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_sets_session_id ON sets(session_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_sets_exercise_id ON sets(exercise_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_sets_logged_at ON sets(exercise_id, logged_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_notes_entity ON notes(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notes_user_id ON notes(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_exercises_user_id ON exercises(user_id) WHERE deleted_at IS NULL;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Programs policies
CREATE POLICY "Users can view own programs" ON programs
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create own programs" ON programs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own programs" ON programs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own programs" ON programs
  FOR UPDATE USING (auth.uid() = user_id); -- Soft delete via deleted_at

-- Workouts policies
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = workouts.program_id
      AND programs.user_id = auth.uid()
      AND programs.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can create own workouts" ON workouts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = workouts.program_id
      AND programs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = workouts.program_id
      AND programs.user_id = auth.uid()
    )
  );

-- Exercises policies
CREATE POLICY "Users can view own exercises and public exercises" ON exercises
  FOR SELECT USING (
    (user_id = auth.uid() OR is_custom = false)
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can create own exercises" ON exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercises" ON exercises
  FOR UPDATE USING (auth.uid() = user_id);

-- Workout exercises policies
CREATE POLICY "Users can view own workout exercises" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts
      JOIN programs ON programs.id = workouts.program_id
      WHERE workouts.id = workout_exercises.workout_id
      AND programs.user_id = auth.uid()
      AND workouts.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can manage own workout exercises" ON workout_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workouts
      JOIN programs ON programs.id = workouts.program_id
      WHERE workouts.id = workout_exercises.workout_id
      AND programs.user_id = auth.uid()
    )
  );

-- Workout sessions policies
CREATE POLICY "Users can view own sessions" ON workout_sessions
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create own sessions" ON workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON workout_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Sets policies
CREATE POLICY "Users can view own sets" ON sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = sets.session_id
      AND workout_sessions.user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can create own sets" ON sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = sets.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own sets" ON sets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE workout_sessions.id = sets.session_id
      AND workout_sessions.user_id = auth.uid()
    )
  );

-- Notes policies
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_exercises_updated_at BEFORE UPDATE ON workout_exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON workout_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sets_updated_at BEFORE UPDATE ON sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate set volume
CREATE OR REPLACE FUNCTION calculate_set_volume()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.weight IS NOT NULL AND NEW.reps IS NOT NULL THEN
    NEW.volume = NEW.weight * NEW.reps;
  ELSE
    NEW.volume = 0;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_set_volume_trigger BEFORE INSERT OR UPDATE ON sets
  FOR EACH ROW EXECUTE FUNCTION calculate_set_volume();

-- Function to update session total volume
CREATE OR REPLACE FUNCTION update_session_volume()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE workout_sessions
  SET total_volume = (
    SELECT COALESCE(SUM(volume), 0)
    FROM sets
    WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)
    AND deleted_at IS NULL
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_session_volume_trigger AFTER INSERT OR UPDATE OR DELETE ON sets
  FOR EACH ROW EXECUTE FUNCTION update_session_volume();

-- Insert default exercises (optional - can be done via app)
-- You can add common exercises here or seed them via the app

