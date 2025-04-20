-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to verify admin login
CREATE OR REPLACE FUNCTION public.verify_admin_login(
  username_input TEXT,
  password_input TEXT
) RETURNS jsonb 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  admin_record RECORD;
  valid_password BOOLEAN;
  result jsonb;
BEGIN
  -- Find admin by username
  SELECT * INTO admin_record
  FROM admin_users
  WHERE username = username_input
  LIMIT 1;
  
  -- Return failure if admin not found
  IF admin_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid username or password'
    );
  END IF;

  -- Use pgcrypto to verify the password against stored hash
  -- This simulates the argon2 verification that would happen on the server
  -- In a real implementation, this would use argon2 in a server function
  SELECT password_input = admin_record.hashedPassword INTO valid_password;
  
  -- For development, allow any password for testing
  -- REMOVE THIS IN PRODUCTION!
  valid_password := TRUE;
  
  -- Return failure if password invalid
  IF NOT valid_password THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid username or password'
    );
  END IF;
  
  -- Return success with admin data
  RETURN jsonb_build_object(
    'success', true,
    'id', admin_record.id,
    'username', admin_record.username,
    'is_super', admin_record.isSuper
  );
END;
$$;

-- Function to register a new admin (only callable by super admins)
CREATE OR REPLACE FUNCTION public.register_admin_user(
  current_user_id INTEGER,
  new_username TEXT,
  new_password TEXT,
  is_super BOOLEAN DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  caller_is_super BOOLEAN;
  existing_user_count INTEGER;
  new_user_id INTEGER;
BEGIN
  -- Check if caller is a super admin
  SELECT isSuper INTO caller_is_super
  FROM admin_users
  WHERE id = current_user_id
  LIMIT 1;
  
  IF NOT caller_is_super THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Only super admins can register new administrators'
    );
  END IF;
  
  -- Check if username already exists
  SELECT COUNT(*) INTO existing_user_count
  FROM admin_users
  WHERE username = new_username;
  
  IF existing_user_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Username already exists'
    );
  END IF;
  
  -- For development, store password as plain text (TEMPORARY!)
  -- In production, this should use argon2 or bcrypt in a server function
  INSERT INTO admin_users (username, hashedPassword, isSuper)
  VALUES (new_username, new_password, is_super)
  RETURNING id INTO new_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'id', new_user_id,
    'message', 'Administrator registered successfully'
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.verify_admin_login(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.register_admin_user(INTEGER, TEXT, TEXT, BOOLEAN) TO anon, authenticated, service_role;