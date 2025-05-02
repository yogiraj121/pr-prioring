// Generate consistent avatar based on user ID
export const getAvatarUrl = (userId) => {
  if (!userId)
    return "https://api.dicebear.com/7.x/avataaars/svg?seed=default&backgroundColor=b6e3f4";

  // Use the last 6 characters of the ID to generate a consistent seed
  const seed = userId.slice(-6);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`;
};
