const KNOWN_REPLACEMENTS = [
  ['H? th?ng', 'Hệ thống'],
  ['He thong', 'Hệ thống'],
  ['Háº¡', 'Hạ'],
  ['Ä‘', 'đ'],
  ['Ä�', 'Đ'],
];

const ACTION_PATTERNS = [
  /đã cập nhật/i,
  /da cap nhat/i,
  /c.p nh.t/i,
  /đóng góp/i,
  /dong gop/i,
  /khoản chi/i,
  /khoan chi/i,
];

function normalizeSpaces(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function applyKnownReplacements(value) {
  return KNOWN_REPLACEMENTS.reduce((text, [from, to]) => text.replaceAll(from, to), normalizeSpaces(value));
}

function countMatches(value, pattern) {
  return (value.match(pattern) || []).length;
}

function scoreTextQuality(value) {
  const suspiciousCount =
    countMatches(value, /Ã.|Ä.|áº|á»|â.|Â.|�/g) +
    countMatches(value, /[A-Za-zÀ-ỹ]\?[A-Za-zÀ-ỹ]/g);
  const vietnameseCount = countMatches(
    value,
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi
  );
  return vietnameseCount - suspiciousCount * 2;
}

function repairUtf8Mojibake(value) {
  let current = normalizeSpaces(value);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    let repaired;
    try {
      repaired = Buffer.from(current, "latin1").toString("utf8");
    } catch {
      break;
    }

    if (!repaired || repaired === current) break;
    if (scoreTextQuality(repaired) < scoreTextQuality(current)) break;
    current = repaired;
  }

  return current;
}

function getFirstMatchIndex(value, patterns) {
  return patterns.reduce((earliest, pattern) => {
    const match = pattern.exec(value);
    if (!match) return earliest;
    if (earliest === -1 || match.index < earliest) return match.index;
    return earliest;
  }, -1);
}

function cleanActorName(value, fallbackActorName = "Thành viên") {
  const candidate = normalizeSpaces(value).replace(/[?.!:;,/-]+$/g, "").trim();
  return candidate || fallbackActorName;
}

function extractActorName(value, fallbackActorName = "Thành viên") {
  const normalized = applyKnownReplacements(repairUtf8Mojibake(value));
  const actionIndex = getFirstMatchIndex(normalized, ACTION_PATTERNS);
  if (actionIndex <= 0) return cleanActorName(fallbackActorName, "Thành viên");
  return cleanActorName(normalized.slice(0, actionIndex), fallbackActorName);
}

function extractAmountText(value) {
  const match = applyKnownReplacements(repairUtf8Mojibake(value)).match(/(\d{1,3}(?:[.,]\d{3})+|\d+)\s*(?:\u0111|d)(?=[^A-Za-z]|$)/i);
  if (!match) return "";
  return `${match[1].replace(/,/g, ".")} đ`;
}

function extractDates(value) {
  return applyKnownReplacements(repairUtf8Mojibake(value)).match(/\d{1,2}\/\d{1,2}/g) || [];
}

function extractDestination(value) {
  const normalized = applyKnownReplacements(repairUtf8Mojibake(value));
  const patterns = [
    /lịch trình\s+(.+?)\s+từ\s+\d{1,2}\/\d{1,2}/i,
    /lich trinh\s+(.+?)\s+tu\s+\d{1,2}\/\d{1,2}/i,
    /l.ch tr.nh\s+(.+?)\s+t.\s+\d{1,2}\/\d{1,2}/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[1]) {
      return normalizeSpaces(match[1]).replace(/[?.!:;,]+$/g, "").trim();
    }
  }

  return "";
}

function extractExpenseTitle(value) {
  const normalized = applyKnownReplacements(repairUtf8Mojibake(value));
  const patterns = [
    /kho?n chi\s+(.+?)\s+(\d{1,3}(?:[.,]\d{3})+|\d+)\s*(?:\u0111|d)(?=[^A-Za-z]|$)/i,
    /khoan chi\s+(.+?)\s+(\d{1,3}(?:[.,]\d{3})+|\d+)\s*(?:\u0111|d)(?=[^A-Za-z]|$)/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[1]) {
      return normalizeSpaces(match[1]).replace(/[?.!:;,]+$/g, "").trim();
    }
  }

  return "";
}

function hasAnyPattern(value, patterns) {
  return patterns.some((pattern) => pattern.test(value));
}

function isFundGoalAnnouncement(value) {
  return hasAnyPattern(value, [/mục tiêu quỹ/i, /muc tieu quy/i, /m.c ti.u qu./i]);
}

function isItineraryAnnouncement(value) {
  return hasAnyPattern(value, [/lịch trình/i, /lich trinh/i, /l.ch tr.nh/i]);
}

function isContributionAnnouncement(value) {
  return hasAnyPattern(value, [/đóng góp/i, /dong gop/i, /.óng góp/i]);
}

function isExpenseAnnouncement(value) {
  return hasAnyPattern(value, [/khoản chi/i, /khoan chi/i]);
}

function normalizeSystemAnnouncementText(value, fallbackActorName = "Thành viên") {
  const repaired = applyKnownReplacements(repairUtf8Mojibake(value));
  if (!repaired) return "";

  const actorName = extractActorName(repaired, fallbackActorName);
  const amountText = extractAmountText(repaired);
  const dates = extractDates(repaired);
  const destination = extractDestination(repaired);
  const expenseTitle = extractExpenseTitle(repaired);

  if (isFundGoalAnnouncement(repaired) && amountText) {
    return `${actorName} đã cập nhật mục tiêu quỹ thành ${amountText}.`;
  }

  if (isItineraryAnnouncement(repaired) && dates.length >= 2) {
    return destination
      ? `${actorName} đã cập nhật lịch trình ${destination} từ ${dates[0]} đến ${dates[1]}.`
      : `${actorName} đã cập nhật lịch trình từ ${dates[0]} đến ${dates[1]}.`;
  }

  if (isContributionAnnouncement(repaired) && amountText) {
    return `${actorName} đã đóng góp ${amountText} vào quỹ nhóm.`;
  }

  if (isExpenseAnnouncement(repaired) && amountText) {
    return expenseTitle
      ? `${actorName} vừa thêm khoản chi ${expenseTitle} ${amountText}.`
      : `${actorName} vừa thêm khoản chi ${amountText}.`;
  }

  return repaired;
}

module.exports = {
  normalizeSystemAnnouncementText,
};

