// src/utils/validations/cardValidation.js
import { authService } from "@/services/authService";

export const CardValidator = {
    async checkCardUniqueness(rfidCard) {
      try {
        const token = authService.getToken();
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const tenantId = authService.getTenantId();
        let url = `${import.meta.env.VITE_API_URL}/items/cardManagement?filter[rfidCard][_eq]=${encodeURIComponent(rfidCard)}`;
        if (tenantId) {
          url += `&filter[tenant][_eq]=${tenantId}`;
        }

        const response = await fetch(url, { headers });
        if (!response.ok) {
          console.warn(`[CardValidator] Card uniqueness check returned ${response.status}`);
          return true;
        }
        const data = await response.json();
        return (data.data || []).length === 0;
      } catch (error) {
        console.error("Error checking card uniqueness:", error);
        return false;
      }
    },
  
    checkLocalDuplicates(cards, newCardNumber) {
      return cards.some(card => {
        const rfidCard = card.cardManagement_id ? 
          card.cardManagement_id.rfidCard : 
          card.rfidCard;
        return rfidCard === newCardNumber;
      });
    },
  
    async validateNewCard(newCardNumber, newCardType, existingCards) {
      if (!newCardNumber || !newCardType) {
        throw new Error("Card number and type are required");
      }
  
      // Check local duplicates
      const isDuplicateLocal = this.checkLocalDuplicates(existingCards, newCardNumber);
      if (isDuplicateLocal) {
        throw new Error("This card is already assigned to this user");
      }
  
      // Check database duplicates
      const isUnique = await this.checkCardUniqueness(newCardNumber);
      if (!isUnique) {
        throw new Error(`This ${newCardType.toUpperCase()} number already exists. Please use a unique ${newCardType.toUpperCase()} number.`);
      }
  
      return true;
    },
  
    async validateCardsBeforeSave(cards, originalCards = []) {
      const originalCardNumbers = new Set(originalCards.map(card => 
        card.cardManagement_id ? card.cardManagement_id.rfidCard : card.rfidCard
      ));
  
      for (const card of cards) {
        const cardNumber = card.cardManagement_id ? 
          card.cardManagement_id.rfidCard : 
          card.rfidCard;
        const cardType = card.cardManagement_id ? 
          card.cardManagement_id.type : 
          card.type;
  
        // Only check new cards that weren't in original state
        if (!originalCardNumbers.has(cardNumber)) {
          const isUnique = await this.checkCardUniqueness(cardNumber);
          if (!isUnique) {
            throw new Error(`The ${cardType.toUpperCase()} number ${cardNumber} already exists. Please use a unique ${cardType.toUpperCase()} number.`);
          }
        }
      }
  
      return true;
    }
  };
  // ALERT FOR PHONE,MAIL
  export const validation = {
    async validateUserUpdate(userData) {
      const errors = [];
  
      // Email validation
      if (!this.isValidEmail(userData.email)) {
        errors.push("Invalid email format");
      }
  
      // Phone validation
      if (userData.phone && !this.isValidPhone(userData.phone)) {
        errors.push("Phone number must be between 10 and 15 digits");
      }
  
      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }
  
      return true;
    },
  
   isValidEmail(email) {
      // Regular expression for email validation
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    },
  
    isValidPhone(phone) {
      // Remove any non-digit characters
      const digitsOnly = phone.replace(/\D/g, '');
      // Check if length is between 10 and 15
      return digitsOnly.length >= 10 && digitsOnly.length <= 15;
    },
  
   async checkEmailUniqueness(email, userId) {
      try {
        const token = authService.getToken();
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/users?filter[email][_eq]=${encodeURIComponent(email)}`, {
          headers
        });
        if (!response.ok) throw new Error(`Failed to check email uniqueness: ${response.status}`);
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) return true;
        
        if (userId) {
          return data.data.every(user => user.id === userId);
        }
        
        return false;
      } catch (error) {
        console.error("Error checking email uniqueness:", error);
        throw new Error("Failed to verify email uniqueness");
      }
    }
  }