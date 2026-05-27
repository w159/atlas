// Live end-to-end smoke test for every Auvik MCP tool.
// Requires AUVIK_USERNAME, AUVIK_API_KEY (and optionally AUVIK_REGION) in env.
// Run from package dir:  npx tsx scripts/smoke.ts
import 'dotenv/config';
import { handleTenantsList, handleTenantsDetail } from '../src/tools/tenants.js';
import {
  handleDevicesList, handleDevicesGet, handleDevicesGetDetails,
  handleDevicesListWarranty, handleDevicesListLifecycle,
} from '../src/tools/devices.js';
import { handleNetworksList, handleNetworksGet, handleNetworksListDetail } from '../src/tools/networks.js';
import { handleInterfacesList, handleInterfacesGet } from '../src/tools/interfaces.js';
import { handleConfigurationsList, handleConfigurationsGet } from '../src/tools/configurations.js';
import { handleComponentsList } from '../src/tools/components.js';
import { handleEntitiesListNotes, handleEntitiesListAudits } from '../src/tools/entities.js';
import { handleAlertsList, handleAlertsGet } from '../src/tools/alerts.js';
import { handleStatisticsDevice } from '../src/tools/statistics.js';
import { handleBillingClientUsage } from '../src/tools/billing.js';
import { handleStatus } from '../src/tools/status.js';
import { handleNavigate } from '../src/tools/navigate.js';

type ToolResult = { content: { type: string; text: string }[]; isError?: boolean };

const results: { name: string; ok: boolean; summary: string }[] = [];

async function run(name: string, fn: () => Promise<ToolResult>) {
  process.stdout.write(`  ${name.padEnd(40)} `);
  try {
    const r = await fn();
    const isErr = !!r.isError;
    const body = r.content?.[0]?.text ?? '';
    let summary: string;
    try {
      const parsed = JSON.parse(body);
      if (parsed?.data && Array.isArray(parsed.data)) summary = `data[${parsed.data.length}]`;
      else if (parsed?.data) summary = `data{${parsed.data.type || 'object'}}`;
      else summary = body.slice(0, 80);
    } catch {
      summary = body.slice(0, 80);
    }
    const ok = !isErr;
    results.push({ name, ok, summary });
    console.log(`${ok ? 'OK ' : 'ERR'}  ${summary}`);
    return r;
  } catch (e) {
    const msg = (e as Error).message;
    results.push({ name, ok: false, summary: msg });
    console.log(`THROW  ${msg}`);
    return null;
  }
}

function dataIds(r: ToolResult | null): string[] {
  if (!r) return [];
  try {
    const parsed = JSON.parse(r.content[0].text);
    if (Array.isArray(parsed?.data)) return parsed.data.map((d: { id: string }) => d.id);
    if (parsed?.data?.id) return [parsed.data.id];
  } catch { /* ignore */ }
  return [];
}

function firstId(r: ToolResult | null): string | undefined { return dataIds(r)[0]; }

(async () => {
  console.log('\n=== Auvik MCP live smoke ===');

  await run('auvik_status', () => handleStatus());

  const tenants = await run('auvik_tenants_list', () => handleTenantsList());
  const tenantIds = dataIds(tenants);
  const clientTenant = tenantIds.find((id) => {
    try {
      const data = JSON.parse(tenants!.content[0].text).data;
      const t = data.find((x: { id: string; attributes?: { tenantType?: string } }) => x.id === id);
      return t?.attributes?.tenantType === 'client';
    } catch { return false; }
  }) || tenantIds[0];
  console.log(`  → using tenantId=${clientTenant}`);

  // Tenant detail — need a domain prefix
  let domainPrefix: string | undefined;
  try {
    const data = JSON.parse(tenants!.content[0].text).data as { id: string; attributes?: { domainPrefix?: string } }[];
    domainPrefix = data.find((d) => d.id === clientTenant)?.attributes?.domainPrefix
      || data[0]?.attributes?.domainPrefix;
  } catch { /* ignore */ }
  if (domainPrefix) {
    await run('auvik_tenants_detail', () => handleTenantsDetail({ tenantDomainPrefix: domainPrefix! }));
  }

  const devices = await run('auvik_devices_list', () => handleDevicesList({ tenants: clientTenant, pageSize: 2 }));
  const deviceId = firstId(devices);
  if (deviceId) {
    await run('auvik_devices_get', () => handleDevicesGet({ deviceId }));
    await run('auvik_devices_get_details', () => handleDevicesGetDetails({ deviceId }));
  }
  await run('auvik_devices_list_warranty', () => handleDevicesListWarranty({ tenants: clientTenant }));
  await run('auvik_devices_list_lifecycle', () => handleDevicesListLifecycle({ tenants: clientTenant }));

  const networks = await run('auvik_networks_list', () => handleNetworksList({ tenants: clientTenant, pageSize: 2 }));
  const networkId = firstId(networks);
  if (networkId) await run('auvik_networks_get', () => handleNetworksGet({ networkId }));
  await run('auvik_networks_list_detail', () => handleNetworksListDetail({ tenants: clientTenant, pageSize: 2 }));

  const interfaces = await run('auvik_interfaces_list', () => handleInterfacesList({ tenants: clientTenant, pageSize: 2 }));
  const interfaceId = firstId(interfaces);
  if (interfaceId) await run('auvik_interfaces_get', () => handleInterfacesGet({ interfaceId }));

  const configs = await run('auvik_configurations_list', () => handleConfigurationsList({ tenants: clientTenant, pageSize: 2 }));
  const configurationId = firstId(configs);
  if (configurationId) await run('auvik_configurations_get', () => handleConfigurationsGet({ configurationId }));

  await run('auvik_components_list', () => handleComponentsList({ tenants: clientTenant }));
  await run('auvik_entities_list_notes', () => handleEntitiesListNotes({ tenants: clientTenant }));
  await run('auvik_entities_list_audits', () => handleEntitiesListAudits({ tenants: clientTenant, pageSize: 2 }));

  const alerts = await run('auvik_alerts_list', () => handleAlertsList({ tenants: clientTenant, pageSize: 2 }));
  // Auvik quirk: not every alertId is reachable via /alert/history/info/{id} from every tenant
  // context (some return 404 even though the list call returned them). Try each in turn.
  const alertIds = dataIds(alerts);
  let alertGotOne = false;
  for (const alertId of alertIds) {
    const r = await run(`auvik_alerts_get(${alertId.slice(-8)})`, () => handleAlertsGet({ alertId }));
    if (r && !r.isError) { alertGotOne = true; break; }
  }
  if (!alertGotOne && alertIds.length > 0) {
    // Try other tenants
    for (const altTenant of tenantIds.filter((t) => t !== clientTenant)) {
      const altAlerts = await handleAlertsList({ tenants: altTenant, pageSize: 1 });
      const altIds = dataIds(altAlerts as ToolResult);
      if (altIds.length) {
        const r = await run(`auvik_alerts_get(via tenant ${altTenant.slice(-6)})`, () => handleAlertsGet({ alertId: altIds[0] }));
        if (r && !r.isError) break;
      }
    }
  }

  // Pagination via navigate
  try {
    const next = JSON.parse(alerts!.content[0].text).links?.next as string | undefined;
    if (next) await run('auvik_navigate', () => handleNavigate({ url: next }));
  } catch { /* ignore */ }

  if (deviceId) {
    const now = new Date();
    const yest = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    await run('auvik_statistics_device(cpu)', () => handleStatisticsDevice({
      statId: 'cpuUtilization',
      tenants: clientTenant,
      deviceId,
      fromTime: yest.toISOString(),
      thruTime: now.toISOString(),
      interval: 'hour',
    }));
  }

  // Billing — calendar date range, last full month
  const now = new Date();
  const firstOfThis = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const firstOfPrev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const lastOfPrev = new Date(firstOfThis.getTime() - 24 * 60 * 60 * 1000);
  const fromDate = firstOfPrev.toISOString().slice(0, 10);
  const thruDate = lastOfPrev.toISOString().slice(0, 10);
  await run(`auvik_billing_client_usage(${fromDate}..${thruDate})`, () => handleBillingClientUsage({ fromDate, thruDate }));

  // Summary
  console.log('\n=== Summary ===');
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log(`Passed: ${passed}/${results.length}`);
  if (failed.length) {
    console.log('Failed:');
    for (const f of failed) console.log(`  - ${f.name}: ${f.summary}`);
    process.exit(1);
  }
})();
