const VIVU360_PLAN_SLUG = 'vivu360-destinations';

interface Vivu360Destination {
    ten?: string;
    tinhThanh?: string;
    viTri?: string;
    diaChi?: string;
    moTa?: string;
    tomTat?: string;
    googleMapsUrl?: string;
    giaVe?: string;
}

function coordinatesFromMapsUrl(value = ''): { lat: number; lng: number } | null {
    try {
        const query = new URL(value).searchParams.get('query') || '';
        const match = query.match(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/);
        if (!match) return null;
        const lat = Number(match[1]);
        const lng = Number(match[2]);
        return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
    } catch {
        return null;
    }
}

function priceFromText(value = ''): number {
    const digits = value.replace(/[^\d]/g, '');
    return digits ? Number(digits) : 0;
}

async function fetchDestinations(): Promise<Vivu360Destination[]> {
    const baseUrl = (process.env.VIVU360_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/api/diadiem`, {
        signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Vivu360 API returned HTTP ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

export async function getVivu360DestinationPlan() {
    const destinations = await fetchDestinations();
    const mapped = destinations
        .map(destination => ({ destination, coordinates: coordinatesFromMapsUrl(destination.googleMapsUrl) }))
        .filter((item): item is { destination: Vivu360Destination; coordinates: { lat: number; lng: number } } => !!item.coordinates);

    if (!mapped.length) return null;

    const locations = mapped.map(({ destination, coordinates }, index) => {
        const name = destination.ten || `Điểm đến ${index + 1}`;
        const province = destination.tinhThanh || destination.viTri || 'Việt Nam';
        return {
            id: index + 1,
            name,
            province,
            lat: coordinates.lat,
            lng: coordinates.lng,
            dateRange: '',
            duration: 1,
            transport: index === 0 ? '' : 'Di chuyển tự túc',
            transportType: index === 0 ? '' : 'car',
            vexereUrl: null,
            subLocations: [{
                id: 1000 + index,
                name,
                address: destination.diaChi || province,
                externalUrl: destination.googleMapsUrl || '',
                externalLabel: 'Google Maps',
                lat: coordinates.lat,
                lng: coordinates.lng,
                durationMinutes: 120,
                durationDays: 0,
                scheduledDate: '',
                scheduledPeriod: '',
                scheduledTime: '',
                description: destination.moTa || destination.tomTat || '',
                activityType: 'sightseeing',
                transportType: '',
                pricingMode: 'per_person',
                unitPrice: priceFromText(destination.giaVe),
                quantity: 1,
                surcharge: 0,
                adultPrice: 0,
                childPrice: 0,
                participantAdults: null,
                participantChildren: null,
                actualCost: 0,
            }],
        };
    });

    return {
        id: 0,
        slug: VIVU360_PLAN_SLUG,
        name: 'Khám phá điểm đến Vivu360',
        dateRange: '',
        budgetLimit: 150000000,
        sessionId: null,
        locations,
    };
}

export const VIVU360_DESTINATION_PLAN_SLUG = VIVU360_PLAN_SLUG;
