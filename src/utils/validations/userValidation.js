import { authService } from "@/services/authService";

export const UserValidator = {
    // Check unique fields in roles/users
    async checkUserFieldsUniqueness(email, phone, currentUserId = null) {
      try {
        const token = authService.getToken();
        const headers = { "Content-Type": "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/roles?fields=users.email,users.phone,users.id`, {
          headers
        });

        if (!response.ok) {
          console.warn(`[UserValidator] Failed to fetch roles for uniqueness check: ${response.status}`);
          return true;
        }

        const data = await response.json();
        
        let isUnique = true;
        let users = [];
  
        (data.data || []).forEach(role => {
          if (role.users) {
            users = users.concat(role.users);
          }
        });
  
        // Check for duplicates, excluding current user if updating
        users.forEach(user => {
          if (currentUserId && user.id === currentUserId) {
            return; 
          }
          if (user.email === email) {
            isUnique = false;
            throw new Error("This email address is already in use");
          }
          if (user.phone === phone) {
            isUnique = false;
            throw new Error("This phone number is already in use");
          }
        });
  
        return isUnique;
      } catch (error) {
        throw error;
      }
    },
  
    // Format validation
    validateEmailFormat(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }
      return true;
    },
  
    validatePhoneFormat(phone) {
      const phoneRegex = /^\+?[1-9]\d{9,14}$/;
      if (!phoneRegex.test(phone)) {
        throw new Error("Invalid phone number format");
      }
      return true;
    },
  
    // Main validation method for new user
    async validateNewUser(userData) {
      try {
        this.validateEmailFormat(userData.email);
        this.validatePhoneFormat(userData.phone);
  
        const [ areUserFieldsUnique] = await Promise.all([
          this.checkUserFieldsUniqueness(userData.email, userData.phone)
        ]);
  
        return true;
      } catch (error) {
        throw error;
      }
    },
  
    // Modified validation method for user updates - only format validation
    validateUserUpdate(userData) {
      try {
        // Only perform format validation for updates
        this.validateEmailFormat(userData.email);
        this.validatePhoneFormat(userData.phone);
        return true;
      } catch (error) {
        throw error;
      }
    }
  };