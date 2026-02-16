/**
 * Mock API for local development without Cloudflare infrastructure
 * Replace /api endpoints with mock data
 */

// Mock photo data
const MOCK_PHOTOS = [
    // Theatre photos
    {
        id: '1',
        filename: 'theatre-1.jpg',
        category: 'theatre',
        uploadDate: '2026-02-01T10:00:00Z',
        width: 1920,
        height: 1280,
        clicks: 42,
        thumbnailUrl: 'https://picsum.photos/400/600?random=1',
        fullUrl: 'https://picsum.photos/1920/1280?random=1'
    },
    {
        id: '2',
        filename: 'theatre-2.jpg',
        category: 'theatre',
        uploadDate: '2026-02-02T10:00:00Z',
        width: 1280,
        height: 1920,
        clicks: 38,
        thumbnailUrl: 'https://picsum.photos/400/600?random=2',
        fullUrl: 'https://picsum.photos/1280/1920?random=2'
    },
    {
        id: '3',
        filename: 'theatre-3.jpg',
        category: 'theatre',
        uploadDate: '2026-02-03T10:00:00Z',
        width: 1920,
        height: 1280,
        clicks: 15,
        thumbnailUrl: 'https://picsum.photos/400/300?random=3',
        fullUrl: 'https://picsum.photos/1920/1280?random=3'
    },
    // Travel photos
    {
        id: '4',
        filename: 'travel-1.jpg',
        category: 'travel',
        uploadDate: '2026-02-04T10:00:00Z',
        width: 1920,
        height: 1080,
        clicks: 55,
        thumbnailUrl: 'https://picsum.photos/400/225?random=4',
        fullUrl: 'https://picsum.photos/1920/1080?random=4'
    },
    {
        id: '5',
        filename: 'travel-2.jpg',
        category: 'travel',
        uploadDate: '2026-02-05T10:00:00Z',
        width: 1280,
        height: 1920,
        clicks: 33,
        thumbnailUrl: 'https://picsum.photos/400/600?random=5',
        fullUrl: 'https://picsum.photos/1280/1920?random=5'
    },
    {
        id: '6',
        filename: 'travel-3.jpg',
        category: 'travel',
        uploadDate: '2026-02-06T10:00:00Z',
        width: 1920,
        height: 1280,
        clicks: 27,
        thumbnailUrl: 'https://picsum.photos/400/267?random=6',
        fullUrl: 'https://picsum.photos/1920/1280?random=6'
    },
    // More variety
    {
        id: '7',
        filename: 'theatre-4.jpg',
        category: 'theatre',
        uploadDate: '2026-02-07T10:00:00Z',
        width: 1600,
        height: 900,
        clicks: 19,
        thumbnailUrl: 'https://picsum.photos/400/225?random=7',
        fullUrl: 'https://picsum.photos/1600/900?random=7'
    },
    {
        id: '8',
        filename: 'travel-4.jpg',
        category: 'travel',
        uploadDate: '2026-02-08T10:00:00Z',
        width: 1920,
        height: 1440,
        clicks: 44,
        thumbnailUrl: 'https://picsum.photos/400/300?random=8',
        fullUrl: 'https://picsum.photos/1920/1440?random=8'
    },
    {
        id: '9',
        filename: 'theatre-5.jpg',
        category: 'theatre',
        uploadDate: '2026-02-09T10:00:00Z',
        width: 1920,
        height: 1280,
        clicks: 22,
        thumbnailUrl: 'https://picsum.photos/400/267?random=9',
        fullUrl: 'https://picsum.photos/1920/1280?random=9'
    },
    {
        id: '10',
        filename: 'travel-5.jpg',
        category: 'travel',
        uploadDate: '2026-02-10T10:00:00Z',
        width: 1280,
        height: 1920,
        clicks: 31,
        thumbnailUrl: 'https://picsum.photos/400/600?random=10',
        fullUrl: 'https://picsum.photos/1280/1920?random=10'
    },
    {
        id: '11',
        filename: 'theatre-6.jpg',
        category: 'theatre',
        uploadDate: '2026-02-11T10:00:00Z',
        width: 1920,
        height: 1080,
        clicks: 18,
        thumbnailUrl: 'https://picsum.photos/400/225?random=11',
        fullUrl: 'https://picsum.photos/1920/1080?random=11'
    },
    {
        id: '12',
        filename: 'travel-6.jpg',
        category: 'travel',
        uploadDate: '2026-02-12T10:00:00Z',
        width: 1920,
        height: 1280,
        clicks: 36,
        thumbnailUrl: 'https://picsum.photos/400/267?random=12',
        fullUrl: 'https://picsum.photos/1920/1280?random=12'
    }
];

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
