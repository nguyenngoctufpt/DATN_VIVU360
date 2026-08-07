export const LOCATION_SHARE_HEADER = '[CHIA SẺ ĐỊA ĐIỂM VIVU360]';

const LOCATION_SHARE_META_PREFIX = '[[VIVU360_LOCATION::';
const LOCATION_SHARE_META_SUFFIX = ']]';

const normalizeInlineText = (value, fallback = '') =>
  String(value ?? fallback)
    .replace(/\s+/g, ' ')
    .trim();

const normalizeMultilineText = (value, fallback = '') =>
  String(value ?? fallback)
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const truncateText = (value, maxLength = 160) => {
  const normalized = normalizeInlineText(value);
  if (!normalized || normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trim()}...`;
};

const decodeMetadata = (value) => {
  try {
    return JSON.parse(decodeURIComponent(value));
  } catch (_error) {
    return null;
  }
};

const encodeMetadata = (value) => encodeURIComponent(JSON.stringify(value));

const extractMetadataMatch = (text) => {
  const match = String(text || '').match(/\[\[VIVU360_LOCATION::(.+?)\]\]/);
  return match?.[1] ? decodeMetadata(match[1]) : null;
};

const extractPrefixedValue = (text, label) => {
  const pattern = new RegExp(`^${label}\\s*:\\s*(.+)$`, 'im');
  return text.match(pattern)?.[1]?.trim() || '';
};

export const stripLocationShareMetadata = (text) =>
  String(text || '')
    .replace(/\n?\[\[VIVU360_LOCATION::.+?\]\]/g, '')
    .trim();

export const normalizeLocationShareData = (locationData = {}) => {
  const placeName = normalizeInlineText(
    locationData.placeName ||
      locationData.locationName ||
      locationData.name ||
      locationData.ten,
    'Địa điểm du lịch'
  );
  const address = normalizeInlineText(
    locationData.address ||
      locationData.location ||
      locationData.viTri ||
      locationData.province,
    'Việt Nam'
  );
  const description = normalizeMultilineText(
    locationData.description || locationData.moTa,
    'Khám phá địa điểm thú vị này cùng Vivu360.'
  );
  const mapsLink = normalizeInlineText(locationData.mapsLink);
  const price = normalizeInlineText(locationData.price);
  const province = normalizeInlineText(locationData.province);
  const lat = Number.isFinite(Number(locationData.lat)) ? Number(locationData.lat) : null;
  const lng = Number.isFinite(Number(locationData.lng)) ? Number(locationData.lng) : null;

  return {
    placeName,
    address,
    description,
    mapsLink,
    price,
    province,
    lat,
    lng,
    openGuide: true,
  };
};

export const buildLocationShareMessage = (locationData = {}) => {
  const normalized = normalizeLocationShareData(locationData);
  const payload = {
    placeName: normalized.placeName,
    address: normalized.address,
    description: normalized.description,
    mapsLink: normalized.mapsLink,
    price: normalized.price,
    province: normalized.province,
    lat: normalized.lat,
    lng: normalized.lng,
    openGuide: true,
  };

  const lines = [
    LOCATION_SHARE_HEADER,
    `Địa điểm: ${normalized.placeName}`,
    `Vị trí: ${normalized.address}`,
    `Mô tả: ${truncateText(normalized.description, 150)}`,
    normalized.mapsLink ? `Google Maps: ${normalized.mapsLink}` : '',
    'Mở Vivu360 để xem bản đồ và cẩm nang chi tiết.',
    `${LOCATION_SHARE_META_PREFIX}${encodeMetadata(payload)}${LOCATION_SHARE_META_SUFFIX}`,
  ].filter(Boolean);

  return lines.join('\n');
};

export const parseLocationShareMessage = (text) => {
  const rawText = String(text || '').trim();
  if (!rawText) return null;

  const cleanText = stripLocationShareMetadata(rawText);
  const metadata = extractMetadataMatch(rawText);
  const hasHeader = cleanText.includes(LOCATION_SHARE_HEADER);

  if (!hasHeader && !metadata?.placeName) return null;

  const placeName = normalizeInlineText(
    metadata?.placeName || extractPrefixedValue(cleanText, 'Địa điểm'),
    ''
  );
  const address = normalizeInlineText(
    metadata?.address || extractPrefixedValue(cleanText, 'Vị trí'),
    'Việt Nam'
  );
  const description = normalizeInlineText(
    metadata?.description || extractPrefixedValue(cleanText, 'Mô tả'),
    ''
  );
  const mapsLink = normalizeInlineText(
    metadata?.mapsLink || extractPrefixedValue(cleanText, 'Google Maps'),
    ''
  );

  if (!placeName) return null;

  return {
    placeName,
    address,
    description,
    mapsLink,
    price: normalizeInlineText(metadata?.price),
    province: normalizeInlineText(metadata?.province),
    lat: Number.isFinite(Number(metadata?.lat)) ? Number(metadata.lat) : null,
    lng: Number.isFinite(Number(metadata?.lng)) ? Number(metadata.lng) : null,
    openGuide: metadata?.openGuide !== false,
    rawText,
    displayText: cleanText,
  };
};
