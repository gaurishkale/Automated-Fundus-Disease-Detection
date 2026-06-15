const CITIES = {
  mumbai: { lat: 19.076, lng: 72.8777, label: "Mumbai" },
  navimumbai: { lat: 19.033, lng: 73.0297, label: "Navi Mumbai" },
};

const SPECIALTIES = {
  all: { label: "All Specialists", keyword: "ophthalmologist eye specialist retina glaucoma cataract pediatric ophthalmologist" },
  retina: { label: "Retina", keyword: "retina specialist ophthalmologist" },
  glaucoma: { label: "Glaucoma", keyword: "glaucoma specialist ophthalmologist" },
  cataract: { label: "Cataract", keyword: "cataract surgeon ophthalmologist" },
  pediatric: { label: "Pediatric", keyword: "pediatric ophthalmologist" },
  cornea: { label: "Cornea", keyword: "cornea specialist ophthalmologist" },
};

const MAX_RESULTS = 20;
const SEARCH_RADIUS = 10000;

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function searchNearbyDoctors(map, cityKey, specialtyKey) {
  return new Promise((resolve, reject) => {
    const city = CITIES[cityKey];
    const specialty = SPECIALTIES[specialtyKey] || SPECIALTIES.all;
    if (!city || !map) {
      reject(new Error("Invalid city or map instance."));
      return;
    }

    const service = new window.google.maps.places.PlacesService(map);
    const request = {
      location: new window.google.maps.LatLng(city.lat, city.lng),
      radius: SEARCH_RADIUS,
      type: "doctor",
      keyword: specialty.keyword,
    };

    service.nearbySearch(request, (results, status) => {
      if (status !== window.google.maps.places.PlacesServiceStatus.OK || !results) {
        resolve([]);
        return;
      }

      const doctors = results.slice(0, MAX_RESULTS).map((place) => {
        const lat = place.geometry?.location?.lat();
        const lng = place.geometry?.location?.lng();
        const distance = lat && lng ? haversineDistance(city.lat, city.lng, lat, lng) : null;

        return {
          placeId: place.place_id,
          name: place.name || "Unknown",
          rating: place.rating || 0,
          totalReviews: place.user_ratings_total || 0,
          address: place.vicinity || "Address not available",
          isOpen: place.opening_hours?.isOpen?.() ?? null,
          lat,
          lng,
          distance: distance !== null ? Math.round(distance * 10) / 10 : null,
        };
      });

      doctors.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        if (b.totalReviews !== a.totalReviews) return b.totalReviews - a.totalReviews;
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
        return 0;
      });

      resolve(doctors);
    });
  });
}

export { CITIES, SPECIALTIES, searchNearbyDoctors, haversineDistance };
