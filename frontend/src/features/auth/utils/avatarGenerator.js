/**
 * Generate DiceBear avatar URLs using the Thumbs collection
 * @param {number} count - Number of avatars to generate
 * @param {string} prefix - Seed prefix for uniqueness
 * @returns {Array<{id: string, url: string, seed: string}>}
 */
export const generateAvatars = (count = 24, prefix = '') => {
  const avatars = [];
  const timestamp = Date.now();
  
  for (let i = 1; i <= count; i++) {
    const seed = prefix ? `${prefix}-${i}-${timestamp}` : `avatar-${i}-${timestamp}`;
    const url = `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`;
    
    avatars.push({
      id: seed,
      url,
      seed,
    });
  }
  
  return avatars;
};

/**
 * Generate a single random avatar
 * @returns {{id: string, url: string, seed: string}}
 */
export const generateRandomAvatar = () => {
  const seed = `avatar-random-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const url = `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`;
  
  return {
    id: seed,
    url,
    seed,
  };
};
