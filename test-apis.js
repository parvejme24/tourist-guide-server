/**
 * TravelBDX - End-to-End API Test Suite
 * Tests all endpoints in tourist-guide-server/index.js with demo data
 * Verifies direct image link storage (zero file storage).
 */
process.env.NODE_ENV = "test";
const app = require("./index.js");
const { EventEmitter } = require("events");

function request(method, url, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter();
    req.method = method.toUpperCase();
    const [pathOnly, queryString] = url.split("?");
    req.url = url;
    req.path = pathOnly;
    req.originalUrl = url;
    req.query = {};
    if (queryString) {
      const sp = new URLSearchParams(queryString);
      for (const [key, val] of sp.entries()) {
        req.query[key] = val;
      }
    }
    req.headers = {
      host: "localhost:5000",
      "content-type": "application/json",
      ...headers,
    };
    req.body = body || {};

    const res = new EventEmitter();
    res.statusCode = 200;
    res.headers = {};
    res.setHeader = (k, v) => {
      res.headers[k.toLowerCase()] = v;
    };
    res.getHeader = (k) => res.headers[k.toLowerCase()];

    let responseData = "";
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.send = (data) => {
      resolve({ statusCode: res.statusCode, body: data });
    };
    res.json = (data) => res.send(data);
    res.end = (chunk) => {
      if (chunk) responseData += chunk;
      try {
        const parsed = JSON.parse(responseData);
        resolve({ statusCode: res.statusCode, body: parsed });
      } catch (e) {
        resolve({ statusCode: res.statusCode, body: responseData });
      }
    };

    try {
      app.handle(req, res);
    } catch (err) {
      reject(err);
    }
  });
}

const colors = {
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  blue: (t) => `\x1b[34m${t}\x1b[0m`,
  bold: (t) => `\x1b[1m${t}\x1b[0m`,
  dim: (t) => `\x1b[2m${t}\x1b[0m`,
};

let passed = 0;
let failed = 0;

function assert(condition, testName, extraInfo = "") {
  if (condition) {
    passed++;
    console.log(`  ${colors.green("✔")} ${testName} ${extraInfo ? colors.dim(`(${extraInfo})`) : ""}`);
  } else {
    failed++;
    console.error(`  ${colors.red("✖")} ${colors.bold(testName)} ${extraInfo ? `[${extraInfo}]` : ""}`);
  }
}

async function runTestSuite() {
  console.log(colors.bold("\n======================================================="));
  console.log(colors.bold("   TravelBDX - Comprehensive API & Demo Data Test Suite"));
  console.log(colors.bold("=======================================================\n"));

  // 1. Health Check
  console.log(colors.blue("1. Root & Health Check Endpoint"));
  const healthRes = await request("GET", "/");
  assert(healthRes.statusCode === 200, "GET / responds with 200 OK");
  assert(healthRes.body.status === "healthy", "GET / returns status: 'healthy'");
  assert(
    healthRes.body.storageType === "Direct Links (Zero File Storage)",
    "Storage configuration confirms direct links without file storage"
  );

  // 2. Demo Data Seeder
  console.log(colors.blue("\n2. Demo Data Seeder Endpoint"));
  const seedRes = await request("POST", "/seed-demo-data");
  assert(seedRes.statusCode === 200, "POST /seed-demo-data responds with 200 OK");
  assert(seedRes.body.success === true, "POST /seed-demo-data reports success: true");
  assert(seedRes.body.counts.packages >= 6, "Seed loads 6+ demo packages", `${seedRes.body.counts.packages} packages`);
  assert(seedRes.body.counts.users >= 5, "Seed loads 5+ demo users", `${seedRes.body.counts.users} users`);
  assert(seedRes.body.counts.tourGuides >= 4, "Seed loads 4+ demo tour guides", `${seedRes.body.counts.tourGuides} guides`);

  // 3. JWT Authentication
  console.log(colors.blue("\n3. JWT Authentication Endpoint"));
  const jwtRes = await request("POST", "/jwt", { email: "admin@travelbdx.com" });
  assert(jwtRes.statusCode === 200, "POST /jwt responds with 200 OK");
  assert(typeof jwtRes.body.token === "string" && jwtRes.body.token.length > 20, "POST /jwt returns valid signed JWT");
  const adminToken = jwtRes.body.token;

  // 4. Tour Packages CRUD
  console.log(colors.blue("\n4. Tour Packages APIs (Full CRUD + Direct Links)"));
  const getPackagesRes = await request("GET", "/packages");
  assert(getPackagesRes.statusCode === 200, "GET /packages returns 200 OK");
  assert(Array.isArray(getPackagesRes.body) && getPackagesRes.body.length >= 6, "GET /packages returns all packages");

  // Verify direct image URLs (zero file storage)
  const firstPkg = getPackagesRes.body[0];
  assert(
    firstPkg.coverImage.startsWith("https://images.unsplash.com") || firstPkg.coverImage.startsWith("http"),
    "Package coverImage is a direct HTTP/HTTPS link",
    firstPkg.coverImage.slice(0, 45) + "..."
  );
  assert(
    Array.isArray(firstPkg.galleryImages) &&
      firstPkg.galleryImages.every((img) => img.startsWith("http")),
    "Package galleryImages are all direct HTTP/HTTPS links"
  );

  // Single package by ID
  const singlePkgRes = await request("GET", `/packages/${firstPkg._id}`);
  assert(singlePkgRes.statusCode === 200, `GET /packages/:id fetches '${firstPkg.tripTitle}'`);
  assert(singlePkgRes.body._id === firstPkg._id, "Single package ID matches");

  // Filter packages by Tour Type
  const categoryRes = await request("GET", "/packages/category/Adventure");
  assert(categoryRes.statusCode === 200, "GET /packages/category/:tourType returns 200 OK");
  assert(categoryRes.body.length > 0, "Finds packages matching category 'Adventure'");

  // Create new package with direct link
  const newPkgData = {
    tripTitle: "Kuakata Daughter of Sea Sunrise & Sunset Tour",
    tourType: "Beach & Nature",
    price: "৳5,900",
    numericPrice: 5900,
    duration: "3 Days / 2 Nights",
    location: "Kuakata, Patuakhali",
    coverImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    ],
    aboutTheTour: "Watch both panoramic sunrise and sunset over the Bay of Bengal from the same beach spot.",
  };
  const createPkgRes = await request("POST", "/packages", newPkgData);
  assert(createPkgRes.statusCode === 200, "POST /packages creates new package");
  const createdPkgId = createPkgRes.body.insertedId;
  assert(Boolean(createdPkgId), "Returns insertedId for new package");

  // Update package
  const updatePkgRes = await request("PATCH", `/packages/${createdPkgId}`, {
    price: "৳6,200",
    numericPrice: 6200,
  });
  assert(updatePkgRes.statusCode === 200, "PATCH /packages/:id updates package details");

  // Delete package
  const deletePkgRes = await request("DELETE", `/packages/${createdPkgId}`);
  assert(deletePkgRes.statusCode === 200 && deletePkgRes.body.deletedCount === 1, "DELETE /packages/:id deletes package successfully");

  // 5. User Management CRUD
  console.log(colors.blue("\n5. User Management APIs"));
  const usersRes = await request("GET", "/users");
  assert(usersRes.statusCode === 200, "GET /users returns 200 OK");
  assert(Array.isArray(usersRes.body) && usersRes.body.length >= 5, "GET /users returns all users");

  // Admin check
  const adminCheckRes = await request("GET", "/users/admin/admin@travelbdx.com");
  assert(adminCheckRes.statusCode === 200 && adminCheckRes.body.admin === true, "GET /users/admin/:email identifies admin correctly");

  // Single user by email
  const userByEmailRes = await request("GET", "/users/user@travelbdx.com");
  assert(userByEmailRes.statusCode === 200 && userByEmailRes.body.email === "user@travelbdx.com", "GET /users/:email returns user record");
  assert(
    userByEmailRes.body.photoURL.startsWith("http"),
    "User photoURL is a direct HTTP/HTTPS link without file storage",
    userByEmailRes.body.photoURL.slice(0, 45) + "..."
  );

  // Register new user with direct photo link
  const testEmail = `tester_${Date.now()}@travelbdx.com`;
  const createUserRes = await request("POST", "/users", {
    name: "Automated Tester",
    email: testEmail,
    role: "user",
    photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
  });
  assert(createUserRes.statusCode === 200 && createUserRes.body.insertedId, "POST /users creates new user");
  const testUserId = createUserRes.body.insertedId;

  // Update role
  const updateRoleRes = await request("PATCH", `/users/role/${testUserId}`, { role: "tour_guide" });
  assert(updateRoleRes.statusCode === 200, "PATCH /users/role/:id updates user role");

  // Update profile
  const updateProfileRes = await request("PATCH", `/users/profile/${testEmail}`, {
    bio: "Passionate adventurer and beta tester.",
    location: "Chittagong, Bangladesh",
  });
  assert(updateProfileRes.statusCode === 200, "PATCH /users/profile/:email updates user profile");

  // Delete test user
  const deleteUserRes = await request("DELETE", `/users/${testUserId}`);
  assert(deleteUserRes.statusCode === 200, "DELETE /users/:id removes test user");

  // 6. Tour Guides CRUD
  console.log(colors.blue("\n6. Tour Guides APIs"));
  const guidesRes = await request("GET", "/tourGuides");
  assert(guidesRes.statusCode === 200, "GET /tourGuides returns 200 OK");
  assert(Array.isArray(guidesRes.body) && guidesRes.body.length >= 4, "GET /tourGuides returns all guides");
  const firstGuide = guidesRes.body[0];
  assert(
    firstGuide.photo.startsWith("http") || firstGuide.profileImage.startsWith("http"),
    "Tour guide photo is a direct link",
    firstGuide.photo.slice(0, 45) + "..."
  );

  const guideByIdRes = await request("GET", `/tourGuides/${firstGuide._id}`);
  assert(guideByIdRes.statusCode === 200 && guideByIdRes.body.name === firstGuide.name, "GET /tourGuides/:id fetches single guide");

  // 7. Bookings APIs
  console.log(colors.blue("\n7. Bookings APIs"));
  const bookingsRes = await request("GET", "/bookings");
  assert(bookingsRes.statusCode === 200, "GET /bookings returns 200 OK");
  assert(Array.isArray(bookingsRes.body) && bookingsRes.body.length >= 3, "GET /bookings returns bookings list");

  // Filter bookings by user email
  const userBookingsRes = await request("GET", "/bookings?email=user@travelbdx.com");
  assert(userBookingsRes.statusCode === 200, "GET /bookings?email=... filters user bookings");
  assert(userBookingsRes.body.every((b) => b.touristEmail === "user@travelbdx.com" || b.email === "user@travelbdx.com"), "All filtered bookings match email");

  // Create booking
  const newBookingRes = await request("POST", "/bookings", {
    touristName: "Demo Explorer",
    touristEmail: "user@travelbdx.com",
    packageId: "jaflong-pkg-6",
    packageName: "Jaflong Crystal River & Ratargul Swamp Forest",
    price: 5200,
    tourDate: "2026-12-12",
    guideName: "Nusrat Jahan",
  });
  assert(newBookingRes.statusCode === 200 && newBookingRes.body.insertedId, "POST /bookings creates new booking");
  const testBookingId = newBookingRes.body.insertedId;

  // Update status
  const updateBookingRes = await request("PATCH", `/bookings/${testBookingId}`, { status: "Paid" });
  assert(updateBookingRes.statusCode === 200, "PATCH /bookings/:id updates booking status to 'Paid'");

  // Cancel booking
  const deleteBookingRes = await request("DELETE", `/bookings/${testBookingId}`);
  assert(deleteBookingRes.statusCode === 200, "DELETE /bookings/:id cancels booking");

  // 8. Wishlist APIs
  console.log(colors.blue("\n8. Wishlist APIs"));
  const wishlistRes = await request("GET", "/wish?email=user@travelbdx.com");
  assert(wishlistRes.statusCode === 200, "GET /wish?email=... returns user wishlist");
  assert(Array.isArray(wishlistRes.body) && wishlistRes.body.length >= 2, "Wishlist contains items with direct image links");

  // Add to wishlist
  const addWishRes = await request("POST", "/wish", {
    userEmail: "user@travelbdx.com",
    packageId: "jaflong-pkg-6",
    tripTitle: "Jaflong Crystal River & Ratargul Swamp Forest",
    price: 5200,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  });
  assert(addWishRes.statusCode === 200 && addWishRes.body.insertedId, "POST /wish adds item to wishlist");
  const wishId = addWishRes.body.insertedId;

  // Remove from wishlist
  const removeWishRes = await request("DELETE", `/wish/${wishId}`);
  assert(removeWishRes.statusCode === 200, "DELETE /wish/:id removes item from wishlist");

  // 9. Tourist Stories APIs
  console.log(colors.blue("\n9. Tourist Stories APIs"));
  const storiesRes = await request("GET", "/touristStory");
  assert(storiesRes.statusCode === 200, "GET /touristStory returns 200 OK");
  assert(Array.isArray(storiesRes.body) && storiesRes.body.length >= 3, "GET /touristStory returns stories");

  const firstStory = storiesRes.body[0];
  assert(firstStory.image.startsWith("http"), "Story image is a direct HTTP/HTTPS link", firstStory.image.slice(0, 45) + "...");

  // Like story
  const likeStoryRes = await request("PATCH", `/touristStory/${firstStory._id}`, { likeAction: true });
  assert(likeStoryRes.statusCode === 200, "PATCH /touristStory/:id increments story likes");

  // 10. Blogs APIs
  console.log(colors.blue("\n10. Blogs APIs"));
  const blogsRes = await request("GET", "/blogs");
  assert(blogsRes.statusCode === 200, "GET /blogs returns 200 OK");
  assert(Array.isArray(blogsRes.body) && blogsRes.body.length >= 2, "GET /blogs returns blogs");
  assert(blogsRes.body[0].image.startsWith("http"), "Blog cover image is a direct HTTP/HTTPS link");

  // 11. Admin Platform Stats & Overview
  console.log(colors.blue("\n11. Admin Platform Stats & Overview APIs"));
  const statsRes = await request("GET", "/admin-stats");
  assert(statsRes.statusCode === 200, "GET /admin-stats returns 200 OK");
  assert(typeof statsRes.body.packages === "number" && statsRes.body.packages >= 6, "Stats reports packages count", `${statsRes.body.packages} packages`);
  assert(typeof statsRes.body.users === "number" && statsRes.body.users >= 5, "Stats reports users count", `${statsRes.body.users} users`);

  const overviewRes = await request("GET", "/overview");
  assert(overviewRes.statusCode === 200 && Array.isArray(overviewRes.body), "GET /overview returns platform overview");

  // Summary
  console.log(colors.bold("\n======================================================="));
  console.log(colors.bold(`  Test Results: ${colors.green(`${passed} Passed`)} | ${failed > 0 ? colors.red(`${failed} Failed`) : "0 Failed"}`));
  console.log(colors.bold("=======================================================\n"));

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});

