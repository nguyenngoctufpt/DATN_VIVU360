import { getCanonicalVietnamDestination } from './vietnamDestinations';

function clone(value) {
  return JSON.parse(JSON.stringify(value || null));
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateString, offset) {
  const base = new Date(`${dateString}T00:00:00`);
  base.setDate(base.getDate() + Number(offset || 0));
  return base.toISOString().slice(0, 10);
}

function parseStringList(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => String(item || '').trim()).filter(Boolean))];
  }

  return [...new Set(
    String(value || '')
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  )];
}

function normalizeDraftActivityCost(activity = {}) {
  return activity.activityType === 'food' ? 0 : Number(activity.estimatedCost || 0);
}

function recalculateDraftTotals(itinerary) {
  const nextItinerary = clone(itinerary) || {};
  nextItinerary.days = Array.isArray(nextItinerary.days) ? nextItinerary.days : [];

  nextItinerary.days = nextItinerary.days.map((day, dayIndex) => {
    const activities = (Array.isArray(day.activities) ? day.activities : []).map((activity) => ({
      ...activity,
      estimatedCost: normalizeDraftActivityCost(activity),
    }));
    const estimatedCost = activities.reduce((sum, activity) => sum + (Number(activity.estimatedCost) || 0), 0);
    return {
      ...day,
      dayNumber: Number(day.dayNumber || dayIndex + 1),
      title: day.title || `Ngày ${day.dayNumber || dayIndex + 1}`,
      activities,
      estimatedCost,
    };
  });

  nextItinerary.estimatedTotalCost = nextItinerary.days.reduce((sum, day) => sum + (Number(day.estimatedCost) || 0), 0);
  nextItinerary.warnings = Array.isArray(nextItinerary.warnings) ? nextItinerary.warnings : [];
  nextItinerary.recommendations = Array.isArray(nextItinerary.recommendations) ? nextItinerary.recommendations : [];
  return nextItinerary;
}

export function ensureItineraryActivityIds(itinerary) {
  const nextItinerary = clone(itinerary) || {};
  nextItinerary.days = Array.isArray(nextItinerary.days) ? nextItinerary.days : [];

  nextItinerary.days = nextItinerary.days.map((day, dayIndex) => ({
    ...day,
    dayNumber: Number(day.dayNumber || dayIndex + 1),
    title: day.title || `Ngày ${day.dayNumber || dayIndex + 1}`,
    activities: (Array.isArray(day.activities) ? day.activities : []).map((activity, activityIndex) => ({
      ...activity,
      activityId: String(activity.activityId || `${day.date || 'day'}-${day.dayNumber || dayIndex + 1}-${activityIndex + 1}`),
      activityName: activity.activityName || 'Hoạt động mới',
      activityType: activity.activityType || 'free_time',
      placeId: activity.placeId ?? null,
      placeName: activity.placeName || '',
      address: activity.address || '',
      latitude: Number.isFinite(Number(activity.latitude)) ? Number(activity.latitude) : null,
      longitude: Number.isFinite(Number(activity.longitude)) ? Number(activity.longitude) : null,
      category: activity.category || '',
      estimatedCost: normalizeDraftActivityCost(activity),
      transportType: activity.transportType || 'mixed',
      travelTimeMinutes: Number(activity.travelTimeMinutes || 0),
      visitDurationMinutes: Number(activity.visitDurationMinutes || 60),
      description: activity.description || '',
      reason: activity.reason || '',
      note: activity.note || '',
      startTime: activity.startTime || '09:00',
      endTime: activity.endTime || '10:00',
    })),
  }));

  return recalculateDraftTotals(nextItinerary);
}

export function updateActivityInDraft(itinerary, dayNumber, activityId, updater) {
  const nextItinerary = clone(itinerary);
  nextItinerary.days = nextItinerary.days.map((day) => {
    if (Number(day.dayNumber) !== Number(dayNumber)) return day;
    return {
      ...day,
      activities: day.activities.map((activity) => (
        String(activity.activityId) === String(activityId)
          ? { ...activity, ...(typeof updater === 'function' ? updater(activity) : updater) }
          : activity
      )),
    };
  });
  return recalculateDraftTotals(nextItinerary);
}

export function deleteActivityFromDraft(itinerary, dayNumber, activityId) {
  const nextItinerary = clone(itinerary);
  nextItinerary.days = nextItinerary.days.map((day) => {
    if (Number(day.dayNumber) !== Number(dayNumber)) return day;
    return {
      ...day,
      activities: day.activities.filter((activity) => String(activity.activityId) !== String(activityId)),
    };
  });
  return recalculateDraftTotals(nextItinerary);
}

export function moveActivityInDraft(itinerary, dayNumber, activityId, direction) {
  const nextItinerary = clone(itinerary);
  nextItinerary.days = nextItinerary.days.map((day) => {
    if (Number(day.dayNumber) !== Number(dayNumber)) return day;
    const activities = [...day.activities];
    const currentIndex = activities.findIndex((activity) => String(activity.activityId) === String(activityId));
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= activities.length) return day;
    const [removed] = activities.splice(currentIndex, 1);
    activities.splice(targetIndex, 0, removed);
    return { ...day, activities };
  });
  return recalculateDraftTotals(nextItinerary);
}

export function addActivityToDraftDay(itinerary, dayNumber) {
  const nextItinerary = clone(itinerary);
  nextItinerary.days = nextItinerary.days.map((day) => {
    if (Number(day.dayNumber) !== Number(dayNumber)) return day;
    const lastActivity = day.activities[day.activities.length - 1];
    const startTime = lastActivity?.endTime || '15:00';
    return {
      ...day,
      activities: [
        ...day.activities,
        {
          activityId: `${day.date || 'day'}-${day.dayNumber}-${Date.now()}`,
          startTime,
          endTime: '16:00',
          activityName: 'Hoạt động mới',
          activityType: 'free_time',
          placeId: null,
          placeName: '',
          address: '',
          latitude: null,
          longitude: null,
          category: '',
          estimatedCost: 0,
          transportType: 'mixed',
          travelTimeMinutes: 0,
          visitDurationMinutes: 60,
          description: '',
          reason: '',
          note: '',
        },
      ],
    };
  });
  return recalculateDraftTotals(nextItinerary);
}

export function createPlannerInitialInput(context = {}) {
  const savedInput = context?.savedSnapshot?.input || context?.itinerary?.input || {};
  const savedAI = context?.savedSnapshot?.aiItinerary || context?.itinerary?.aiItinerary || context?.savedAIItinerary || null;
  const startDate = savedInput.startDate || savedAI?.days?.[0]?.date || todayIso();
  const endDate = savedInput.endDate || savedAI?.days?.[savedAI?.days?.length - 1]?.date || addDays(startDate, 2);

  return {
    tripId: context.groupId || context.tripId || '',
    groupId: context.groupId || '',
    destination: getCanonicalVietnamDestination(
      savedInput.destination || context.activeDestination?.name || context.savedSnapshot?.destinationName || context.groupName || ''
    ),
    startDate,
    endDate,
    dailyStartTime: savedInput.dailyStartTime || '07:00',
    dailyEndTime: savedInput.dailyEndTime || '22:00',
    numberOfPeople: String(savedInput.numberOfPeople || 2),
    totalBudget: String(savedInput.totalBudget || ''),
    accommodationAddress: savedInput.accommodation?.address || '',
    transportType: savedInput.transportType || 'mixed',
    travelPace: savedInput.travelPace || 'normal',
    interests: parseStringList(savedInput.interests).length ? parseStringList(savedInput.interests) : ['food', 'culture'],
    preferredPlaces: parseStringList(savedInput.preferredPlaces),
    excludedPlaces: parseStringList(savedInput.excludedPlaces),
    foodPreferences: parseStringList(savedInput.foodPreferences),
    additionalRequest: savedInput.additionalRequest || '',
  };
}

export function buildChatGroupItinerarySnapshot({ tripId, input, itinerary }) {
  return {
    source: 'ai-itinerary',
    tripId,
    destinationName: input.destination,
    startDate: input.startDate,
    endDate: input.endDate,
    daysCount: Array.isArray(itinerary.days) ? itinerary.days.length : 0,
    summary: itinerary.summary || '',
    warnings: Array.isArray(itinerary.warnings) ? itinerary.warnings : [],
    recommendations: Array.isArray(itinerary.recommendations) ? itinerary.recommendations : [],
    estimatedTotalCost: Number(itinerary.estimatedTotalCost || 0),
    aiItinerary: ensureItineraryActivityIds(itinerary),
    input: {
      tripId,
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      dailyStartTime: input.dailyStartTime,
      dailyEndTime: input.dailyEndTime,
      numberOfPeople: Number(input.numberOfPeople || 1),
      totalBudget: Number(input.totalBudget || 0),
      transportType: input.transportType,
      travelPace: input.travelPace,
      interests: parseStringList(input.interests),
      preferredPlaces: parseStringList(input.preferredPlaces),
      excludedPlaces: parseStringList(input.excludedPlaces),
      foodPreferences: parseStringList(input.foodPreferences),
      additionalRequest: input.additionalRequest || '',
      accommodation: {
        address: input.accommodationAddress || input.accommodation?.address || '',
        latitude: Number.isFinite(Number(input.accommodation?.latitude))
          ? Number(input.accommodation?.latitude)
          : null,
        longitude: Number.isFinite(Number(input.accommodation?.longitude))
          ? Number(input.accommodation?.longitude)
          : null,
      },
    },
    days: [],
    savedAt: new Date().toISOString(),
  };
}

export function formatAIItineraryShareMessage(itinerary) {
  const normalizedItinerary = ensureItineraryActivityIds(itinerary);
  const dayLines = normalizedItinerary.days.slice(0, 3).map((day) => {
    const activityLines = day.activities.slice(0, 3).map((activity) => `- ${activity.startTime}-${activity.endTime} ${activity.activityName}`);
    return [`Ngày ${day.dayNumber} (${day.date})`, ...activityLines].join('\n');
  });

  return [
    `✨ ${normalizedItinerary.tripTitle || 'Lịch trình AI Vivu360'}`,
    normalizedItinerary.summary || '',
    ...dayLines,
    `Tổng chi phí dự kiến: ${(Number(normalizedItinerary.estimatedTotalCost || 0)).toLocaleString('vi-VN')}đ`,
  ].filter(Boolean).join('\n');
}

export function parseFormToPayload(formState) {
  return {
    tripId: formState.tripId,
    groupId: formState.groupId,
    destination: String(formState.destination || '').trim(),
    startDate: formState.startDate,
    endDate: formState.endDate,
    dailyStartTime: formState.dailyStartTime,
    dailyEndTime: formState.dailyEndTime,
    numberOfPeople: Number(formState.numberOfPeople || 1),
    totalBudget: Number(formState.totalBudget || 0),
    accommodation: {
      address: String(formState.accommodationAddress || '').trim(),
      latitude: null,
      longitude: null,
    },
    transportType: formState.transportType,
    travelPace: formState.travelPace,
    interests: parseStringList(formState.interests),
    preferredPlaces: parseStringList(formState.preferredPlaces),
    excludedPlaces: parseStringList(formState.excludedPlaces),
    foodPreferences: parseStringList(formState.foodPreferences),
    additionalRequest: String(formState.additionalRequest || '').trim(),
  };
}

export { parseStringList, recalculateDraftTotals };
