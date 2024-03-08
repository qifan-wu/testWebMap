

export const STATIONS_DATA_FILE = 'data/stations_all.json'

export const SEARCH_RADIUS = 0.009; // Approximately 1km in lat/lon
export const SEARCH_RADIUS_METER = 1000;

// export function addLayerToMap(layer) {
//     map.addLayer(layer);
// }

export const SOPOI_CAT = {
    amenity: [
        "social facility", "library", "arts centre", "school", "university", "college",
        "restaurant", "cafe", "fast food", "bar", "pub", "ice cream", "nightclub",
        "internet cafe", "food court", "biergarten", "canteen", "marketplace",
        "social centre", "community centre", "conference centre", "events venue",
        "lavoir", "coworking space", "exhibition centre", "kitchen", "social club",
        "marae", "stage", "music venue", "concert hall", "festival grounds",
        "events centre", "theatre", "cinema", "bbq", "public bookcase", "casino",
        "dojo", "love hotel", "kneipp water cure", "karaoke box", "hookah lounge",
        "stripclub", "clubhouse", "swingerclub", "public bath", "place of worship"
    ],
    leisure: [
        "pitch", "swimming pool", "park", "garden", "playground", "picnic table",
        "sports centre", "stadium", "track", "fitness centre", "fitness station",
        "outdoor seating", "dog park", "recreation ground", "sports hall", "sauna",
        "water park", "dance", "miniature golf", "adult gaming centre",
        "swimming area", "bandstand", "bowling alley", "amusement arcade",
        "escape game", "tanning salon", "hackerspace", "indoor play", "hot tub"
    ],
    shop: [
        "convenience", "supermarket", "clothes", "hairdresser", "car repair",
        "bakery", "beauty", "kiosk", "hardware", "alcohol", "florist", "electronics",
        "shoes", "variety store", "mall", "optician", "jewelry", "doityourself", "gift",
        "greengrocer", "books", "bicycle", "department store", "laundry", "sports", "pet",
        "stationery", "confectionery", "cosmetics", "tailor", "newsagent", "beverages",
        "tobacco", "garden centre", "massage", "pastry", "deli", "ticket", "toys", "seafood",
        "houseware", "wine", "photo", "charity", "tattoo", "art", "outdoor", "second hand",
        "fabric", "antiques", "coffee", "craft", "tea", "baby goods", "musical instrument",
        "music", "motorcycle repair", "dairy", "chocolate", "cheese", "pet grooming",
        "health food", "video games", "fishing", "grocery", "nutrition supplements",
        "fashion accessories", "watches", "cannabis", "estate agent", "sewing", "video",
        "erotic", "herbalist", "frozen food", "party", "shoe repair", "repair", "ice cream",
        "games", "pottery", "fashion", "spices", "photo studio", "candles", "water sports",
        "pasta", "honey", "rice", "anime", "nuts", "trophy", "wool", "wigs", "psychic",
        "ski", "shopping centre"
    ],
    historic: [
        "memorial", "monument", "cemetery", "heritage"
    ]
};

// export const HIGHWAY_TYPES = "motorway,trunk,primary,secondary,tertiary,unclassified,residential";
export const HIGHWAY_TYPES = "motorway,trunk,primary,secondary,tertiary,unclassified,residential,motorway_link,living_street,pedestrian,path,track,service";
export const OHSOME_ENDPOINT = "https://api.ohsome.org/v1/elements";
