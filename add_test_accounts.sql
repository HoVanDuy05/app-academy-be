-- Migration: Add test accounts for PMS system
-- Date: 2025-04-07
-- 
-- Accounts created:
-- - Admin: vanduyho717@gmail.com / hovanduy2005
-- - Student: vanduyho616@gmail.com / hovanduy2005
-- - Teacher: vanduyho919@gmail.com / hovanduy2005

-- Delete existing accounts if any (to avoid conflicts)
DELETE FROM users WHERE email IN ('vanduyho717@gmail.com', 'vanduyho616@gmail.com', 'vanduyho919@gmail.com');

-- Insert ADMIN account
INSERT INTO users (username, password, email, role, full_name, code, is_activated, created_at) 
VALUES (
    'admin717',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash of 'hovanduy2005'
    'vanduyho717@gmail.com',
    'ADMIN',
    'Admin Test',
    'ADMIN001',
    true,
    NOW()
);

-- Insert STUDENT account
INSERT INTO users (username, password, email, role, full_name, code, is_activated, created_at) 
VALUES (
    'student616',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash of 'hovanduy2005'
    'vanduyho616@gmail.com',
    'STUDENT',
    'Student Test',
    'HS260407001',
    true,
    NOW()
);

-- Insert student profile
INSERT INTO student_profiles (user_id, student_code, full_name, gender, status)
SELECT id, 'HS260407001', 'Student Test', 'MALE', 'STUDYING'
FROM users WHERE email = 'vanduyho616@gmail.com';

-- Insert TEACHER account
INSERT INTO users (username, password, email, role, full_name, code, is_activated, created_at) 
VALUES (
    'teacher919',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash of 'hovanduy2005'
    'vanduyho919@gmail.com',
    'TEACHER',
    'Teacher Test',
    'GV260407001',
    true,
    NOW()
);

-- Insert teacher profile
INSERT INTO teacher_profiles (user_id, teacher_code, full_name, gender, education_level)
SELECT id, 'GV260407001', 'Teacher Test', 'MALE', 'UNIVERSITY'
FROM users WHERE email = 'vanduyho919@gmail.com';

-- Verify results
SELECT id, username, email, role, full_name, code, is_activated FROM users 
WHERE email IN ('vanduyho717@gmail.com', 'vanduyho616@gmail.com', 'vanduyho919@gmail.com');
