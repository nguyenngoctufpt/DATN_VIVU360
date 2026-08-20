export const DEFAULT_IMAGE_URI =
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80';

export const DEFAULT_COVER_URI = DEFAULT_IMAGE_URI;

export const DEFAULT_AVATAR_URI = 'https://i.pravatar.cc/150?img=11';

export function hasImageUri(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function getOptionalImageUri(value) {
  return hasImageUri(value) ? value.trim() : null;
}

export function getSafeImageUri(value, fallback = DEFAULT_IMAGE_URI) {
  return getOptionalImageUri(value) || fallback;
}

export function getSafeImageSource(value, fallback = DEFAULT_IMAGE_URI) {
  return { uri: getSafeImageUri(value, fallback) };
}

export function getSafeAvatarSource(value, fallback = DEFAULT_AVATAR_URI) {
  return getSafeImageSource(value, fallback);
}

export function getSafeCoverSource(value, fallback = DEFAULT_COVER_URI) {
  return getSafeImageSource(value, fallback);
}
