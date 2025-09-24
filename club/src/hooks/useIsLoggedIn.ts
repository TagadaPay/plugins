import { useEffect, useState } from "react";

/**
 * Custom hook to check if user is logged in based on cms_token in localStorage
 * @returns {boolean} isLoggedIn - true if cms_token exists, false otherwise
 */
export const useIsLoggedIn = (): boolean => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Check if cms_token exists in localStorage
    const checkLoginStatus = () => {
      const token = localStorage.getItem("cms_token");
      setIsLoggedIn(!!token);
    };

    // Check initial status
    checkLoginStatus();

    // Listen for storage changes to update login status
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cms_token") {
        checkLoginStatus();
      }
    };

    // Add event listener for storage changes
    window.addEventListener("storage", handleStorageChange);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return isLoggedIn;
};
