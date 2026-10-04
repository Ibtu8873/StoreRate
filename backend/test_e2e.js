const baseUrl = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('  RateHub Full-Stack Comprehensive E2E Test Suite   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` PASS: ${message}`);
      passed++;
    } else {
      console.error(` FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // SECTION 1: Health & Public API
    // -------------------------------------------------------------
    console.log('\n--- 1. Health & Server Connectivity ---');
    const healthRes = await fetch(`${baseUrl}/health`).then(r => r.json());
    assert(healthRes.status === 'ok', 'Health check returns status ok');

    // -------------------------------------------------------------
    // SECTION 2: Input Validation Tests (Signup)
    // -------------------------------------------------------------
    console.log('\n--- 2. Input Validation Rules (Signup) ---');

    // Name < 20 characters
    const shortNameRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Name',
        email: 'test.short@ratehub.com',
        address: '123 Main Street, City',
        password: 'Password@123'
      })
    });
    assert(shortNameRes.status === 400, 'Rejects name with less than 20 characters (400)');

    // Password lacking special character
    const noSpecialPassRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Long Enough Valid Name Here',
        email: 'test.nopass@ratehub.com',
        address: '123 Main Street, City',
        password: 'Password123'
      })
    });
    assert(noSpecialPassRes.status === 400, 'Rejects password lacking special character (400)');

    // Password lacking uppercase character
    const noUpperPassRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Long Enough Valid Name Here',
        email: 'test.noupper@ratehub.com',
        address: '123 Main Street, City',
        password: 'password@123'
      })
    });
    assert(noUpperPassRes.status === 400, 'Rejects password lacking uppercase character (400)');

    // Valid Signup
    const uniqueEmail = `test.user.${Date.now()}@ratehub.com`;
    const validSignupRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Brand New Test Consumer Account', // 31 chars
        email: uniqueEmail,
        address: '456 Innovation Boulevard, Suite 300, Tech City',
        password: 'ValidPassword@123' // 18? Wait: 17 chars! Let's check: 8 to 16 chars!
      })
    });
    // Password "Pass@1234" is 9 chars
    const signupData = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Brand New Test Consumer Account', // 31 chars
        email: uniqueEmail,
        address: '456 Innovation Boulevard, Suite 300, Tech City',
        password: 'Pass@1234'
      })
    }).then(r => r.json());

    assert(signupData.success === true, 'Normal User Signup succeeds with valid constraints');
    assert(signupData.user.role === 'user', 'New user registered with role "user"');
    assert(!!signupData.token, 'JWT token returned on signup');

    // -------------------------------------------------------------
    // SECTION 3: Authentication & Role-Based Logins
    // -------------------------------------------------------------
    console.log('\n--- 3. Common Login for All Roles ---');

    // Normal User Login
    const userLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user.chris@ratehub.com', password: 'User@1234' })
    }).then(r => r.json());
    assert(userLogin.success === true && userLogin.user.role === 'user', 'Normal User login succeeds');

    // Store Owner Login
    const ownerLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner.alex@ratehub.com', password: 'Owner@123' })
    }).then(r => r.json());
    assert(ownerLogin.success === true && ownerLogin.user.role === 'owner', 'Store Owner login succeeds');

    // Admin Login
    const adminLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ratehub.com', password: 'Admin@123' })
    }).then(r => r.json());
    assert(adminLogin.success === true && adminLogin.user.role === 'admin', 'Administrator login succeeds');

    // -------------------------------------------------------------
    // SECTION 4: Normal User Store Operations & Ratings
    // -------------------------------------------------------------
    console.log('\n--- 4. Normal User Store Listing, Search & Ratings ---');
    const userToken = userLogin.token;

    // View stores
    const storesRes = await fetch(`${baseUrl}/stores`, {
      headers: { 'Authorization': 'Bearer ' + userToken }
    }).then(r => r.json());
    assert(storesRes.success === true && storesRes.stores.length > 0, 'Normal user can view store directory');

    // Search by name
    const searchNameRes = await fetch(`${baseUrl}/stores?name=Electronics`, {
      headers: { 'Authorization': 'Bearer ' + userToken }
    }).then(r => r.json());
    assert(searchNameRes.stores.every(s => s.name.toLowerCase().includes('electronics')), 'Search by store name functions correctly');

    // Search by address
    const searchAddressRes = await fetch(`${baseUrl}/stores?address=Galleria`, {
      headers: { 'Authorization': 'Bearer ' + userToken }
    }).then(r => r.json());
    assert(searchAddressRes.stores.every(s => s.address.toLowerCase().includes('galleria')), 'Search by store address functions correctly');

    // Submit rating
    const storeToRate = storesRes.stores[0];
    const submitRatingRes = await fetch(`${baseUrl}/stores/${storeToRate.id}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      },
      body: JSON.stringify({ rating: 4 })
    }).then(r => r.json());
    assert(submitRatingRes.success === true && submitRatingRes.rating === 4, 'User submits rating (1 to 5)');

    // Modify submitted rating
    const modifyRatingRes = await fetch(`${baseUrl}/stores/${storeToRate.id}/ratings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      },
      body: JSON.stringify({ rating: 5 })
    }).then(r => r.json());
    assert(modifyRatingRes.success === true && modifyRatingRes.rating === 5, 'User modifies their submitted rating');
    assert(modifyRatingRes.isNew === false, 'Updates existing rating instead of creating duplicate');

    // Reject rating outside 1 to 5 range
    const invalidRatingRes = await fetch(`${baseUrl}/stores/${storeToRate.id}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + userToken
      },
      body: JSON.stringify({ rating: 7 })
    });
    assert(invalidRatingRes.status === 400, 'Rejects rating outside 1 to 5 range (400)');

    // -------------------------------------------------------------
    // SECTION 5: Administrator Operations
    // -------------------------------------------------------------
    console.log('\n--- 5. Administrator Dashboard, User/Store Management ---');
    const adminToken = adminLogin.token;

    // Dashboard stats
    const dashStats = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { 'Authorization': 'Bearer ' + adminToken }
    }).then(r => r.json());
    assert(
      dashStats.success === true &&
      typeof dashStats.stats.totalUsers === 'number' &&
      typeof dashStats.stats.totalStores === 'number' &&
      typeof dashStats.stats.totalRatings === 'number',
      'Admin dashboard displays total users, total stores, and total ratings'
    );

    // Admin creates a new Store Owner user
    const newOwnerEmail = `new.owner.${Date.now()}@ratehub.com`;
    const createOwnerRes = await fetch(`${baseUrl}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + adminToken
      },
      body: JSON.stringify({
        name: 'Brand New Store Owner Executive', // 31 chars
        email: newOwnerEmail,
        address: '99 Commercial Center Way, Suite 10, Downtown',
        password: 'Owner@123',
        role: 'owner'
      })
    }).then(r => r.json());
    assert(createOwnerRes.success === true && createOwnerRes.user.role === 'owner', 'Admin can add new Store Owner');

    // Admin creates a new Store
    const newStoreRes = await fetch(`${baseUrl}/admin/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + adminToken
      },
      body: JSON.stringify({
        name: 'Downtown Gourmet Specialty Store', // 33 chars
        email: 'info@downtowngourmet.com',
        address: '99 Commercial Center Way, Unit 1A, Downtown',
        owner_id: createOwnerRes.user.id
      })
    }).then(r => r.json());
    assert(newStoreRes.success === true, 'Admin can add new Store assigned to a Store Owner');

    // Admin views Users list
    const adminUsersRes = await fetch(`${baseUrl}/admin/users`, {
      headers: { 'Authorization': 'Bearer ' + adminToken }
    }).then(r => r.json());
    assert(adminUsersRes.success === true && adminUsersRes.users.length > 0, 'Admin can view all registered users');

    // Check store_rating presence for store owners
    const ownerInList = adminUsersRes.users.find(u => u.role === 'owner' && u.store_rating !== null);
    assert(!!ownerInList, 'Administrator view includes Store Owner ratings');

    // Admin views User Details
    const userDetailsRes = await fetch(`${baseUrl}/admin/users/${ownerLogin.user.id}`, {
      headers: { 'Authorization': 'Bearer ' + adminToken }
    }).then(r => r.json());
    assert(userDetailsRes.success === true && userDetailsRes.user.stores !== undefined, 'Admin can view comprehensive user details with stores');

    // -------------------------------------------------------------
    // SECTION 6: Store Owner Operations
    // -------------------------------------------------------------
    console.log('\n--- 6. Store Owner Analytics & Reviews ---');
    const ownerToken = ownerLogin.token;

    // View customer ratings for their store
    const ownerRatingsRes = await fetch(`${baseUrl}/owner/store/ratings`, {
      headers: { 'Authorization': 'Bearer ' + ownerToken }
    }).then(r => r.json());
    assert(ownerRatingsRes.success === true && Array.isArray(ownerRatingsRes.ratings), 'Store owner can view users who submitted ratings for their store');
    if (ownerRatingsRes.ratings.length > 0) {
      const firstReview = ownerRatingsRes.ratings[0];
      assert(!!firstReview.user_name && !!firstReview.rating, 'Review contains customer name and rating');
    }

    // View average rating analytics
    const ownerAvgRes = await fetch(`${baseUrl}/owner/store/average-rating`, {
      headers: { 'Authorization': 'Bearer ' + ownerToken }
    }).then(r => r.json());
    assert(
      ownerAvgRes.success === true &&
      typeof ownerAvgRes.averageRating === 'number' &&
      ownerAvgRes.distribution !== undefined,
      'Store owner can view store average rating and rating breakdown'
    );

    // -------------------------------------------------------------
    // SECTION 7: Security & Authorization Boundaries
    // -------------------------------------------------------------
    console.log('\n--- 7. Role Isolation & Security Controls ---');

    // Normal User blocked from Admin API
    const userToAdminRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { 'Authorization': 'Bearer ' + userToken }
    });
    assert(userToAdminRes.status === 403, 'Normal User blocked from Admin API (403 Forbidden)');

    // Store Owner blocked from Admin API
    const ownerToAdminRes = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: { 'Authorization': 'Bearer ' + ownerToken }
    });
    assert(ownerToAdminRes.status === 403, 'Store Owner blocked from Admin API (403 Forbidden)');

    // Normal User blocked from Store Owner API
    const userToOwnerRes = await fetch(`${baseUrl}/owner/store/ratings`, {
      headers: { 'Authorization': 'Bearer ' + userToken }
    });
    assert(userToOwnerRes.status === 403, 'Normal User blocked from Store Owner API (403 Forbidden)');

    // Password never exposed in responses
    assert(userLogin.user.password === undefined, 'User passwords never returned in auth login responses');
    assert(adminUsersRes.users.every(u => u.password === undefined), 'User passwords never returned in admin user queries');

    // Summary
    console.log('\n====================================================');
    console.log(`  Tests Complete: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal Test Exception:', err);
    process.exit(1);
  }
}

runTests();
