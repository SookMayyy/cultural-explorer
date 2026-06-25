-- Cultural Explorer of Malaysia — PostgreSQL schema (Supabase)
-- HOW TO RUN: Supabase dashboard → SQL Editor → New query → paste this → Run.
-- (Ported from the original MySQL schema in db/schema.sql.)

-- ─────────────────────────────────────────────────────────────
-- USERS  (all auth types in one table)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                SERIAL PRIMARY KEY,
  auth_type         VARCHAR(20) NOT NULL CHECK (auth_type IN ('grade_account','moe','teacher')),

  -- Grade-based path (international / private schools)
  display_name      VARCHAR(30),
  grade_group       VARCHAR(5) CHECK (grade_group IN ('1-2','3-4','5-6')),
  password_hash     VARCHAR(60),         -- bcrypt; Grade 3+ only
  auto_password     VARCHAR(20),         -- Grade 1-2 only; cleared after first login
  icon_key_1        SMALLINT,            -- first recovery icon id (1–12)
  icon_key_2        SMALLINT,            -- second recovery icon id (1–12)

  -- MOE path (government schools)
  ic_hash           VARCHAR(64),         -- SHA-256 of IC number; never store plain

  -- Teacher path
  email             VARCHAR(100),
  teacher_pw_hash   VARCHAR(60),         -- bcrypt cost 12

  -- Shared fields
  points            INT      NOT NULL DEFAULT 0,
  avatar_costume_id SMALLINT DEFAULT 1,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login        TIMESTAMP,

  CONSTRAINT uq_email UNIQUE (email),
  CONSTRAINT uq_moe   UNIQUE (ic_hash)
);

-- ─────────────────────────────────────────────────────────────
-- CLASSES  (teacher → class grouping)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id          SERIAL PRIMARY KEY,
  teacher_id  INT          NOT NULL REFERENCES users(id),
  class_name  VARCHAR(100) NOT NULL,
  school_name VARCHAR(150),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- CLASS MEMBERS  (student ↔ class many-to-many)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_members (
  class_id  INT NOT NULL REFERENCES classes(id),
  user_id   INT NOT NULL REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (class_id, user_id)
);

-- ─────────────────────────────────────────────────────────────
-- STATES  (Malaysia states catalogue)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS states (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(50) NOT NULL,
  region            VARCHAR(4)  NOT NULL CHECK (region IN ('west','east')),
  mascot            VARCHAR(10) NOT NULL CHECK (mascot IN ('rimau','wak')),
  color_hex         CHAR(7)     NOT NULL,
  flag_file         VARCHAR(100),
  story             TEXT,                 -- state intro narrative (FR2); seeded by npm run seed
  is_locked_default BOOLEAN  DEFAULT FALSE,
  unlock_after      SMALLINT DEFAULT 0,   -- require N west states completed before unlocking
  sort_order        SMALLINT NOT NULL
);

-- ─────────────────────────────────────────────────────────────
-- CULTURAL CONTENT  (cards per state)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cultural_content (
  id          SERIAL PRIMARY KEY,
  state_id    INT NOT NULL REFERENCES states(id),
  card_type   VARCHAR(12) NOT NULL CHECK (card_type IN ('food','landmark','tradition','dialect','costume')),
  title       VARCHAR(100) NOT NULL,
  body_text   TEXT NOT NULL,
  fun_fact    VARCHAR(300),
  mascot_line TEXT,
  audio_file  VARCHAR(150),
  media_file  VARCHAR(150),
  sort_order  SMALLINT DEFAULT 1
);

-- ─────────────────────────────────────────────────────────────
-- STATE DIALOGUE  (mascot dialogue per state)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS state_dialogue (
  state_id         INT PRIMARY KEY REFERENCES states(id),
  entry_first      TEXT NOT NULL,
  entry_return     TEXT NOT NULL,
  entry_locked     TEXT NOT NULL,
  challenge_frame  TEXT NOT NULL,
  feedback_correct TEXT NOT NULL,
  feedback_wrong   TEXT NOT NULL,
  reward_outro     TEXT NOT NULL,
  audio_entry      VARCHAR(150)
);

-- ─────────────────────────────────────────────────────────────
-- QUIZ QUESTIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_questions (
  id            SERIAL PRIMARY KEY,
  state_id      INT NOT NULL REFERENCES states(id),
  difficulty    VARCHAR(6) DEFAULT 'easy' CHECK (difficulty IN ('easy','medium','hard')),
  question_text TEXT NOT NULL,
  opt_a         VARCHAR(250) NOT NULL,
  opt_b         VARCHAR(250) NOT NULL,
  opt_c         VARCHAR(250) NOT NULL,
  opt_d         VARCHAR(250) NOT NULL,
  correct_opt   CHAR(1) NOT NULL CHECK (correct_opt IN ('a','b','c','d')),
  explanation   TEXT NOT NULL
);

-- ─────────────────────────────────────────────────────────────
-- USER PROGRESS  (per-student, per-state tracking)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_progress (
  user_id         INT NOT NULL REFERENCES users(id),
  state_id        INT NOT NULL REFERENCES states(id),
  is_completed    BOOLEAN DEFAULT FALSE,
  stamp_earned    BOOLEAN DEFAULT FALSE,
  last_quiz_score SMALLINT,
  visits          SMALLINT DEFAULT 0,
  first_visited   TIMESTAMP,
  completed_at    TIMESTAMP,
  PRIMARY KEY (user_id, state_id)
);

-- ─────────────────────────────────────────────────────────────
-- COSTUMES  (avatar costume catalogue)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS costumes (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(80)  NOT NULL,
  culture_ref  VARCHAR(80),
  points_cost  INT NOT NULL DEFAULT 50,
  image_file   VARCHAR(150) NOT NULL,
  unlock_state VARCHAR(50)
);

-- ─────────────────────────────────────────────────────────────
-- USER COSTUMES  (unlocked costumes per user)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_costumes (
  user_id     INT NOT NULL REFERENCES users(id),
  costume_id  INT NOT NULL REFERENCES costumes(id),
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, costume_id)
);

-- ═════════════════════════════════════════════════════════════
-- SEED DATA
-- ═════════════════════════════════════════════════════════════

-- Bring already-deployed databases up to date (CREATE IF NOT EXISTS won't add new columns).
ALTER TABLE states ADD COLUMN IF NOT EXISTS story TEXT;

-- States (7 representative states for CP2 prototype).
-- These MUST match the frontend single-source-of-truth in src/js/data/states.js
-- (Penang, Melaka, Selangor, Johor, Kelantan, Sabah, Sarawak).
INSERT INTO states (id, name, region, mascot, color_hex, flag_file, is_locked_default, unlock_after, sort_order) VALUES
  (1, 'Penang',   'west', 'rimau', '#E67E22', 'penang-flag.png',   FALSE, 0, 1),
  (2, 'Melaka',   'west', 'rimau', '#8E44AD', 'melaka-flag.png',   FALSE, 0, 2),
  (3, 'Selangor', 'west', 'rimau', '#1A5276', 'selangor-flag.png', FALSE, 0, 3),
  (4, 'Johor',    'west', 'rimau', '#1E8449', 'johor-flag.png',    FALSE, 0, 4),
  (5, 'Kelantan', 'west', 'rimau', '#C0392B', 'kelatan-flag.png',  FALSE, 0, 5),
  (6, 'Sabah',    'east', 'wak',   '#117A65', 'sabah-flag.png',    TRUE,  5, 6),
  (7, 'Sarawak',  'east', 'wak',   '#1A5276', 'sarawak-flag.png',  TRUE,  5, 7)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, region = EXCLUDED.region, mascot = EXCLUDED.mascot,
  color_hex = EXCLUDED.color_hex, flag_file = EXCLUDED.flag_file,
  is_locked_default = EXCLUDED.is_locked_default, unlock_after = EXCLUDED.unlock_after,
  sort_order = EXCLUDED.sort_order;

-- Default costume (every new student starts with costume id=1)
INSERT INTO costumes (id, name, culture_ref, points_cost, image_file) VALUES
  (1, 'School Uniform',         'Malaysian School',     0,  'costume-default.png'),
  (2, 'Baju Melayu',            'Malay Traditional',    50, 'costume-baju-melayu.png'),
  (3, 'Cheongsam',              'Chinese Traditional',  50, 'costume-cheongsam.png'),
  (4, 'Saree',                  'Indian Traditional',   50, 'costume-saree.png'),
  (5, 'Kadazan-Dusun Attire',   'Sabah East Malaysian', 80, 'costume-kadazan.png'),
  (6, 'Iban Warrior',           'Sarawak Iban',         80, 'costume-iban.png')
ON CONFLICT (id) DO NOTHING;

-- Keep SERIAL sequences ahead of the explicitly-seeded ids
SELECT setval('states_id_seq',   (SELECT MAX(id) FROM states));
SELECT setval('costumes_id_seq', (SELECT MAX(id) FROM costumes));
