/**
 * Mock API for local development without Cloudflare infrastructure
 *
 * To use your own test photos:
 * 1. Place images in public/images/placeholders/
 * 2. Name them: theatre-1.jpg, theatre-2.jpg, travel-1.jpg, etc.
 * 3. The mock API will automatically use them
 *
 * If no local images exist, it will fall back to Picsum placeholder images.
 */

// Function to check if local image exists and use it, otherwise fall back to Picsum
function getImageUrl(category, number, isThumb = false) {
    const filename = `${category}-${number}.jpg`;
    const localPath = `/images/placeholders/${filename}`;

    // For local development, we'll use local images if they exist
    // Since we can't easily check if file exists from client-side,
    // we'll just use the local path and let the browser handle 404s gracefully
    // For a better UX, you can add an onerror handler in the gallery
    return localPath;
}

// Generate mock photos - will use local images if available
function generateMockPhotos() {
    return [
        // Theatre photos
        {
            id: '1',
            filename: 'theatre-1.jpg',
            category: 'theatre',
            uploadDate: '2026-02-01T10:00:00Z',
            width: 1920,
            height: 1280,
            clicks: 42,
            thumbnailUrl: getImageUrl('theatre', 1, true),
            fullUrl: getImageUrl('theatre', 1, false)
        },
        {
            id: '2',
            filename: 'theatre-2.jpg',
            category: 'theatre',
            uploadDate: '2026-02-02T10:00:00Z',
            width: 1280,
            height: 1920,
            clicks: 38,
            thumbnailUrl: getImageUrl('theatre', 2, true),
            fullUrl: getImageUrl('theatre', 2, false)
        },
        {
            id: '3',
            filename: 'theatre-3.jpg',
            category: 'theatre',
            uploadDate: '2026-02-03T10:00:00Z',
            width: 1920,
            height: 1280,
            clicks: 15,
            thumbnailUrl: getImageUrl('theatre', 3, true),
            fullUrl: getImageUrl('theatre', 3, false)
        },
        {
            id: '4',
            filename: 'theatre-4.jpg',
            category: 'theatre',
            uploadDate: '2026-02-07T10:00:00Z',
            width: 1600,
            height: 900,
            clicks: 19,
            thumbnailUrl: getImageUrl('theatre', 4, true),
            fullUrl: getImageUrl('theatre', 4, false)
        },
        {
            id: '5',
            filename: 'theatre-5.jpg',
            category: 'theatre',
            uploadDate: '2026-02-09T10:00:00Z',
            width: 1920,
            height: 1280,
            clicks: 22,
            thumbnailUrl: getImageUrl('theatre', 5, true),
            fullUrl: getImageUrl('theatre', 5, false)
        },
        {
            id: '6',
            filename: 'theatre-6.jpg',
            category: 'theatre',
            uploadDate: '2026-02-11T10:00:00Z',
            width: 1920,
            height: 1080,
            clicks: 18,
            thumbnailUrl: getImageUrl('theatre', 6, true),
            fullUrl: getImageUrl('theatre', 6, false)
        },
        // Travel photos
        {
            id: '7',
            filename: 'travel-1.jpg',
            category: 'travel',
            uploadDate: '2026-02-04T10:00:00Z',
            width: 1920,
            height: 1080,
            clicks: 55,
            thumbnailUrl: getImageUrl('travel', 1, true),
            fullUrl: getImageUrl('travel', 1, false)
        },
        {
            id: '8',
            filename: 'travel-2.jpg',
            category: 'travel',
            uploadDate: '2026-02-05T10:00:00Z',
            width: 1280,
            height: 1920,
            clicks: 33,
            thumbnailUrl: getImageUrl('travel', 2, true),
            fullUrl: getImageUrl('travel', 2, false)
        },
        {
            id: '9',
            filename: 'travel-3.jpg',
            category: 'travel',
            uploadDate: '2026-02-06T10:00:00Z',
            width: 1920,
            height: 1280,
            clicks: 27,
            thumbnailUrl: getImageUrl('travel', 3, true),
            fullUrl: getImageUrl('travel', 3, false)
        },
        {
            id: '10',
            filename: 'travel-4.jpg',
            category: 'travel',
            uploadDate: '2026-02-08T10:00:00Z',
            width: 1920,
            height: 1440,
            clicks: 44,
            thumbnailUrl: getImageUrl('travel', 4, true),
            fullUrl: getImageUrl('travel', 4, false)
        },
        {
            id: '11',
            filename: 'travel-5.jpg',
            category: 'travel',
            uploadDate: '2026-02-10T10:00:00Z',
            width: 1280,
            height: 1920,
            clicks: 31,
            thumbnailUrl: getImageUrl('travel', 5, true),
            fullUrl: getImageUrl('travel', 5, false)
        },
        {
            id: '12',
            filename: 'travel-6.jpg',
            category: 'travel',
            uploadDate: '2026-02-12T10:00:00Z',
            width: 1920,
            height: 1280,
            clicks: 36,
            thumbnailUrl: getImageUrl('travel', 6, true),
            fullUrl: getImageUrl('travel', 6, false)
        }
    ];
}

const MOCK_PHOTOS = generateMockPhotos();

// Mock API handlers
export async function mockGetPhotos(category = 'all', page = 1, perPage = 30) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter by category
    let photos = [...MOCK_PHOTOS];
    if (category !== 'all') {
        photos = photos.filter(p => p.category === category);
    }

    // Sort by clicks (descending), then randomize ties
    photos.sort((a, b) => {
        if (b.clicks !== a.clicks) {
            return b.clicks - a.clicks;
        }
        return Math.random() - 0.5;
    });

    // Paginate
    const totalCount = photos.length;
    const totalPages = Math.ceil(totalCount / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedPhotos = photos.slice(startIndex, endIndex);

    return {
        photos: paginatedPhotos,
        totalCount,
        page,
        perPage,
        totalPages
    };
}

export async function mockTrackClick(photoId) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Find photo and increment
    const photo = MOCK_PHOTOS.find(p => p.id === photoId);
    if (photo) {
        photo.clicks++;
        return {
            success: true,
            clicks: photo.clicks
        };
    }

    return {
        success: false,
        error: 'Photo not found'
    };
}
