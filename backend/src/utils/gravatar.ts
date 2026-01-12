import gravatar from 'gravatar';

/**
 * Generate a Gravatar URL for a given email address
 * @param email - User's email address
 * @param options - Optional gravatar configuration
 * @returns Gravatar URL
 */
export function generateGravatarUrl(
  email: string,
  options?: {
    size?: number;
    default?: 'mp' | 'identicon' | 'monsterid' | 'wavatar' | 'retro' | 'robohash' | 'blank';
    rating?: 'g' | 'pg' | 'r' | 'x';
  }
): string {
  const gravatarOptions = {
    s: String(options?.size || 200), // size
    d: options?.default || 'identicon', // default image
    r: options?.rating || 'pg', // rating
    protocol: 'https' as const, // always use https
  };

  return gravatar.url(email, gravatarOptions);
}
