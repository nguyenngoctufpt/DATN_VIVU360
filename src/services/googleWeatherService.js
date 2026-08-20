const GOOGLE_WEATHER_ENDPOINT = 'https://weather.googleapis.com/v1/forecast/days:lookup';

const WEATHER_TYPE_TO_EMOJI = {
  CLEAR: '??',
  MOSTLY_CLEAR: '???',
  PARTLY_CLOUDY: '?',
  MOSTLY_CLOUDY: '???',
  CLOUDY: '??',
  WINDY: '??',
  WIND_AND_RAIN: '???',
  LIGHT_RAIN_SHOWERS: '???',
  CHANCE_OF_SHOWERS: '???',
  SCATTERED_SHOWERS: '???',
  RAIN_SHOWERS: '???',
  HEAVY_RAIN_SHOWERS: '??',
  LIGHT_TO_MODERATE_RAIN: '???',
  MODERATE_TO_HEAVY_RAIN: '???',
  RAIN: '???',
  LIGHT_RAIN: '???',
  HEAVY_RAIN: '??',
  THUNDERSTORMS: '??',
  SNOW: '??',
  FOG: '???',
};

const padNumber = (value) => String(value).padStart(2, '0');

const toIsoDate = (displayDate) => {
  if (!displayDate?.year || !displayDate?.month || !displayDate?.day) {
    return '';
  }

  return [
    padNumber(displayDate.year),
    padNumber(displayDate.month),
    padNumber(displayDate.day),
  ].join('-');
};

const readTemperature = (temperature) => {
  if (typeof temperature?.degrees !== 'number') return null;
  return Math.round(temperature.degrees);
};

const readPercent = (value) => {
  if (typeof value === 'number') return Math.round(value);
  return null;
};

const readWindSpeed = (wind) => {
  if (typeof wind?.speed?.value !== 'number') return null;
  return Math.round(wind.speed.value);
};

const buildWeatherQuery = (params) =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

export async function fetchGoogleWeatherForecast({
  latitude,
  longitude,
  days = 3,
  languageCode = 'vi',
}) {
  const apiKey =
    process.env.EXPO_PUBLIC_GOOGLE_WEATHER_API_KEY ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('MISSING_GOOGLE_WEATHER_API_KEY');
  }

  const query = buildWeatherQuery({
    key: apiKey,
    'location.latitude': latitude,
    'location.longitude': longitude,
    days,
    pageSize: days,
    languageCode,
  });

  const response = await fetch(`${GOOGLE_WEATHER_ENDPOINT}?${query}`);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'GOOGLE_WEATHER_REQUEST_FAILED');
  }

  return Array.isArray(payload?.forecastDays)
    ? payload.forecastDays.map((item) => {
        const daytimeForecast = item?.daytimeForecast || {};
        const nighttimeForecast = item?.nighttimeForecast || {};
        const weatherCondition =
          daytimeForecast?.weatherCondition || nighttimeForecast?.weatherCondition || {};

        return {
          date: toIsoDate(item?.displayDate),
          description:
            weatherCondition?.description?.text ||
            'Thời tiết đang được cập nhật',
          weatherType: weatherCondition?.type || 'TYPE_UNSPECIFIED',
          iconText: WEATHER_TYPE_TO_EMOJI[weatherCondition?.type] || '???',
          maxTemp: readTemperature(item?.maxTemperature),
          minTemp: readTemperature(item?.minTemperature),
          humidity: readPercent(daytimeForecast?.relativeHumidity),
          rainChance: readPercent(daytimeForecast?.precipitation?.probability?.percent),
          uvIndex: readPercent(daytimeForecast?.uvIndex),
          windKph: readWindSpeed(daytimeForecast?.wind),
          sunriseTime: item?.sunEvents?.sunriseTime || null,
          sunsetTime: item?.sunEvents?.sunsetTime || null,
        };
      })
    : [];
}
