const WEB_REPOSITORY_URL = "https://github.com/chill-institute/chill-web";
const GITHUB_ORG_URL = "https://github.com/chill-institute";

export const publicLinks = {
  about: `${WEB_REPOSITORY_URL}/blob/main/docs/ABOUT.md`,
  guides: `${WEB_REPOSITORY_URL}/blob/main/docs/GUIDES.md`,
  github: GITHUB_ORG_URL,
  x: "https://x.com/chill_institute",
  email: "mailto:chillardinho@chill.institute",
  reddit: "https://www.reddit.com/r/chillInstitute/",
} as const;
