/**
 * Mock API for local development without Cloudflare infrastructure
 *
 * To use your own test photos:
 * 1. Place images in public/images/placeholders/theatre/ or /travel/
 * 2. Name them: 1.jpg, 2.jpg, 3.jpg, etc.
 * 3. The mock API will automatically use them
 */

// Generate mock photos - expects numbered files in category folders
function generateMockPhotos() {
    const photos = [];
    let id = 1;

    // Theatre photos (6 photos expected: 1.jpg through 6.jpg)
    for (let i = 1; i <= 6; i++) {
        photos.push({
            id: String(id++),
            filename: `${i}.jpg`,
            category: 'theatre',
            uploadDate: new Date(2026, 1, i).toISOString(),
            width: 1920,
            height: 1280,
            clicks: Math.floor(Math.random() * 50) + 10,
            thumbnailUrl: `/images/placeholders/theatre/${i}.jpg`,
            fullUrl: `/images/placeholders/theatre/${i}.jpg`
        });
    }

    // Travel photos (6 photos expected: 1.jpg through 6.jpg)
    for (let i = 1; i <= 6; i++) {
        photos.push({
            id: String(id++),
            filename: `${i}.jpg`,
            category: 'travel',
            uploadDate: new Date(2026, 1, i + 6).toISOString(),
            width: 1920,
            height: 1280,
            clicks: Math.floor(Math.random() * 50) + 10,
            thumbnailUrl: `/images/placeholders/travel/${i}.jpg`,
            fullUrl: `/images/placeholders/travel/${i}.jpg`
        });
    }

    return photos;
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
