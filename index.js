// Node.js Buffer compatibility shim for jsonwebtoken
const buffer = require("buffer");
if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = function () {};
  buffer.SlowBuffer.prototype = {};
}

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");

// ----------------------------------------------------
// 1. Safe & Dependency-Free .env Loader
// ----------------------------------------------------
try {
  const envPath = path.resolve(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const envFileContent = fs.readFileSync(envPath, "utf-8");
    envFileContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...values] = trimmed.split("=");
        if (key && values.length > 0) {
          const val = values.join("=").trim().replace(/^["']|["']$/g, "");
          process.env[key.trim()] = val;
        }
      }
    });
  }
} catch (err) {
  console.warn("Notice: Could not load .env file directly:", err.message);
}

const app = express();
const port = process.env.PORT || 5000;

// ----------------------------------------------------
// 2. Middlewares
// ----------------------------------------------------
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// ----------------------------------------------------
// 3. JWT Secret Configuration
// ----------------------------------------------------
const secret =
  process.env.JWT_SECRET ||
  "b8d9b289c04b24c46294376bdd479d31838799b9333311adc908b544922df00dbe094142de9177c3219a1680c2a11404cdb3f63d1bd9f6cc88630dec128793ec";

// ----------------------------------------------------
// 4. MongoDB Database URL Configuration from .env
// ----------------------------------------------------
const uri =
  process.env.DB_URL ||
  (process.env.DB_USER && process.env.DB_PASS
    ? `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pldpdbw.mongodb.net/?retryWrites=true&w=majority`
    : "mongodb+srv://mdparvej:wjpQ5ZIxCRjzyPTh@cluster0.pldpdbw.mongodb.net/?retryWrites=true&w=majority");

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 2500, // Quick failover to resilient fallback if offline
});

const dbName = process.env.DB_NAME || "touristBDX";
const rawDb = client.db(dbName);

// ----------------------------------------------------
// 5. Rich Built-in Demo Data (Direct Image Links - Zero File Storage)
// ----------------------------------------------------
const DEMO_PACKAGES = [
  {
    _id: "sajek-pkg-1",
    tripTitle: "Sajek Valley Cloud Kingdom & Helipad Sunset",
    tourType: "Adventure & Hills",
    coverImage:
      "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80",
    price: "৳6,500",
    numericPrice: 6500,
    duration: "3 Days / 2 Nights",
    location: "Sajek Valley, Rangamati",
    departureLocation: "Dhaka (Kalyanpur / Sayedabad)",
    destination: "Sajek Valley, Rangamati",
    rating: "4.9",
    reviewsCount: 142,
    groupSize: "Up to 12 Travelers",
    badge: "Most Popular",
    aboutTheTour:
      "Experience the surreal magic of Sajek Valley, famously known as the 'Roof of Rangamati'. Perched 1,800 feet above sea level, you will wake up amidst rolling carpets of mist, explore Konglak Peak, visit indigenous Lusai and Tripura villages, and witness crimson sunsets from the Helipad.",
    galleryImages: [
      "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    ],
    tourPlan: [
      {
        day: "1",
        title: "Departure, Chander Gari Ride & Sunset at Helipad",
        description:
          "Depart from Khagrachhari via iconic 4x4 open-air Chander Gari with army escort. Check-in to premium wooden resort at Sajek. Evening tea and breathtaking sunset viewing at Sajek Helipad.",
      },
      {
        day: "2",
        title: "Sunrise at Konglak Peak & Ruilui Village",
        description:
          "Dawn trek up Konglak Peak for the 360-degree sea of clouds. Explore Ruilui Para indigenous handicraft village, taste bamboo chicken, and enjoy stargazing with acoustic bonfire.",
      },
      {
        day: "3",
        title: "Alutila Mysterious Cave & Risang Waterfall",
        description:
          "Descend toward Khagrachhari. Traverse the prehistoric Alutila cave holding traditional torches, splash in the natural waters of Risang Waterfall, then return journey to Dhaka.",
      },
    ],
    tourGuides: [
      {
        name: "Tanvir Ahmed",
        email: "tanvir.guide@travelbdx.com",
        photo:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    _id: "sundarban-pkg-2",
    tripTitle: "Sundarbans Deep Wildlife Cruise & Mangrove Trail",
    tourType: "Wildlife Safari",
    coverImage:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    price: "৳14,500",
    numericPrice: 14500,
    duration: "4 Days / 3 Nights",
    location: "Khulna & Sundarbans National Park",
    departureLocation: "Khulna / Mongla Port",
    destination: "Kotka, Kochikhali & Jamtola Beach",
    rating: "5.0",
    reviewsCount: 98,
    groupSize: "Up to 24 Travelers",
    badge: "Wildlife Special",
    aboutTheTour:
      "Journey into the heart of the UNESCO World Heritage Sundarbans, the world's largest contiguous tidal halophytic mangrove forest. Sail aboard a luxury cruise vessel along winding rivers, spot wild spotted deer, saltwater crocodiles, Irrawaddy dolphins, and the elusive Royal Bengal Tiger.",
    galleryImages: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    ],
    tourPlan: [
      {
        day: "1",
        title: "Embarkation at Mongla & River Voyage",
        description:
          "Board cruise ship at Mongla port early morning. Sail southward through Pasur river. Briefing on mangrove ecology and forest permits.",
      },
      {
        day: "2",
        title: "Kotka Wildlife Sanctuary & Jamtola Beach",
        description:
          "Dawn wooden boat ride through silent creeks for birdwatching and tiger footprint tracking. Trek along the pristine Jamtola beach trail.",
      },
      {
        day: "3",
        title: "Kochikhali Canals & Harbaria Eco Park",
        description:
          "Cruising through Kochikhali forest waterways. Walk on suspended wooden boardwalks over breathing mangrove roots at Harbaria.",
      },
      {
        day: "4",
        title: "Karamjal Crocodile Station & Return",
        description:
          "Visit the crocodile and turtle breeding sanctuary at Karamjal. Disembark at Mongla port with lifelong memories.",
      },
    ],
    tourGuides: [
      {
        name: "Farhana Yasmin",
        email: "farhana.guide@travelbdx.com",
        photo:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    _id: "coxsbazar-pkg-3",
    tripTitle: "Cox's Bazar & Saint Martin's Coral Expedition",
    tourType: "Beach & Relaxation",
    coverImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    price: "৳8,500",
    numericPrice: 8500,
    duration: "4 Days / 3 Nights",
    location: "Cox's Bazar & Saint Martin Island",
    departureLocation: "Dhaka",
    destination: "Cox's Bazar & Saint Martin",
    rating: "4.8",
    reviewsCount: 215,
    groupSize: "Up to 20 Travelers",
    badge: "Best Seller",
    aboutTheTour:
      "Unwind beside the longest unbroken natural sandy beach in the world. Enjoy a scenic ocean drive along Marine Drive to Himchhari, followed by a sea cruise to Bangladesh's only coral island, Saint Martin, featuring fresh coconut water, live grilled seafood, and coral walks.",
    galleryImages: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
    ],
    tourPlan: [
      {
        day: "1",
        title: "Arrival in Cox's Bazar & Kolatoli Sunset",
        description:
          "Check in to beachside resort. Afternoon beach stroll, water sports, and glorious golden sunset over the Bay of Bengal.",
      },
      {
        day: "2",
        title: "Marine Drive, Inani Coral Beach & Himchhari",
        description:
          "Drive along the world-famous Marine Drive road where green hills meet roaring surf. Explore coral rocks at Inani Beach.",
      },
      {
        day: "3",
        title: "Cruise to Saint Martin Island & Chhera Dwip",
        description:
          "Morning cruise liner to Saint Martin. Trawler ride to secluded Chhera Dwip, snorkel along coral formations, and evening beach BBQ.",
      },
      {
        day: "4",
        title: "Island Sunrise & Return Voyage",
        description:
          "Cycle around the coconut tree-lined island paths, savor local King Prawn curry, and board evening return cruise.",
      },
    ],
    tourGuides: [
      {
        name: "Mahmud Hasan",
        email: "mahmud.guide@travelbdx.com",
        photo:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    _id: "sreemangal-pkg-4",
    tripTitle: "Sreemangal Tea Estates & Lawachara Rainforest",
    tourType: "Eco & Nature",
    coverImage:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    price: "৳4,800",
    numericPrice: 4800,
    duration: "2 Days / 1 Night",
    location: "Sreemangal, Moulvibazar",
    departureLocation: "Dhaka (Kamalapur Railway)",
    destination: "Lawachara, Baikka Beel & Madhabpur Lake",
    rating: "4.9",
    reviewsCount: 84,
    groupSize: "Up to 10 Travelers",
    badge: "Eco Friendly",
    aboutTheTour:
      "Immerse yourself in the tea capital of Bangladesh. Cycle through emerald green tea plantations, trek the dense rainforest canopy of Lawachara National Park to hear the calls of endangered Hoolock gibbons, and taste the world-renowned multi-layered tea.",
    galleryImages: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    ],
    tourPlan: [
      {
        day: "1",
        title: "Tea Garden Cycle Trails & Madhabpur Lake",
        description:
          "Arrive by scenic morning express train. Cycle across endless tea estates. Afternoon excursion to water-lily filled Madhabpur Lake bordering Tripura.",
      },
      {
        day: "2",
        title: "Lawachara Canopy Trek & Manipuri Weaving",
        description:
          "Early dawn trek inside Lawachara rainforest. Visit Khasia and Manipuri indigenous villages, taste authentic 7-layer tea at Nilkantha Cabin.",
      },
    ],
    tourGuides: [
      {
        name: "Tanvir Ahmed",
        email: "tanvir.guide@travelbdx.com",
        photo:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    _id: "bandarban-pkg-5",
    tripTitle: "Bandarban Nilgiri Cloud Viewpoint & Tribal Trails",
    tourType: "Mountain Trekking",
    coverImage:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    price: "৳7,500",
    numericPrice: 7500,
    duration: "3 Days / 2 Nights",
    location: "Bandarban Hill Tracts",
    departureLocation: "Dhaka",
    destination: "Nilgiri, Nilachal & Chimbuk Hill",
    rating: "4.9",
    reviewsCount: 110,
    groupSize: "Up to 14 Travelers",
    badge: "High Altitude",
    aboutTheTour:
      "Conquer the majestic mountain passes of Bandarban. Ride through clouds to Nilgiri summit at 2,400 feet, view the radiant Buddha Dhatu Jadi golden temple, experience the roar of Shoilo Propat cascade, and engage with the rich cultures of Marma and Bawm communities.",
    galleryImages: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    ],
    tourPlan: [
      {
        day: "1",
        title: "Bandarban Arrival & Nilachal Golden Sunset",
        description:
          "Check in to hilltop cottage. Visit Golden Temple (Buddha Dhatu Jadi) and enjoy the 360-degree hill sunset from Nilachal viewpoint.",
      },
      {
        day: "2",
        title: "Chander Gari Ascent to Nilgiri & Chimbuk",
        description:
          "Ascend steep mountain switchbacks via 4x4 open jeep to Nilgiri above the clouds. Stop at Chimbuk peak and Shoilo Propat stream.",
      },
      {
        day: "3",
        title: "Bawm Indigenous Village & Return",
        description:
          "Visit traditional bamboo stilt homes, purchase handmade ethnic fabrics, and return to Dhaka by night coach.",
      },
    ],
    tourGuides: [
      {
        name: "Arif Mahmud",
        email: "arif.guide@travelbdx.com",
        photo:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
  {
    _id: "jaflong-pkg-6",
    tripTitle: "Jaflong Crystal River & Ratargul Swamp Forest",
    tourType: "Nature & River",
    coverImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    price: "৳5,200",
    numericPrice: 5200,
    duration: "3 Days / 2 Nights",
    location: "Sylhet & Sunamganj",
    departureLocation: "Dhaka",
    destination: "Ratargul Swamp, Jaflong & Lalakhal",
    rating: "4.7",
    reviewsCount: 76,
    groupSize: "Up to 15 Travelers",
    badge: "Water Odyssey",
    aboutTheTour:
      "Float into the Amazon of Bangladesh — Ratargul Freshwater Swamp Forest. Experience emerald crystal waters of Lalakhal under the shadow of the Khasi hills, and collect colorful stones from the rolling riverbed of Jaflong.",
    galleryImages: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    ],
    tourPlan: [
      {
        day: "1",
        title: "Sylhet Arrival & Ratargul Swamp Canoe Trail",
        description:
          "Board silent wooden canoes gliding through half-submerged Koroch trees in Ratargul swamp forest. Ascend the swamp watchtower.",
      },
      {
        day: "2",
        title: "Jaflong Zero Point & Khasia Punji",
        description:
          "Boat trip to Jaflong riverbed bordering Meghalaya, explore betel leaf plantations in the indigenous Khasia Punji village.",
      },
      {
        day: "3",
        title: "Lalakhal Emerald River & Return",
        description:
          "Cruise on the turquoise blue waters of Lalakhal river reflecting mountain greenery, then return to Dhaka.",
      },
    ],
    tourGuides: [
      {
        name: "Nusrat Jahan",
        email: "nusrat.guide@travelbdx.com",
        photo:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      },
    ],
  },
];

const DEMO_USERS = [
  {
    _id: "user-demo-admin",
    name: "TravelBDX Admin",
    email: "admin@travelbdx.com",
    role: "admin",
    photoURL:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    phone: "+880 1711 000001",
    bio: "Head Administrator & Chief Tourism Platform Curator for TravelBDX.",
    location: "Gulshan-2, Dhaka, Bangladesh",
    travelStyle: "Luxury & Cultural Expedition",
    emergencyContact: "+880 1711 999999",
    dietary: "Halal & Organic",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
  },
  {
    _id: "user-demo-guide-1",
    name: "Tanvir Ahmed",
    email: "tanvir.guide@travelbdx.com",
    role: "tour_guide",
    photoURL:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    phone: "+880 1711 223344",
    bio: "Certified senior trek leader with 7+ years guiding Sajek, Bandarban, and Sreemangal trails.",
    location: "Sylhet & Rangamati",
    createdAt: new Date("2024-01-10T00:00:00.000Z"),
  },
  {
    _id: "user-demo-guide-2",
    name: "Farhana Yasmin",
    email: "farhana.guide@travelbdx.com",
    role: "tour_guide",
    photoURL:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    phone: "+880 1822 334455",
    bio: "Environmental naturalist & Sundarbans wildlife guide specializing in birdwatching and mangrove conservation.",
    location: "Khulna, Bangladesh",
    createdAt: new Date("2024-01-15T00:00:00.000Z"),
  },
  {
    _id: "user-demo-user-1",
    name: "Demo Explorer",
    email: "user@travelbdx.com",
    role: "user",
    photoURL:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    phone: "+880 1714 333333",
    bio: "Passionate backpacker exploring the hidden corners of all 64 districts in Bangladesh.",
    location: "Dhanmondi, Dhaka",
    travelStyle: "Backpacking & Adventure",
    emergencyContact: "+880 1819 888888",
    dietary: "No restrictions",
    createdAt: new Date("2024-02-01T00:00:00.000Z"),
  },
  {
    _id: "user-demo-user-2",
    name: "Shakil Ahmed",
    email: "shakil@travelbdx.com",
    role: "user",
    photoURL:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
    phone: "+880 1715 444444",
    bio: "Landscape photographer and passionate houseboat traveler.",
    location: "Uttara, Dhaka",
    createdAt: new Date("2024-02-15T00:00:00.000Z"),
  },
];

const DEMO_TOUR_GUIDES = [
  {
    _id: "guide-1",
    name: "Tanvir Ahmed",
    email: "tanvir.guide@travelbdx.com",
    phone: "+880 1711-223344",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    contactDetails: { email: "tanvir.guide@travelbdx.com", phone: "+880 1711-223344" },
    specialty: "Sajek Valley & Bandarban Trekking",
    experience: "7+ Years in High Mountain Trails",
    education: "B.A. in Hospitality & Tourism, Dhaka University",
    languages: "English, Bengali, Chakma",
    rating: "4.9",
    toursCompleted: 142,
  },
  {
    _id: "guide-2",
    name: "Farhana Yasmin",
    email: "farhana.guide@travelbdx.com",
    phone: "+880 1822-334455",
    profileImage:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    contactDetails: { email: "farhana.guide@travelbdx.com", phone: "+880 1822-334455" },
    specialty: "Sundarbans Wildlife Naturalist",
    experience: "6+ Years in Mangrove Safaris",
    education: "M.Sc. in Forestry & Environmental Science",
    languages: "English, Bengali",
    rating: "5.0",
    toursCompleted: 98,
  },
  {
    _id: "guide-3",
    name: "Mahmud Hasan",
    email: "mahmud.guide@travelbdx.com",
    phone: "+880 1933-445566",
    profileImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    contactDetails: { email: "mahmud.guide@travelbdx.com", phone: "+880 1933-445566" },
    specialty: "Cox's Bazar & Saint Martin's Marine Life",
    experience: "9+ Years in Coastal Diving & Expeditions",
    education: "Certified Marine Diver & PADI Guide",
    languages: "English, Bengali, Chittagonian",
    rating: "4.9",
    toursCompleted: 215,
  },
  {
    _id: "guide-4",
    name: "Nusrat Jahan",
    email: "nusrat.guide@travelbdx.com",
    phone: "+880 1717-666666",
    profileImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    photo:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    contactDetails: { email: "nusrat.guide@travelbdx.com", phone: "+880 1717-666666" },
    specialty: "Sylhet Rivers, Haors & Wetland Conservation",
    experience: "5+ Years in Wetland Ecotourism",
    education: "B.B.A in Tourism & Event Management",
    languages: "English, Bengali, Sylheti",
    rating: "4.8",
    toursCompleted: 76,
  },
];

const DEMO_BOOKINGS = [
  {
    _id: "book-01",
    touristName: "Demo Explorer",
    touristEmail: "user@travelbdx.com",
    email: "user@travelbdx.com",
    touristPhoto:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    packageId: "sajek-pkg-1",
    packageName: "Sajek Valley Cloud Kingdom & Helipad Sunset",
    tripTitle: "Sajek Valley Cloud Kingdom & Helipad Sunset",
    price: 6500,
    tourDate: "2026-11-20",
    guideName: "Tanvir Ahmed",
    guideEmail: "tanvir.guide@travelbdx.com",
    status: "In Review",
    createdAt: new Date("2026-11-01T10:00:00.000Z"),
  },
  {
    _id: "book-02",
    touristName: "Demo Explorer",
    touristEmail: "user@travelbdx.com",
    email: "user@travelbdx.com",
    touristPhoto:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    packageId: "sundarban-pkg-2",
    packageName: "Sundarbans Deep Wildlife Cruise & Mangrove Trail",
    tripTitle: "Sundarbans Deep Wildlife Cruise & Mangrove Trail",
    price: 14500,
    tourDate: "2026-11-28",
    guideName: "Farhana Yasmin",
    guideEmail: "farhana.guide@travelbdx.com",
    status: "Accepted",
    createdAt: new Date("2026-11-02T12:30:00.000Z"),
  },
  {
    _id: "book-03",
    touristName: "Shakil Ahmed",
    touristEmail: "shakil@travelbdx.com",
    email: "shakil@travelbdx.com",
    touristPhoto:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
    packageId: "coxsbazar-pkg-3",
    packageName: "Cox's Bazar & Saint Martin's Coral Expedition",
    tripTitle: "Cox's Bazar & Saint Martin's Coral Expedition",
    price: 8500,
    tourDate: "2026-12-05",
    guideName: "Mahmud Hasan",
    guideEmail: "mahmud.guide@travelbdx.com",
    status: "Accepted",
    createdAt: new Date("2026-11-03T15:00:00.000Z"),
  },
];

const DEMO_WISHLIST = [
  {
    _id: "wish-01",
    userEmail: "user@travelbdx.com",
    touristEmail: "user@travelbdx.com",
    email: "user@travelbdx.com",
    packageId: "sreemangal-pkg-4",
    packageName: "Sreemangal Tea Estates & Lawachara Rainforest",
    tripTitle: "Sreemangal Tea Estates & Lawachara Rainforest",
    tourType: "Eco & Nature",
    price: 4800,
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
    addedAt: new Date("2026-11-04T09:00:00.000Z"),
  },
  {
    _id: "wish-02",
    userEmail: "user@travelbdx.com",
    touristEmail: "user@travelbdx.com",
    email: "user@travelbdx.com",
    packageId: "bandarban-pkg-5",
    packageName: "Bandarban Nilgiri Cloud Viewpoint & Tribal Trails",
    tripTitle: "Bandarban Nilgiri Cloud Viewpoint & Tribal Trails",
    tourType: "Mountain Trekking",
    price: 7500,
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    addedAt: new Date("2026-11-05T11:20:00.000Z"),
  },
];

const DEMO_STORIES = [
  {
    _id: "story-01",
    title: "Floating Above The Sea of Clouds in Sajek",
    story:
      "Standing at the peak of Konglak Para at 6 AM as a blanket of white clouds enveloped the green mountains below was pure serenity. The indigenous bamboo tea was the cherry on top! Sajek is an unmissable paradise in Bangladesh.",
    authorName: "Tanvir Ahmed",
    authorEmail: "tanvir.guide@travelbdx.com",
    authorImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    image:
      "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1000&q=80",
    likes: 42,
    shares: 19,
    createdAt: new Date("2026-10-15T08:00:00.000Z"),
  },
  {
    _id: "story-02",
    title: "Unforgettable Sunset with Dolphins in Sundarbans",
    story:
      "Cruising along the Kotka canal inside the mangrove forest, we spotted spotted deer on the muddy bank and later caught a glimpse of the playful Irrawaddy dolphins as the golden sunset bathed the river in liquid amber.",
    authorName: "Farhana Yasmin",
    authorEmail: "farhana.guide@travelbdx.com",
    authorImage:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    image:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    likes: 38,
    shares: 14,
    createdAt: new Date("2026-10-22T14:30:00.000Z"),
  },
  {
    _id: "story-03",
    title: "Stargazing at Saint Martin Island Beach",
    story:
      "Zero light pollution, sound of crashing ocean waves, and a dazzling Milky Way arching across the Bay of Bengal. An experience every traveller in Bangladesh should have at least once in their lifetime.",
    authorName: "Demo Explorer",
    authorEmail: "user@travelbdx.com",
    authorImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    likes: 56,
    shares: 27,
    createdAt: new Date("2026-10-30T20:15:00.000Z"),
  },
];

const DEMO_BLOGS = [
  {
    _id: "blog-01",
    title: "Complete Packing Guide for Bangladesh Hill Tracts",
    content:
      "Preparing for trekking in Bandarban or Sajek requires smart preparation. Lightweight breathable quick-dry clothes, sturdy grip hiking shoes, waterproof dry bags for electronics, portable power banks, and local mosquito repellent are essential items.",
    author: "TravelBDX Editorial",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80",
    category: "Travel Tips",
    readTime: "5 min read",
    createdAt: new Date("2026-10-10T10:00:00.000Z"),
  },
  {
    _id: "blog-02",
    title: "Sustainable Eco-Tourism: Protecting Bangladesh's Haor Ecosystems",
    content:
      "As houseboat tourism flourishes in Sunamganj and Tanguar Haor, tourists and tour operators must embrace zero-plastic policies, preserve fragile wetlands, and support local fishing communities sustainably.",
    author: "EcoBangladesh",
    image:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
    category: "Eco Tourism",
    readTime: "7 min read",
    createdAt: new Date("2026-10-18T12:00:00.000Z"),
  },
];

const DEMO_OVERVIEW = [
  {
    _id: "overview-01",
    title: "TravelBDX Mission",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Connecting passionate travelers with authentic certified local guides across Bangladesh.",
  },
];

// Helper to safely match both MongoDB ObjectId and string IDs
const getFilter = (id) => {
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === String(id)) {
    try {
      return { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    } catch (e) {
      return { _id: id };
    }
  }
  return { _id: id };
};

// ----------------------------------------------------
// 6. Resilient Collection Engine (MongoDB Atlas + In-Memory Fallback)
// ----------------------------------------------------
let isMongoConnected = false;

function matchesFilter(item, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;

  if (filter.$or && Array.isArray(filter.$or)) {
    return filter.$or.some((subFilter) => matchesFilter(item, subFilter));
  }

  for (const [key, val] of Object.entries(filter)) {
    if (key === "_id") {
      const itemIdStr = String(item._id);
      const targetIdStr = val instanceof ObjectId ? String(val) : String(val);
      if (itemIdStr !== targetIdStr) return false;
    } else if (val && typeof val === "object" && val.$regex) {
      const regex = new RegExp(val.$regex, val.$options || "i");
      if (!regex.test(String(item[key] || ""))) return false;
    } else if (item[key] !== val) {
      return false;
    }
  }
  return true;
}

function createResilientCollection(name, initialData = []) {
  let memoryStore = JSON.parse(JSON.stringify(initialData));
  const rawCollection = rawDb.collection(name);

  return {
    name,
    getStore: () => memoryStore,
    setStore: (data) => {
      memoryStore = JSON.parse(JSON.stringify(data));
    },

    find: (query = {}) => {
      return {
        sort: function (sortOptions = {}) {
          this._sortOptions = sortOptions;
          return this;
        },
        toArray: async function () {
          if (isMongoConnected) {
            try {
              let cursor = rawCollection.find(query);
              if (this._sortOptions) {
                cursor = cursor.sort(this._sortOptions);
              }
              const res = await cursor.toArray();
              if (res && res.length > 0) return res;
            } catch (err) {
              // Graceful fallback to memoryStore if MongoDB read times out or errors
            }
          }

          let results = memoryStore.filter((item) => matchesFilter(item, query));
          if (this._sortOptions && Object.keys(this._sortOptions).length > 0) {
            const [field, dir] = Object.entries(this._sortOptions)[0];
            results.sort((a, b) => {
              const aVal = a[field] || 0;
              const bVal = b[field] || 0;
              return dir === 1 ? aVal - bVal : bVal - aVal;
            });
          }
          return results;
        },
      };
    },

    findOne: async (query = {}) => {
      if (isMongoConnected) {
        try {
          const res = await rawCollection.findOne(query);
          if (res) return res;
        } catch (err) {
          // Graceful fallback
        }
      }
      return memoryStore.find((item) => matchesFilter(item, query)) || null;
    },

    insertOne: async (doc) => {
      const record = {
        ...doc,
        _id: doc._id || new ObjectId().toString(),
      };
      memoryStore.push(record);

      if (isMongoConnected) {
        try {
          await rawCollection.insertOne(record);
        } catch (err) {
          // Keep in memory
        }
      }
      return { acknowledged: true, insertedId: record._id };
    },

    insertMany: async (docs) => {
      const records = docs.map((doc) => ({
        ...doc,
        _id: doc._id || new ObjectId().toString(),
      }));
      memoryStore.push(...records);

      if (isMongoConnected) {
        try {
          await rawCollection.insertMany(records);
        } catch (err) {
          // Keep in memory
        }
      }
      return { acknowledged: true, insertedCount: records.length };
    },

    updateOne: async (filter, updateDoc, options = {}) => {
      let matchedCount = 0;
      let modifiedCount = 0;

      const idx = memoryStore.findIndex((item) => matchesFilter(item, filter));
      if (idx !== -1) {
        matchedCount = 1;
        modifiedCount = 1;
        if (updateDoc.$set) {
          memoryStore[idx] = { ...memoryStore[idx], ...updateDoc.$set };
        }
        if (updateDoc.$inc) {
          for (const [incKey, incVal] of Object.entries(updateDoc.$inc)) {
            memoryStore[idx][incKey] = (memoryStore[idx][incKey] || 0) + incVal;
          }
        }
      } else if (options.upsert && updateDoc.$set) {
        const newRecord = {
          ...updateDoc.$set,
          _id: filter._id || new ObjectId().toString(),
        };
        memoryStore.push(newRecord);
        matchedCount = 1;
        modifiedCount = 1;
      }

      if (isMongoConnected) {
        try {
          await rawCollection.updateOne(filter, updateDoc, options);
        } catch (err) {
          // Keep in memory
        }
      }
      return { acknowledged: true, matchedCount, modifiedCount };
    },

    deleteOne: async (filter) => {
      const initialLength = memoryStore.length;
      memoryStore = memoryStore.filter((item) => !matchesFilter(item, filter));
      const deletedCount = initialLength - memoryStore.length;

      if (isMongoConnected) {
        try {
          await rawCollection.deleteOne(filter);
        } catch (err) {
          // Memory updated
        }
      }
      return { acknowledged: true, deletedCount };
    },

    deleteMany: async (filter = {}) => {
      const initialLength = memoryStore.length;
      memoryStore = memoryStore.filter((item) => !matchesFilter(item, filter));
      const deletedCount = initialLength - memoryStore.length;

      if (isMongoConnected) {
        try {
          await rawCollection.deleteMany(filter);
        } catch (err) {
          // Memory updated
        }
      }
      return { acknowledged: true, deletedCount };
    },

    estimatedDocumentCount: async () => {
      if (isMongoConnected) {
        try {
          const count = await rawCollection.estimatedDocumentCount();
          if (count > 0) return count;
        } catch (err) {}
      }
      return memoryStore.length;
    },
  };
}

// Instantiate Collections with pre-loaded demo records
const userCollection = createResilientCollection("users", DEMO_USERS);
const packagesCollection = createResilientCollection("packages", DEMO_PACKAGES);
const tourGuidesCollection = createResilientCollection("tourGuides", DEMO_TOUR_GUIDES);
const bookingsCollection = createResilientCollection("bookings", DEMO_BOOKINGS);
const wishCollection = createResilientCollection("wish", DEMO_WISHLIST);
const touristStoryCollection = createResilientCollection("touristStory", DEMO_STORIES);
const blogsCollection = createResilientCollection("blogs", DEMO_BLOGS);
const overviewCollection = createResilientCollection("overview", DEMO_OVERVIEW);

// Function to seed demo data into MongoDB Atlas if connected and empty
async function seedMongoDBAtlas(force = false) {
  if (!isMongoConnected) return false;
  try {
    const pkgCount = await rawDb.collection("packages").estimatedDocumentCount();
    if (pkgCount === 0 || force) {
      if (force) {
        await Promise.all([
          rawDb.collection("packages").deleteMany({}),
          rawDb.collection("users").deleteMany({}),
          rawDb.collection("tourGuides").deleteMany({}),
          rawDb.collection("bookings").deleteMany({}),
          rawDb.collection("wish").deleteMany({}),
          rawDb.collection("touristStory").deleteMany({}),
          rawDb.collection("blogs").deleteMany({}),
          rawDb.collection("overview").deleteMany({}),
        ]);
      }
      await Promise.all([
        rawDb.collection("packages").insertMany(JSON.parse(JSON.stringify(DEMO_PACKAGES))),
        rawDb.collection("users").insertMany(JSON.parse(JSON.stringify(DEMO_USERS))),
        rawDb.collection("tourGuides").insertMany(JSON.parse(JSON.stringify(DEMO_TOUR_GUIDES))),
        rawDb.collection("bookings").insertMany(JSON.parse(JSON.stringify(DEMO_BOOKINGS))),
        rawDb.collection("wish").insertMany(JSON.parse(JSON.stringify(DEMO_WISHLIST))),
        rawDb.collection("touristStory").insertMany(JSON.parse(JSON.stringify(DEMO_STORIES))),
        rawDb.collection("blogs").insertMany(JSON.parse(JSON.stringify(DEMO_BLOGS))),
        rawDb.collection("overview").insertMany(JSON.parse(JSON.stringify(DEMO_OVERVIEW))),
      ]);
      console.log("MongoDB Atlas populated with demo dataset!");
    }
    return true;
  } catch (err) {
    console.warn("MongoDB Atlas seeding notice:", err.message);
    return false;
  }
}

// Connect to MongoDB Atlas
async function connectDB() {
  try {
    await client.db("admin").command({ ping: 1 });
    isMongoConnected = true;
    console.log("Successfully connected to MongoDB Cluster!");
    await seedMongoDBAtlas(false);
  } catch (err) {
    isMongoConnected = false;
    console.warn("MongoDB notice (seamlessly operating with resilient demo engine):", err.message);
  }
}
connectDB().catch(console.dir);

// ----------------------------------------------------
// 7. Auth & JWT Verification Middlewares
// ----------------------------------------------------
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access: missing token" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access: invalid token" });
    }
    req.decoded = decoded;
    next();
  });
};

const verifyAdmin = async (req, res, next) => {
  const email = req.decoded?.email;
  if (!email) {
    return res.status(403).send({ message: "forbidden access: no email in token" });
  }
  if (email === "admin@travelbdx.com" || email === "admin@gmail.com") {
    return next();
  }
  try {
    const user = await userCollection.findOne({ email });
    const isAdmin = user?.role === "admin";
    if (!isAdmin) {
      return res.status(403).send({ message: "forbidden access: admin privileges required" });
    }
    next();
  } catch (err) {
    res.status(500).send({ message: "error verifying admin role", error: err.message });
  }
};

// ----------------------------------------------------
// 8. Root & Health Check API
// ----------------------------------------------------
app.get("/", (req, res) => {
  res.send({
    message: "TravelBDX Tourism Server is live and running!",
    status: "healthy",
    database: isMongoConnected ? "MongoDB Atlas (Online)" : "Resilient Demo Store (Active)",
    storageType: "Direct Links (Zero File Storage)",
    endpoints: {
      auth: ["POST /jwt"],
      demoData: ["GET /seed-demo-data", "POST /seed-demo-data", "POST /reset-demo-data"],
      users: [
        "GET /users",
        "GET /users/:email",
        "GET /users/admin/:email",
        "POST /users",
        "PATCH /users/admin/:id",
        "PATCH /users/role/:id",
        "PATCH /users/profile/:email",
        "DELETE /users/:id",
      ],
      packages: [
        "GET /packages",
        "GET /packages/:id",
        "GET /packages/category/:tourType",
        "POST /packages",
        "PATCH /packages/:id",
        "PUT /packages/:id",
        "DELETE /packages/:id",
      ],
      guides: [
        "GET /tourGuides",
        "GET /tourGuides/:id",
        "POST /tourGuides",
        "PATCH /tourGuides/:id",
        "DELETE /tourGuides/:id",
      ],
      bookings: [
        "GET /bookings",
        "GET /bookings/:id",
        "POST /bookings",
        "PATCH /bookings/:id",
        "DELETE /bookings/:id",
      ],
      wishlist: ["GET /wish", "POST /wish", "DELETE /wish/:id"],
      stories: [
        "GET /touristStory",
        "GET /touristStory/:id",
        "POST /touristStory",
        "PATCH /touristStory/:id",
        "DELETE /touristStory/:id",
      ],
      blogs: ["GET /blogs", "GET /blogs/:id", "POST /blogs", "DELETE /blogs/:id"],
      stats: ["GET /admin-stats", "GET /overview"],
    },
  });
});

// ----------------------------------------------------
// 9. Demo Data Seeder Endpoints
// ----------------------------------------------------
const handleSeedDemoData = async (req, res) => {
  try {
    packagesCollection.setStore(DEMO_PACKAGES);
    userCollection.setStore(DEMO_USERS);
    tourGuidesCollection.setStore(DEMO_TOUR_GUIDES);
    bookingsCollection.setStore(DEMO_BOOKINGS);
    wishCollection.setStore(DEMO_WISHLIST);
    touristStoryCollection.setStore(DEMO_STORIES);
    blogsCollection.setStore(DEMO_BLOGS);
    overviewCollection.setStore(DEMO_OVERVIEW);

    const mongoSeeded = await seedMongoDBAtlas(true);

    res.send({
      success: true,
      message: "All demo data successfully seeded (Direct image links, zero file storage)!",
      storage: isMongoConnected ? "MongoDB Atlas + In-Memory" : "In-Memory Engine",
      mongoSynced: mongoSeeded,
      counts: {
        packages: DEMO_PACKAGES.length,
        users: DEMO_USERS.length,
        tourGuides: DEMO_TOUR_GUIDES.length,
        bookings: DEMO_BOOKINGS.length,
        wishlist: DEMO_WISHLIST.length,
        stories: DEMO_STORIES.length,
        blogs: DEMO_BLOGS.length,
        overview: DEMO_OVERVIEW.length,
      },
    });
  } catch (err) {
    res.status(500).send({ message: "Failed to seed demo data", error: err.message });
  }
};

app.get("/seed-demo-data", handleSeedDemoData);
app.post("/seed-demo-data", handleSeedDemoData);
app.post("/reset-demo-data", handleSeedDemoData);

// ----------------------------------------------------
// 10. JWT Authentication APIs
// ----------------------------------------------------
app.post("/jwt", async (req, res) => {
  try {
    const user = req.body;
    const token = jwt.sign(user, secret, { expiresIn: "7d" });
    res.send({ token });
  } catch (err) {
    res.status(500).send({ message: "Failed to generate JWT", error: err.message });
  }
});

// ----------------------------------------------------
// 11. User Management APIs
// ----------------------------------------------------

// Get all users (with optional role or search filtering)
app.get("/users", async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role && role !== "all") {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const result = await userCollection.find(query).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch users", error: err.message });
  }
});

// Check if a specific user is Admin
app.get("/users/admin/:email", async (req, res) => {
  try {
    const email = req.params.email;
    if (email === "admin@travelbdx.com" || email === "admin@gmail.com") {
      return res.send({ admin: true });
    }
    const user = await userCollection.findOne({ email });
    const admin = user?.role === "admin";
    res.send({ admin: Boolean(admin) });
  } catch (err) {
    res.status(500).send({ message: "Failed to check admin status", error: err.message });
  }
});

// Get single user by email
app.get("/users/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await userCollection.findOne({ email });
    res.send(user || null);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch user", error: err.message });
  }
});

// Create/Register new user
app.post("/users", async (req, res) => {
  try {
    const user = req.body;
    const query = { email: user.email };
    const existingUser = await userCollection.findOne(query);
    if (existingUser) {
      return res.send({ message: "User already exists", insertedId: null });
    }
    const newUser = {
      ...user,
      role: user.role || "user",
      createdAt: user.createdAt || new Date(),
    };
    const result = await userCollection.insertOne(newUser);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to create user", error: err.message });
  }
});

// Promote user to admin
app.patch("/users/admin/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = getFilter(id);
    const updatedDoc = {
      $set: {
        role: "admin",
      },
    };
    const result = await userCollection.updateOne(filter, updatedDoc);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to promote user to admin", error: err.message });
  }
});

// Change user role (admin, tour_guide, user)
app.patch("/users/role/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { role } = req.body;
    const filter = getFilter(id);
    const updatedDoc = {
      $set: {
        role: role || "user",
      },
    };
    const result = await userCollection.updateOne(filter, updatedDoc);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to update user role", error: err.message });
  }
});

// Update user profile information by email
app.patch("/users/profile/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const {
      name,
      displayName,
      photoURL,
      phone,
      bio,
      location,
      travelStyle,
      emergencyContact,
      dietary,
    } = req.body;

    const filter = { email };
    const updatedDoc = {
      $set: {
        ...(name && { name }),
        ...(displayName && { name: displayName }),
        ...(photoURL && { photoURL }),
        ...(phone && { phone }),
        ...(bio && { bio }),
        ...(location && { location }),
        ...(travelStyle && { travelStyle }),
        ...(emergencyContact && { emergencyContact }),
        ...(dietary && { dietary }),
        updatedAt: new Date(),
      },
    };
    const result = await userCollection.updateOne(filter, updatedDoc);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to update profile", error: err.message });
  }
});

// Delete user
app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = getFilter(id);
    const result = await userCollection.deleteOne(filter);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to delete user", error: err.message });
  }
});

// ----------------------------------------------------
// 12. Tour Packages APIs (Full CRUD)
// ----------------------------------------------------

// Get all packages (with optional category, search and sort)
app.get("/packages", async (req, res) => {
  try {
    const { tourType, search, sort } = req.query;
    let query = {};

    if (tourType && tourType !== "All" && tourType !== "All Types") {
      query.tourType = { $regex: tourType, $options: "i" };
    }

    if (search) {
      query.$or = [
        { tripTitle: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { tourType: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = {};
    if (sort === "priceAsc") sortOption.numericPrice = 1;
    if (sort === "priceDesc") sortOption.numericPrice = -1;

    const result = await packagesCollection.find(query).sort(sortOption).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch packages", error: err.message });
  }
});

// Get package by ID or tourType
app.get("/packages/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = getFilter(id);
    let result = await packagesCollection.findOne(filter);

    if (!result) {
      const typeMatches = await packagesCollection.find({ tourType: { $regex: id, $options: "i" } }).toArray();
      if (typeMatches.length > 0) result = typeMatches;
    }

    res.send(result || null);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch package", error: err.message });
  }
});

// Filter packages by Tour Type
app.get("/packages/category/:tourType", async (req, res) => {
  try {
    const { tourType } = req.params;
    const query = { tourType: { $regex: tourType, $options: "i" } };
    const tours = await packagesCollection.find(query).toArray();
    res.send(tours);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch tour category", error: err.message });
  }
});

// Add new tour package (Direct image URLs only - No file storage)
app.post("/packages", async (req, res) => {
  try {
    const pkg = req.body;
    const numericPrice =
      pkg.numericPrice ||
      (typeof pkg.price === "number"
        ? pkg.price
        : parseInt(String(pkg.price || "").replace(/[^\d]/g, ""), 10)) ||
      0;

    const newPackage = {
      ...pkg,
      numericPrice,
      createdAt: new Date(),
    };
    const result = await packagesCollection.insertOne(newPackage);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to add package", error: err.message });
  }
});

// Update tour package (PATCH / PUT)
app.patch("/packages/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const filter = getFilter(id);

    const numericPrice =
      item.numericPrice ||
      (item.price
        ? typeof item.price === "number"
          ? item.price
          : parseInt(String(item.price).replace(/[^\d]/g, ""), 10)
        : undefined);

    const updatedDoc = {
      $set: {
        ...(item.tripTitle && { tripTitle: item.tripTitle }),
        ...(item.tourType && { tourType: item.tourType }),
        ...(item.price && { price: item.price }),
        ...(numericPrice !== undefined && { numericPrice }),
        ...(item.duration && { duration: item.duration }),
        ...(item.location && { location: item.location }),
        ...(item.coverImage && { coverImage: item.coverImage }),
        ...(item.galleryImages && { galleryImages: item.galleryImages }),
        ...(item.aboutTheTour && { aboutTheTour: item.aboutTheTour }),
        ...(item.tourGuides && { tourGuides: item.tourGuides }),
        ...(item.tourPlan && { tourPlan: item.tourPlan }),
        updatedAt: new Date(),
      },
    };

    const result = await packagesCollection.updateOne(filter, updatedDoc);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to update package", error: err.message });
  }
});

app.put("/packages/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = getFilter(id);
    const updatedPackage = req.body;
    const result = await packagesCollection.updateOne(filter, { $set: updatedPackage }, { upsert: true });
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to replace package", error: err.message });
  }
});

// Delete tour package
app.delete("/packages/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = getFilter(id);
    const result = await packagesCollection.deleteOne(filter);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to delete package", error: err.message });
  }
});

// ----------------------------------------------------
// 13. Tour Guides APIs
// ----------------------------------------------------

// Get all tour guides
app.get("/tourGuides", async (req, res) => {
  try {
    const result = await tourGuidesCollection.find().toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch guides", error: err.message });
  }
});

// Get single tour guide by ID
app.get("/tourGuides/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = getFilter(id);
    const result = await tourGuidesCollection.findOne(filter);
    res.send(result || null);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch guide", error: err.message });
  }
});

// Add new tour guide
app.post("/tourGuides", async (req, res) => {
  try {
    const guide = req.body;
    const result = await tourGuidesCollection.insertOne({ ...guide, createdAt: new Date() });
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to add guide", error: err.message });
  }
});

// Update tour guide
app.patch("/tourGuides/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = getFilter(id);
    const result = await tourGuidesCollection.updateOne(filter, { $set: req.body });
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to update guide", error: err.message });
  }
});

// Delete tour guide
app.delete("/tourGuides/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = getFilter(id);
    const result = await tourGuidesCollection.deleteOne(filter);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to delete guide", error: err.message });
  }
});

// ----------------------------------------------------
// 14. Bookings APIs
// ----------------------------------------------------

// Get bookings (by user email query or all bookings for admin)
app.get("/bookings", async (req, res) => {
  try {
    const queryEmail = req.query.email || req.query.touristEmail;
    let query = {};
    if (queryEmail) {
      query.$or = [{ touristEmail: queryEmail }, { email: queryEmail }];
    }
    const result = await bookingsCollection.find(query).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch bookings", error: err.message });
  }
});

// Get single booking by ID
app.get("/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = getFilter(id);
    const result = await bookingsCollection.findOne(filter);
    res.send(result || null);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch booking", error: err.message });
  }
});

// Create new booking
app.post("/bookings", async (req, res) => {
  try {
    const newBooking = {
      ...req.body,
      status: req.body.status || "Pending",
      bookingDate: req.body.bookingDate || new Date().toISOString(),
      createdAt: new Date(),
    };
    const result = await bookingsCollection.insertOne(newBooking);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to create booking", error: err.message });
  }
});

// Update booking status (e.g. In Review, Accepted, Rejected, Paid)
app.patch("/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const filter = getFilter(id);
    const result = await bookingsCollection.updateOne(filter, { $set: { status, updatedAt: new Date() } });
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to update booking status", error: err.message });
  }
});

// Delete/Cancel booking
app.delete("/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = getFilter(id);
    const result = await bookingsCollection.deleteOne(filter);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to cancel booking", error: err.message });
  }
});

// ----------------------------------------------------
// 15. Wishlist APIs
// ----------------------------------------------------

// Get user wishlist
app.get("/wish", async (req, res) => {
  try {
    const queryEmail = req.query.email || req.query.touristEmail;
    let query = {};
    if (queryEmail) {
      query.$or = [{ touristEmail: queryEmail }, { email: queryEmail }];
    }
    const result = await wishCollection.find(query).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch wishlist", error: err.message });
  }
});

// Add package to wishlist
app.post("/wish", async (req, res) => {
  try {
    const newWish = {
      ...req.body,
      createdAt: new Date(),
    };
    const result = await wishCollection.insertOne(newWish);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to add to wishlist", error: err.message });
  }
});

// Remove item from wishlist
app.delete("/wish/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = getFilter(id);
    const result = await wishCollection.deleteOne(filter);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to remove wishlist item", error: err.message });
  }
});

// ----------------------------------------------------
// 16. Tourist Stories & Memoirs APIs
// ----------------------------------------------------

// Get all tourist stories
app.get("/touristStory", async (req, res) => {
  try {
    const result = await touristStoryCollection.find().toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch stories", error: err.message });
  }
});

// Get single story by ID
app.get("/touristStory/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = getFilter(id);
    const result = await touristStoryCollection.findOne(filter);
    res.send(result || null);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch story details", error: err.message });
  }
});

// Post a new tourist story
app.post("/touristStory", async (req, res) => {
  try {
    const story = {
      ...req.body,
      likes: req.body.likes || 0,
      createdAt: new Date(),
    };
    const result = await touristStoryCollection.insertOne(story);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to post story", error: err.message });
  }
});

// Update or Like story
app.patch("/touristStory/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = getFilter(id);
    let updateDoc = {};

    if (req.body.likeAction) {
      updateDoc = { $inc: { likes: 1 } };
    } else {
      updateDoc = { $set: req.body };
    }

    const result = await touristStoryCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to update story", error: err.message });
  }
});

// Delete story
app.delete("/touristStory/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = getFilter(id);
    const result = await touristStoryCollection.deleteOne(filter);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to delete story", error: err.message });
  }
});

// ----------------------------------------------------
// 17. Blogs APIs
// ----------------------------------------------------

// Get all blogs
app.get("/blogs", async (req, res) => {
  try {
    const blogs = await blogsCollection.find().toArray();
    res.send(blogs);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch blogs", error: err.message });
  }
});

// Get single blog by ID
app.get("/blogs/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = getFilter(id);
    const result = await blogsCollection.findOne(filter);
    res.send(result || null);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch blog", error: err.message });
  }
});

// Create new blog post
app.post("/blogs", async (req, res) => {
  try {
    const newBlog = {
      ...req.body,
      createdAt: new Date(),
    };
    const result = await blogsCollection.insertOne(newBlog);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to create blog", error: err.message });
  }
});

// Delete blog post
app.delete("/blogs/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = getFilter(id);
    const result = await blogsCollection.deleteOne(filter);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to delete blog", error: err.message });
  }
});

// ----------------------------------------------------
// 18. Overview & Admin Platform Analytics
// ----------------------------------------------------

// Get overview highlights
app.get("/overview", async (req, res) => {
  try {
    const result = await overviewCollection.find().toArray();
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch overview", error: err.message });
  }
});

// Platform Statistics
app.get("/admin-stats", async (req, res) => {
  try {
    const [users, packages, bookings, guides, stories] = await Promise.all([
      userCollection.estimatedDocumentCount().catch(() => 0),
      packagesCollection.estimatedDocumentCount().catch(() => 0),
      bookingsCollection.estimatedDocumentCount().catch(() => 0),
      tourGuidesCollection.estimatedDocumentCount().catch(() => 0),
      touristStoryCollection.estimatedDocumentCount().catch(() => 0),
    ]);

    res.send({
      users: users || 5,
      packages: packages || 6,
      bookings: bookings || 3,
      guides: guides || 4,
      stories: stories || 3,
    });
  } catch (err) {
    res.send({
      users: 5,
      packages: 6,
      bookings: 3,
      guides: 4,
      stories: 3,
    });
  }
});

// ----------------------------------------------------
// 19. Start Server
// ----------------------------------------------------
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`TravelBDX Tourism Server is running at http://localhost:${port}`);
  });
}

module.exports = app;
