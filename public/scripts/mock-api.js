/**
 * Mock API for local development without Cloudflare infrastructure
 *
 * To use your own test photos:
 * 1. Place images in public/images/placeholders/theatre/ or /travel/
 * 2. Any .jpg filename works - no specific naming required
 * 3. Update the PHOTO_FILES arrays below with your filenames
 */

// List your test photo filenames here
const THEATRE_PHOTOS = [
    '1.jpg',
    '2.jpg',
    '3.jpg',
    '4.jpg',
    '5.jpg',
    '6.jpg'
];

const TRAVEL_PHOTOS = [
    '1.jpg',
    '2.jpg',
    '3.jpg',
    '4.jpg',
    '5.jpg',
    '6.jpg'
];

// Generate mock photos from the file lists
function generateMockPhotos() {
    const photos = [];
    let id = 1;

    // Generate theatre photos
    THEATRE_PHOTOS.forEach((filename, index) => {
        photos.push({
            id: String(id++),
            filename: filename,
            category: 'theatre',
            uploadDate: new Date(2026, 1, index + 1).toISOString(),
            width: 1920,
            height: 1280,
            clicks: Math.floor(Math.random() * 50) + 10,
            thumbnailUrl: `/images/placeholders/theatre/${filename}`,
            fullUrl: `/images/placeholders/theatre/${filename}`
        });
    });

    // Generate travel photos
    TRAVEL_PHOTOS.forEach((filename, index) => {
        photos.push({
            id: String(id++),
            filename: filename,
            category: 'travel',
            uploadDate: new Date(2026, 1, index + 7).toISOString(),
            width: 1920,
            height: 1280,
            clicks: Math.floor(Math.random() * 50) + 10,
            thumbnailUrl: `/images/placeholders/travel/${filename}`,
            fullUrl: `/images/placeholders/travel/${filename}`
        });
    });

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
