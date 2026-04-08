// Function to mask sensitive data based on type
const maskData = (data, type) => {
  if (data == null) {
    return "";
  }
  data = String(data);
  if (type === "number") {
    return data.slice(-4).padStart(data.length, "*");
  } else if (type === "email") {
    const [name, domain] = data.split("@");
    if (name.length <= 3) {
      return `${name[0]}${"*".repeat(name.length - 1)}@${domain}`;
    } else {
      const visibleStart = name[0];
      const visibleEnd = name.slice(-2);
      const maskedPortionLength = name.length - 3;
      return `${visibleStart}${"*".repeat(maskedPortionLength)}${visibleEnd}@${domain}`;
    }
  }
  return "****";
};

// Incognito mode state management
const initIncognitoMode = (userRole, permissions) => {
  if (!permissions.includes(userRole)) {
    return true; 
  }
  return false; 
};

// Toggle incognito mode if user has permission
const toggleIncognitoMode = (currentState, userRole, permissions) => {
  if (permissions.includes(userRole)) {
    return !currentState;
  }
  return true; 
};

export {
  maskData,
  initIncognitoMode,
  toggleIncognitoMode
};