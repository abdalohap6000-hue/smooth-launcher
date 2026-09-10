import { ReplitConnectors } from '@replit/connectors-sdk';

const connectors = new ReplitConnectors();
const projectName = process.env.REVENUECAT_PROJECT_NAME || 'Qalami AI';
const configuredProjectId = process.env.REVENUECAT_PROJECT_ID;

async function request(path, options = {}) {
  const response = await connectors.proxy('revenuecat', path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${path} failed (${response.status}): ${body.message || text}`);
  return body;
}

async function list(path) {
  return (await request(path)).items || [];
}

async function ensureProject() {
  if (configuredProjectId) return configuredProjectId;
  const projects = await list('/v2/projects');
  const existing = projects.find((project) => project.name === projectName);
  if (existing) return existing.id;
  const created = await request('/v2/projects', { method: 'POST', body: JSON.stringify({ name: projectName }) });
  return created.id;
}

async function ensureResource(path, collectionPath, predicate, payload) {
  const resources = await list(collectionPath);
  const found = resources.find(predicate);
  if (found) return found;
  return request(path, { method: 'POST', body: JSON.stringify(payload) });
}

const projectId = await ensureProject();
const apps = await list(`/v2/projects/${projectId}/apps`);
const testStore = apps.find((app) => app.type === 'test_store') ||
  await request(`/v2/projects/${projectId}/apps`, {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Store', type: 'test_store' }),
  });

const iosBundleId = process.env.REVENUECAT_IOS_BUNDLE_ID;
const androidPackageName = process.env.REVENUECAT_ANDROID_PACKAGE_NAME;
if (iosBundleId && !apps.some((app) => app.type === 'app_store' && app.bundle_id === iosBundleId)) {
  await request(`/v2/projects/${projectId}/apps`, {
    method: 'POST',
    body: JSON.stringify({ name: 'Qalami AI iOS', type: 'app_store', bundle_id: iosBundleId }),
  });
}
if (androidPackageName && !apps.some((app) => app.type === 'play_store' && app.package_name === androidPackageName)) {
  await request(`/v2/projects/${projectId}/apps`, {
    method: 'POST',
    body: JSON.stringify({ name: 'Qalami AI Android', type: 'play_store', package_name: androidPackageName }),
  });
}

const products = await list(`/v2/projects/${projectId}/products`);
const monthly = products.find((product) => product.store_identifier === 'qalami_premium_monthly') ||
  await request(`/v2/projects/${projectId}/products`, {
    method: 'POST',
    body: JSON.stringify({
      app_id: testStore.id,
      display_name: 'Qalami Premium Monthly',
      store_identifier: 'qalami_premium_monthly',
      type: 'subscription',
      subscription: { duration: 'P1M' },
    }),
  });
const yearly = products.find((product) => product.store_identifier === 'qalami_premium_yearly') ||
  await request(`/v2/projects/${projectId}/products`, {
    method: 'POST',
    body: JSON.stringify({
      app_id: testStore.id,
      display_name: 'Qalami Premium Yearly',
      store_identifier: 'qalami_premium_yearly',
      type: 'subscription',
      subscription: { duration: 'P1Y' },
    }),
  });

const entitlements = await list(`/v2/projects/${projectId}/entitlements`);
const entitlement = entitlements.find((item) => item.lookup_key === 'premium') ||
  await request(`/v2/projects/${projectId}/entitlements`, {
    method: 'POST',
    body: JSON.stringify({ lookup_key: 'premium', display_name: 'Qalami Premium Access' }),
  });

const offerings = await list(`/v2/projects/${projectId}/offerings`);
const offering = offerings.find((item) => item.lookup_key === 'default') ||
  await request(`/v2/projects/${projectId}/offerings`, {
    method: 'POST',
    body: JSON.stringify({ lookup_key: 'default', display_name: 'Qalami Premium Plans' }),
  });

const packages = await list(`/v2/projects/${projectId}/offerings/${offering.id}/packages`);
const monthlyPackage = packages.find((item) => item.lookup_key === '$rc_monthly') ||
  await request(`/v2/projects/${projectId}/offerings/${offering.id}/packages`, {
    method: 'POST',
    body: JSON.stringify({ lookup_key: '$rc_monthly', display_name: 'Monthly Premium', position: 0 }),
  });
const yearlyPackage = packages.find((item) => item.lookup_key === '$rc_annual') ||
  await request(`/v2/projects/${projectId}/offerings/${offering.id}/packages`, {
    method: 'POST',
    body: JSON.stringify({ lookup_key: '$rc_annual', display_name: 'Yearly Premium', position: 1 }),
  });

console.log(JSON.stringify({
  projectId,
  testStoreAppId: testStore.id,
  productIds: [monthly.id, yearly.id],
  entitlementId: entitlement.lookup_key,
  offeringId: offering.id,
  packageIds: [monthlyPackage.id, yearlyPackage.id],
}));