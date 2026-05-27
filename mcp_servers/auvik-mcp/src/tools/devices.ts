import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCredentials } from '../credentials.js';
import { createAuvikClient } from '../client-factory.js';
import { toMcpError } from '../errors.js';

const noCreds = () => ({
  content: [{ type: 'text' as const, text: 'No Auvik credentials configured.' }],
  isError: true,
});
const ok = (r: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(r, null, 2) }] });
const fail = (e: unknown) => {
  const m = toMcpError(e);
  return { content: [{ type: 'text' as const, text: m.message }], isError: true };
};

const tenantsProp = {
  tenants: {
    type: 'string',
    description: 'Comma-separated Auvik tenant IDs (REQUIRED — Auvik rejects unscoped inventory queries on multi-tenant credentials).',
  },
} as const;

const pageProps = {
  pageSize: { type: 'number', description: 'Items per page (page[first]). Max 1000.' },
  pageAfter: { type: 'string', description: 'Cursor from prior response links.next (page[after]).' },
} as const;

export const devicesListTool: Tool = {
  name: 'auvik_devices_list',
  description: 'GET /v1/inventory/device/info — list Auvik-managed devices. JSON:API. Paginate via links.next (pass page[after] cursor via pageAfter).',
  inputSchema: {
    type: 'object',
    properties: {
      ...tenantsProp,
      ...pageProps,
      filter_deviceType: { type: 'string', description: 'filter[deviceType], e.g. "switch", "router", "firewall".' },
      filter_modifiedAfter: { type: 'string', description: 'filter[modifiedAfter] ISO 8601.' },
      filter_makeModel: { type: 'string', description: 'filter[makeModel].' },
      filter_vendorName: { type: 'string', description: 'filter[vendorName].' },
      filter_onlineStatus: {
        type: 'string',
        enum: ['online', 'offline', 'unreachable', 'testing', 'unknown', 'dormant', 'notPresent', 'lowerLayerDown'],
        description: 'filter[onlineStatus].',
      },
    },
    required: ['tenants'],
    additionalProperties: false,
  },
};

export const devicesGetTool: Tool = {
  name: 'auvik_devices_get',
  description: 'GET /v1/inventory/device/info/{deviceId} — single device basic info.',
  inputSchema: {
    type: 'object',
    properties: { deviceId: { type: 'string', description: 'Auvik device ID from a list call.' } },
    required: ['deviceId'],
    additionalProperties: false,
  },
};

export const devicesGetDetailsTool: Tool = {
  name: 'auvik_devices_get_details',
  description: 'GET /v1/inventory/device/detail/{deviceId} — extended detail (discoveryStatus, manageStatus, traffic insights, connected devices).',
  inputSchema: {
    type: 'object',
    properties: { deviceId: { type: 'string', description: 'Auvik device ID.' } },
    required: ['deviceId'],
    additionalProperties: false,
  },
};

export const devicesListWarrantyTool: Tool = {
  name: 'auvik_devices_list_warranty',
  description: 'GET /v1/inventory/device/warranty — list device warranty records for a tenant. (No per-device endpoint; list and filter client-side.)',
  inputSchema: {
    type: 'object',
    properties: { ...tenantsProp, ...pageProps },
    required: ['tenants'],
    additionalProperties: false,
  },
};

export const devicesListLifecycleTool: Tool = {
  name: 'auvik_devices_list_lifecycle',
  description: 'GET /v1/inventory/device/lifecycle — list device end-of-life / end-of-support records for a tenant.',
  inputSchema: {
    type: 'object',
    properties: { ...tenantsProp, ...pageProps },
    required: ['tenants'],
    additionalProperties: false,
  },
};

export async function handleDevicesList(args: Record<string, unknown>) {
  try {
    const c = getCredentials();
    if (!c) return noCreds();
    return ok(await createAuvikClient(c).devices.list(args));
  } catch (e) {
    return fail(e);
  }
}

export async function handleDevicesGet(args: { deviceId: string }) {
  try {
    const c = getCredentials();
    if (!c) return noCreds();
    return ok(await createAuvikClient(c).devices.get(args.deviceId));
  } catch (e) {
    return fail(e);
  }
}

export async function handleDevicesGetDetails(args: { deviceId: string }) {
  try {
    const c = getCredentials();
    if (!c) return noCreds();
    return ok(await createAuvikClient(c).devices.getDetail(args.deviceId));
  } catch (e) {
    return fail(e);
  }
}

export async function handleDevicesListWarranty(args: Record<string, unknown>) {
  try {
    const c = getCredentials();
    if (!c) return noCreds();
    return ok(await createAuvikClient(c).devices.listWarranty(args));
  } catch (e) {
    return fail(e);
  }
}

export async function handleDevicesListLifecycle(args: Record<string, unknown>) {
  try {
    const c = getCredentials();
    if (!c) return noCreds();
    return ok(await createAuvikClient(c).devices.listLifecycle(args));
  } catch (e) {
    return fail(e);
  }
}
