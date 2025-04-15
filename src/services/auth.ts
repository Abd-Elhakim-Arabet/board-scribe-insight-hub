import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  id: number;
  username: string;
  isSuper: boolean;
}

export const authService = {
  /**
   * Authenticate an admin user
   */
  login: async (username: string, password: string): Promise<AdminUser | null> => {
    try {
      // Find the user by username
      const { data: users, error } = await supabase
        .from('admin_users')
        .select('id, username, hashedPassword, isSuper')
        .eq('username', username)
        .limit(1);

      if (error || !users || users.length === 0) {
        console.error('Error finding user:', error?.message || 'User not found');
        return null;
      }

      const user = users[0];
      
      // Compare the provided password with the stored password
      // In a production environment, this should be done server-side with proper hashing
      const isValid = user.hashedPassword === password;

      if (!isValid) {
        return null;
      }
      
      // Return user without the password
      return {
        id: user.id,
        username: user.username,
        isSuper: user.isSuper
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  },

  /**
   * Register a new admin (only super admins can do this)
   */
  registerAdmin: async (
    currentUser: AdminUser, 
    newUsername: string, 
    password: string, 
    isSuper: boolean = false
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      // Check if current user is a super admin
      if (!currentUser.isSuper) {
        return { 
          success: false, 
          message: 'Only super admins can register new administrators' 
        };
      }

      // Check if username already exists
      const { data: existingUsers } = await supabase
        .from('admin_users')
        .select('username')
        .eq('username', newUsername)
        .limit(1);

      if (existingUsers && existingUsers.length > 0) {
        return { 
          success: false, 
          message: 'Username already exists' 
        };
      }

      // For development - store the password directly
      // In production, replace with secure password hashing on the server side
      const hashedPassword = password; // Simplified for development

      // Insert the new admin user
      const { error } = await supabase.from('admin_users').insert({
        username: newUsername,
        hashedPassword,
        isSuper
      });

      if (error) {
        return { 
          success: false, 
          message: `Error creating user: ${error.message}` 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error registering admin:', error);
      return { 
        success: false, 
        message: 'An unexpected error occurred while registering admin' 
      };
    }
  },

  /**
   * Check if a user is currently authenticated based on stored credentials
   */
  getCurrentUser: async (): Promise<AdminUser | null> => {
    const storedUser = localStorage.getItem('admin_user');
    
    if (!storedUser) {
      return null;
    }
    
    try {
      const parsedUser = JSON.parse(storedUser) as AdminUser;
      
      // Verify user still exists in the database
      const { data } = await supabase
        .from('admin_users')
        .select('id, username, isSuper')
        .eq('id', parsedUser.id)
        .limit(1);
        
      if (!data || data.length === 0) {
        localStorage.removeItem('admin_user');
        return null;
      }
      
      return data[0] as AdminUser;
    } catch (error) {
      localStorage.removeItem('admin_user');
      return null;
    }
  }
};