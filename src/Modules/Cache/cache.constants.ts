export const CACHE_TTL = {
  DEFAULT: 300,

  // 🏫 Academy (quase estático)
  ACADEMY_PROFILE: 600,
  ACADEMY_STATS: 300,
    ACADEMY_LIST: 300,

  // 👤 User
  USER_PROFILE: 600,
  USER_PERMISSIONS: 300,

  // 🥋 Athlete
  ATHLETE_PROFILE: 600,
  ATHLETE_LIST: 300,

  // 💳 Payments
  PAYMENTS_SUMMARY: 300,

  // 📦 Subscription
  SUBSCRIPTION: 600,

  // 🔐 Auth
  AUTH_TOKEN: 120,
  TWO_FACTOR: 120,

  // 📥 Download keys
  DOWNLOAD_KEY: 300,

  // 📊 Dashboard
  DASHBOARD: 300,


};

export const CACHE_KEYS = {
  // Academy
  academy: (id: string) => `academy:${id}`,
  academyStats: (id: string) => `academy:${id}:stats`,
  academiesList: (filterHash: string) => `academies:list:${filterHash}`,
  academyUser: (id: string, userId: string) => `academy:${id}:user:${userId}`,


  // User
  user: (id: string) => `user:${id}`,
  userPermissions: (id: string) => `user:permissions:${id}`,

  // Athlete
  athlete: (id: string) => `athlete:${id}`,
  athletesByAcademy: (academyId: string) =>
    `athletes:academy:${academyId}`,

  // Subscription
  subscription: (academyId: string) =>
    `subscription:${academyId}`,

  subscriptionStatus: (academyId: string) =>
    `subscription:status:${academyId}`,

  // Payments
  paymentsSummary: (academyId: string) =>
    `payments:summary:${academyId}`,

  // Auth
  authToken: (accountId: string) =>
    `auth:token:${accountId}`,

  twoFactor: (accountId: string) =>
    `2fa:${accountId}`,

  // Download
  downloadKey: (key: string) =>
    `downloadKey:${key}`,

  // Dashboard
  academyDashboard: (academyId: string) =>
    `dashboard:academy:${academyId}`,

  
};