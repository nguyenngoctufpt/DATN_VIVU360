const SYSTEM_USER_ALIASES = new Set(['H\u1ec7 th\u1ed1ng', 'H? th?ng', 'He thong']);

const KNOWN_REPLACEMENTS = [
  ['H? th?ng', 'H\u1ec7 th\u1ed1ng'],
  ['He thong', 'H\u1ec7 th\u1ed1ng'],
  ['H???', 'H\u1ea1'],
  ['H? Long', 'H\u1ea1 Long'],
  ['H??? Long', 'H\u1ea1 Long'],
  ['??', '\u0111'],
  ['??', '\u0110'],
];

const ACTION_PATTERNS = [
  /\u0111\u00e3 c\u1eadp nh\u1eadt/i,
  /da cap nhat/i,
  /c.p nh.t/i,
  /\u0111\u00f3ng g\u00f3p/i,
  /dong gop/i,
  /kho\u1ea3n chi/i,
  /khoan chi/i,
];

const normalizeSpaces = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const applyKnownReplacements = (value) =>
  KNOWN_REPLACEMENTS.reduce((text, [from, to]) => text.replaceAll(from, to), normalizeSpaces(value));

const getFirstMatchIndex = (value, patterns) =>
  patterns.reduce((earliest, pattern) => {
    const match = pattern.exec(value);
    if (!match) return earliest;
    if (earliest === -1 || match.index < earliest) return match.index;
    return earliest;
  }, -1);

const cleanActorName = (value, fallbackActorName = 'Th\u00e0nh vi\u00ean') => {
  const candidate = normalizeSpaces(value).replace(/[?.!:;,/-]+$/g, '').trim();
  return candidate || fallbackActorName;
};

const extractActorName = (value, fallbackActorName = 'Th\u00e0nh vi\u00ean') => {
  const normalized = applyKnownReplacements(value);
  const actionIndex = getFirstMatchIndex(normalized, ACTION_PATTERNS);
  if (actionIndex <= 0) return cleanActorName(fallbackActorName, 'Th\u00e0nh vi\u00ean');
  return cleanActorName(normalized.slice(0, actionIndex), fallbackActorName);
};

const extractAmountText = (value) => {
  const match = applyKnownReplacements(value).match(/(\d{1,3}(?:[.,]\d{3})+|\d+)\s*(?:\u0111|d|\?)(?=[^A-Za-z]|$)/i);
  if (!match) return '';
  return `${match[1].replace(/,/g, '.')} \u0111`;
};

const extractDates = (value) => applyKnownReplacements(value).match(/\d{1,2}\/\d{1,2}/g) || [];

const normalizeDestinationName = (value) => {
  const cleaned = applyKnownReplacements(value).replace(/[?.!:;,]+$/g, "").trim();
  if (/^H\?+\s*Long$/i.test(cleaned) || /^Ha\s*Long$/i.test(cleaned)) return "H\u1ea1 Long";
  return cleaned;
};

const extractDestination = (value) => {
  const normalized = applyKnownReplacements(value);
  const patterns = [
    /l(?:\u1ecb|i|\?)ch tr(?:\u00ec|i|\?)nh\s+(.+?)\s+t(?:\u1eeb|u|\?)\s+\d{1,2}\/\d{1,2}/i,
    /l.ch tr.nh\s+(.+?)\s+t.\s+\d{1,2}\/\d{1,2}/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[1]) return normalizeDestinationName(match[1]);
  }

  return '';
};

const extractExpenseTitle = (value) => {
  const normalized = applyKnownReplacements(value);
  const patterns = [
    /kho\u1ea3n chi\s+(.+?)\s+(\d{1,3}(?:[.,]\d{3})+|\d+)\s*(?:\u0111|d|\?)(?=[^A-Za-z]|$)/i,
    /khoan chi\s+(.+?)\s+(\d{1,3}(?:[.,]\d{3})+|\d+)\s*(?:\u0111|d|\?)(?=[^A-Za-z]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[1]) return normalizeSpaces(match[1]).replace(/[?.!:;,]+$/g, "").trim();
  }

  return '';
};

const hasAnyPattern = (value, patterns) => patterns.some((pattern) => pattern.test(value));

const isFundGoalAnnouncement = (value) =>
  hasAnyPattern(value, [/m\u1ee5c ti\u00eau qu\u1ef9/i, /muc tieu quy/i, /m.c ti.u qu./i]);

const isItineraryAnnouncement = (value) =>
  hasAnyPattern(value, [/l\u1ecbch tr\u00ecnh/i, /lich trinh/i, /l.ch tr.nh/i]);

const isContributionAnnouncement = (value) =>
  hasAnyPattern(value, [/\u0111\u00f3ng g\u00f3p/i, /dong gop/i, /.?ng g?p/i]);

const isExpenseAnnouncement = (value) =>
  hasAnyPattern(value, [/kho\u1ea3n chi/i, /khoan chi/i]);

export const looksLikeSystemAnnouncement = (value) => {
  const normalized = applyKnownReplacements(value);
  return (
    /^(H\u1ec7 th\u1ed1ng|H\? th\?ng|He thong)\s*:/i.test(normalized) ||
    isFundGoalAnnouncement(normalized) ||
    isItineraryAnnouncement(normalized) ||
    isContributionAnnouncement(normalized) ||
    isExpenseAnnouncement(normalized) ||
    hasAnyPattern(normalized, ACTION_PATTERNS)
  );
};

export const normalizeSystemAnnouncementText = (value, fallbackActorName = 'Th\u00e0nh vi\u00ean') => {
  const normalized = applyKnownReplacements(value);
  if (!normalized) return '';

  const actorName = extractActorName(normalized, fallbackActorName);
  const amountText = extractAmountText(normalized);
  const dates = extractDates(normalized);
  const destination = extractDestination(normalized);
  const expenseTitle = extractExpenseTitle(normalized);

  if (isFundGoalAnnouncement(normalized) && amountText) {
    return `${actorName} \u0111\u00e3 c\u1eadp nh\u1eadt m\u1ee5c ti\u00eau qu\u1ef9 th\u00e0nh ${amountText}.`;
  }

  if (isItineraryAnnouncement(normalized) && dates.length >= 2) {
    return destination
      ? `${actorName} \u0111\u00e3 c\u1eadp nh\u1eadt l\u1ecbch tr\u00ecnh ${destination} t\u1eeb ${dates[0]} \u0111\u1ebfn ${dates[1]}.`
      : `${actorName} \u0111\u00e3 c\u1eadp nh\u1eadt l\u1ecbch tr\u00ecnh t\u1eeb ${dates[0]} \u0111\u1ebfn ${dates[1]}.`;
  }

  if (isContributionAnnouncement(normalized) && amountText) {
    return `${actorName} \u0111\u00e3 \u0111\u00f3ng g\u00f3p ${amountText} v\u00e0o qu\u1ef9 nh\u00f3m.`;
  }

  if (isExpenseAnnouncement(normalized) && amountText) {
    return expenseTitle
      ? `${actorName} v\u1eeba th\u00eam kho\u1ea3n chi ${expenseTitle} ${amountText}.`
      : `${actorName} v\u1eeba th\u00eam kho\u1ea3n chi ${amountText}.`;
  }

  return normalized;
};

export const normalizeGroupPreviewText = (value) => {
  const normalized = applyKnownReplacements(value);
  if (!normalized) return '';

  const prefixedMatch = normalized.match(/^(H\u1ec7 th\u1ed1ng|H\? th\?ng|He thong)\s*:\s*(.+)$/i);
  if (prefixedMatch) {
    return `H\u1ec7 th\u1ed1ng: ${normalizeSystemAnnouncementText(prefixedMatch[2])}`;
  }

  return looksLikeSystemAnnouncement(normalized) ? normalizeSystemAnnouncementText(normalized) : normalized;
};

export const isSystemUser = (value) => SYSTEM_USER_ALIASES.has(normalizeSpaces(value));

export const isSystemChatEntry = (entry) =>
  entry?.type === 'notification' || entry?.type === 'system' || isSystemUser(entry?.user) || looksLikeSystemAnnouncement(entry?.text || entry?.content || entry?.message || '');
