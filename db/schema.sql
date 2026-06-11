-- Cultural Explorer of Malaysia — Database Schema
-- Run this file in XAMPP phpMyAdmin or MySQL CLI:
--   mysql -u root -p < db/schema.sql

CREATE DATABASE IF NOT EXISTS cultural_explorer
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cultural_explorer;

-- ─────────────────────────────────────────────────────────────
-- USERS  (all auth types in one table)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                INT          AUTO_INCREMENT PRIMARY KEY,
  auth_type         ENUM('grade_account','moe','teacher') NOT NULL,

  -- Grade-based path (international / private schools)
  display_name      VARCHAR(30)  NULL,
  grade_group       ENUM('1-2','3-4','5-6') NULL,
  password_hash     VARCHAR(60)  NULL,   -- bcrypt; Grade 3+ only
  auto_password     VARCHAR(20)  NULL,   -- Grade 1-2 only; cleared after first login
  icon_key_1        TINYINT      NULL,   -- first recovery icon id (1–12)
  icon_key_2        TINYINT      NULL,   -- second recovery icon id (1–12)

  -- MOE path (government schools)
  ic_hash           VARCHAR(64)  NULL,   -- SHA-256 of IC number; never store plain

  -- Teacher path
  email             VARCHAR(100) NULL,
  teacher_pw_hash   VARCHAR(60)  NULL,   -- bcrypt cost 12

  -- Shared fields
  points            INT          NOT NULL DEFAULT 0,
  avatar_costume_id TINYINT      DEFAULT 1,
  created_at        DATETIME     DEFAULT CURRENT_TIMESTAMP,
  last_login        DATETIME     NULL,

  UNIQUE KEY uq_email (email),
  UNIQUE KEY uq_moe   (ic_hash)
);

-- ─────────────────────────────────────────────────────────────
-- CLASSES  (teacher → class grouping)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  teacher_id  INT          NOT NULL,
  class_name  VARCHAR(100) NOT NULL,
  school_name VARCHAR(150) NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- ─────────────────────────────────────────────────────────────
-- CLASS MEMBERS  (student ↔ class many-to-many)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_members (
  class_id  INT      NOT NULL,
  user_id   INT      NOT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (class_id, user_id),
  FOREIGN KEY (class_id) REFERENCES classes(id),
  FOREIGN KEY (user_id)  REFERENCES users(id)
);

-- ─────────────────────────────────────────────────────────────
-- STATES  (Malaysia states catalogue)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS states (
  id                INT          AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(50)  NOT NULL,
  region            ENUM('west','east') NOT NULL,
  mascot            ENUM('rimau','wak') NOT NULL,
  color_hex         CHAR(7)      NOT NULL,
  flag_file         VARCHAR(100) NULL,
  is_locked_default BOOLEAN      DEFAULT FALSE,
  unlock_after      TINYINT      DEFAULT 0,  -- require N west states completed before unlocking
  sort_order        TINYINT      NOT NULL
);

-- ─────────────────────────────────────────────────────────────
-- CULTURAL CONTENT  (cards per state)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cultural_content (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  state_id    INT          NOT NULL,
  card_type   ENUM('food','landmark','tradition','dialect','costume') NOT NULL,
  title       VARCHAR(100) NOT NULL,
  body_text   TEXT         NOT NULL,
  fun_fact    VARCHAR(300) NULL,
  mascot_line TEXT         NULL,
  audio_file  VARCHAR(150) NULL,  -- ElevenLabs MP3 filename
  media_file  VARCHAR(150) NULL,
  sort_order  TINYINT      DEFAULT 1,
  FOREIGN KEY (state_id) REFERENCES states(id)
);

-- ─────────────────────────────────────────────────────────────
-- STATE DIALOGUE  (mascot dialogue per state)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS state_dialogue (
  state_id         INT  PRIMARY KEY,
  entry_first      TEXT NOT NULL,
  entry_return     TEXT NOT NULL,
  entry_locked     TEXT NOT NULL,
  challenge_frame  TEXT NOT NULL,
  feedback_correct TEXT NOT NULL,
  feedback_wrong   TEXT NOT NULL,
  reward_outro     TEXT NOT NULL,
  audio_entry      VARCHAR(150) NULL,
  FOREIGN KEY (state_id) REFERENCES states(id)
);

-- ─────────────────────────────────────────────────────────────
-- QUIZ QUESTIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_questions (
  id            INT          AUTO_INCREMENT PRIMARY KEY,
  state_id      INT          NOT NULL,
  difficulty    ENUM('easy','medium','hard') DEFAULT 'easy',
  question_text TEXT         NOT NULL,
  opt_a         VARCHAR(250) NOT NULL,
  opt_b         VARCHAR(250) NOT NULL,
  opt_c         VARCHAR(250) NOT NULL,
  opt_d         VARCHAR(250) NOT NULL,
  correct_opt   ENUM('a','b','c','d') NOT NULL,
  explanation   TEXT         NOT NULL,
  FOREIGN KEY (state_id) REFERENCES states(id)
);

-- ─────────────────────────────────────────────────────────────
-- USER PROGRESS  (per-student, per-state tracking)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_progress (
  user_id         INT     NOT NULL,
  state_id        INT     NOT NULL,
  is_completed    BOOLEAN DEFAULT FALSE,
  stamp_earned    BOOLEAN DEFAULT FALSE,
  last_quiz_score TINYINT NULL,
  visits          TINYINT DEFAULT 0,
  first_visited   DATETIME NULL,
  completed_at    DATETIME NULL,
  PRIMARY KEY (user_id, state_id),
  FOREIGN KEY (user_id)  REFERENCES users(id),
  FOREIGN KEY (state_id) REFERENCES states(id)
);

-- ─────────────────────────────────────────────────────────────
-- COSTUMES  (avatar costume catalogue)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS costumes (
  id           INT          AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(80)  NOT NULL,
  culture_ref  VARCHAR(80)  NULL,
  points_cost  INT          NOT NULL DEFAULT 50,
  image_file   VARCHAR(150) NOT NULL,
  unlock_state VARCHAR(50)  NULL  -- optional: tied to completing a specific state
);

-- ─────────────────────────────────────────────────────────────
-- USER COSTUMES  (unlocked costumes per user)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_costumes (
  user_id     INT      NOT NULL,
  costume_id  INT      NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, costume_id),
  FOREIGN KEY (user_id)    REFERENCES users(id),
  FOREIGN KEY (costume_id) REFERENCES costumes(id)
);

-- ═════════════════════════════════════════════════════════════
-- SEED DATA
-- ═════════════════════════════════════════════════════════════

-- States (7 representative states for CP2 prototype)
INSERT IGNORE INTO states (id, name, region, mascot, color_hex, flag_file, is_locked_default, unlock_after, sort_order) VALUES
  (1, 'Penang',   'west', 'rimau', '#E74C3C', 'penang-flag.png',   FALSE, 0, 1),
  (2, 'Kedah',    'west', 'rimau', '#27AE60', 'kedah-flag.png',    FALSE, 0, 2),
  (3, 'Melaka',   'west', 'rimau', '#E67E22', 'melaka-flag.png',   FALSE, 0, 3),
  (4, 'Selangor', 'west', 'rimau', '#F39C12', 'selangor-flag.png', FALSE, 0, 4),
  (5, 'Pahang',   'west', 'rimau', '#2980B9', NULL,                FALSE, 0, 5),
  (6, 'Sabah',    'east', 'wak',   '#8E44AD', 'sabah-flag.png',    TRUE,  5, 6),
  (7, 'Sarawak',  'east', 'wak',   '#16A085', 'sarawak-flag.png',  TRUE,  5, 7);

-- Default costume (every new student starts with costume id=1)
INSERT IGNORE INTO costumes (id, name, culture_ref, points_cost, image_file) VALUES
  (1, 'School Uniform', 'Malaysian School',  0,   'costume-default.png'),
  (2, 'Baju Melayu',    'Malay Traditional', 50,  'costume-baju-melayu.png'),
  (3, 'Cheongsam',      'Chinese Traditional', 50, 'costume-cheongsam.png'),
  (4, 'Saree',          'Indian Traditional',  50, 'costume-saree.png'),
  (5, 'Kadazan-Dusun Attire', 'Sabah East Malaysian', 80, 'costume-kadazan.png'),
  (6, 'Iban Warrior',   'Sarawak Iban',       80,  'costume-iban.png');
