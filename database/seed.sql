-- Seed Data for RateHub (All passwords are hashed with bcrypt: 'Password@123')
-- Default password: 'Password@123'
-- Hash: $2a$10$7vGzE/4U7N1QhBqyD0h2/O4R7dC41vX3x43bX8F8PqM5j1bYwT8.e
-- All names meet 20-60 characters constraint
-- All addresses meet <= 400 characters constraint

USE ratehub_db;

-- Insert Users (Password: Password@123 for all demo accounts)
-- Bcrypt hash generated with 10 salt rounds:
-- $2b$10$3zR13Gg.gT7e9o7v/9nKfeJ8hI4qL7sB4P9y1L4a9XyZ4Q7a9X8mO (We will generate genuine bcrypt hashes in seed runner)
