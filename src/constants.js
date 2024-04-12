// Local files
export const STATIONS_DATA_FILE = 'data/stations_all.json'
export const STATIONS_INFO_FILE = 'data/stations_info.json'
export const METRO_FILE = 'data/metros.json';

// variable constants
export const SEARCH_RADIUS = 0.009; // Approximately 1km in lat/lon
export const SEARCH_RADIUS_METER = 1000;

// Endpoints
export const OHSOME_ENDPOINT = "https://api.ohsome.org/v1/elements";
export const OVERPASS_INTERPRETER = "https://overpass-api.de/api/interpreter";
export const OSM_ORG_ENDPOINT = "https://www.openstreetmap.org";
// Categories
// POI
export const CATEGORIE_KEYS = ["amenity", "leisure", "shop", "historic"];
export const SOPOI_CAT = {
    amenity: [
        "social_facility", "library", "arts_centre", "school", "university", "college",
        "restaurant", "cafe", "fast_food", "bar", "pub", "ice_cream", "nightclub",
        "internet_cafe", "food_court", "biergarten", "canteen", "marketplace",
        "social_centre", "community_centre", "conference_centre", "events_venue",
        "lavoir", "coworking_space", "exhibition_centre", "kitchen", "social_club",
        "marae", "stage", "music_venue", "concert_hall", "festival_grounds",
        "events_centre", "theatre", "cinema", "bbq", "public_bookcase", "casino",
        "dojo", "love_hotel", "kneipp_water_cure", "karaoke_box", "hookah_lounge",
        "stripclub", "clubhouse", "swingerclub", "public_bath", "place_of_worship"
    ],
    leisure: [
        "pitch", "swimming_pool", "park", "garden", "playground", "picnic_table",
        "sports_centre", "stadium", "track", "fitness_centre", "fitness_station",
        "outdoor_seating", "dog_park", "recreation_ground", "sports_hall", "sauna",
        "water_park", "dance", "miniature_golf", "adult_gaming_centre",
        "swimming_area", "bandstand", "bowling_alley", "amusement_arcade",
        "escape_game", "tanning_salon", "hackerspace", "indoor_play", "hot_tub"
    ],
    shop: [
        "convenience", "supermarket", "clothes", "hairdresser", "car repair",
        "bakery", "beauty", "kiosk", "hardware", "alcohol", "florist", "electronics",
        "shoes", "variety store", "mall", "optician", "jewelry", "doityourself", "gift",
        "greengrocer", "books", "bicycle", "department store", "laundry", "sports", "pet",
        "stationery", "confectionery", "cosmetics", "tailor", "newsagent", "beverages",
        "tobacco", "garden_centre", "massage", "pastry", "deli", "ticket", "toys", "seafood",
        "houseware", "wine", "photo", "charity", "tattoo", "art", "outdoor", "second hand",
        "fabric", "antiques", "coffee", "craft", "tea", "baby_goods", "musical_instrument",
        "music", "motorcycle_repair", "dairy", "chocolate", "cheese", "pet_grooming",
        "health_food", "video_games", "fishing", "grocery", "nutrition_supplements",
        "fashion_accessories", "watches", "cannabis", "estate_agent", "sewing", "video",
        "erotic", "herbalist", "frozen_food", "party", "shoe_repair", "repair", "ice_cream",
        "games", "pottery", "fashion", "spices", "photo_studio", "candles", "water_sports",
        "pasta", "honey", "rice", "anime", "nuts", "trophy", "wool", "wigs", "psychic",
        "ski", "shopping_centre"
    ],
    historic: [
        "memorial", "monument", "cemetery", "heritage"
    ]
};

export const SOPOI_CAT_DETAIL = {
    amenity: {
        public_institution: [
            "social_facility", "library", "arts_centre", "school", "university", "college"
        ],
        commerce: [
            "restaurant", "cafe", "fast_food", "bar", "pub", "ice_cream", "nightclub",
            "internet_cafe", "food_court", "biergarten", "canteen", "marketplace",
        ],
        community_space: [
            "social_centre", "community_centre", "conference_centre", "events_venue",
            "lavoir", "coworking_space", "exhibition_centre", "kitchen", "social_club",
            "marae", "stage", "music_venue", "concert_hall", "festival_grounds",
            "events_centre"
        ],
        recreational_activities: [
            "theatre", "cinema", "bbq", "public_bookcase", "casino",
            "dojo", "love_hotel", "kneipp_water_cure", "karaoke_box", "hookah_lounge",
            "stripclub", "clubhouse", "swingerclub", "public_bath"
        ],
        religion: [
            "place_of_worship"
        ]
    },
    leisure: {
        recreational_activities: [
            "pitch", "swimming_pool", "park", "garden", "playground", "picnic_table",
            "sports_centre", "stadium", "track", "fitness_centre", "fitness_station",
            "outdoor_seating", "dog_park", "recreation_ground", "sports_hall", "sauna",
            "water_park", "dance", "miniature_golf", "adult_gaming_centre",
            "swimming_area", "bandstand", "bowling_alley", "amusement_arcade",
            "escape_game", "tanning_salon", "hackerspace", "indoor_play", "hot_tub"
        ]
    },
    shop: {
        commerce: [
            "convenience", "supermarket", "clothes", "hairdresser", "car repair",
            "bakery", "beauty", "kiosk", "hardware", "alcohol", "florist", "electronics",
            "shoes", "variety store", "mall", "optician", "jewelry", "doityourself", "gift",
            "greengrocer", "books", "bicycle", "department store", "laundry", "sports", "pet",
            "stationery", "confectionery", "cosmetics", "tailor", "newsagent", "beverages",
            "tobacco", "garden_centre", "massage", "pastry", "deli", "ticket", "toys", "seafood",
            "houseware", "wine", "photo", "charity", "tattoo", "art", "outdoor", "second hand",
            "fabric", "antiques", "coffee", "craft", "tea", "baby_goods", "musical_instrument",
            "music", "motorcycle_repair", "dairy", "chocolate", "cheese", "pet_grooming",
            "health_food", "video_games", "fishing", "grocery", "nutrition_supplements",
            "fashion_accessories", "watches", "cannabis", "estate_agent", "sewing", "video",
            "erotic", "herbalist", "frozen_food", "party", "shoe_repair", "repair", "ice_cream",
            "games", "pottery", "fashion", "spices", "photo_studio", "candles", "water_sports",
            "pasta", "honey", "rice", "anime", "nuts", "trophy", "wool", "wigs", "psychic",
            "ski", "shopping_centre"
        ]
    },
    historic: {
        public_institution: [
            "memorial", "monument", "cemetery", "heritage"
        ]
    }
};


// Road
export const HIGHWAY_TYPES = "motorway,primary,secondary,tertiary,residential,pedestrian,cycleway,living_street,path,footway";
export const MOTER_ROAD_TYPES = ["primary", "secondary", "tertiary", "motorway"];
export const PEDCYCLE_ROAD_TYPES = ["residential", "footway", "path", "pedestrian", "living_street", "cycleway"];
// export const OTHER_ROAD_TYPES = ["remainder"];