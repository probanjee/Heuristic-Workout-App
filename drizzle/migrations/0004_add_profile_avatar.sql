ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS avatarUrl TEXT NULL,
  ADD COLUMN IF NOT EXISTS avatarKey VARCHAR(255) NULL;

-- Profile avatar bytes remain in S3-backed storage; this table stores only references.
