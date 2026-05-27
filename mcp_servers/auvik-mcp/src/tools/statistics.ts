import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCredentials } from '../credentials.js';
import { createAuvikClient } from '../client-factory.js';
import { toMcpError } from '../errors.js';

const noCreds = () => ({ content: [{ type: 'text' as const, text: 'No Auvik credentials configured.' }], isError: true });
const ok = (r: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(r, null, 2) }] });
const fail = (e: unknown) => { const m = toMcpError(e); return { content: [{ type: 'text' as const, text: m.message }], isError: true }; };

const commonStatProps = {
  tenants: { type: 'string', description: 'Comma-separated tenant IDs (required).' },
  fromTime: { type: 'string', description: 'ISO 8601 UTC, e.g. 2026-05-26T00:00:00.000Z. Sent as filter[fromTime].' },
  thruTime: { type: 'string', description: 'ISO 8601 UTC. Sent as filter[thruTime].' },
  interval: { type: 'string', enum: ['minute', 'hour', 'day'], description: 'Sampling interval. Sent as filter[interval].' },
} as const;

export const statisticsDeviceTool: Tool = {
  name: 'auvik_statistics_device',
  description: 'GET /v1/stat/device/{statId} — device-level metrics. statId is a path enum (e.g. "cpuUtilization", "memoryUtilization", "availability"). Time range and filters go in filter[...].',
  inputSchema: {
    type: 'object',
    properties: {
      statId: { type: 'string', description: 'Device statistic ID from the Auvik DeviceStatisticsId enum (path segment), e.g. "cpuUtilization".' },
      deviceId: { type: 'string', description: 'Auvik device ID. Sent as filter[deviceId].' },
      ...commonStatProps,
    },
    required: ['statId', 'tenants', 'fromTime', 'thruTime', 'interval', 'deviceId'],
    additionalProperties: false,
  },
};

export const statisticsInterfaceTool: Tool = {
  name: 'auvik_statistics_interface',
  description: 'GET /v1/stat/interface/{statId} — interface-level metrics. statId is a path enum from InterfaceStatisticsId.',
  inputSchema: {
    type: 'object',
    properties: {
      statId: { type: 'string', description: 'Interface statistic ID (path), e.g. "transmittedTotal", "utilization".' },
      interfaceId: { type: 'string', description: 'Auvik interface ID. Sent as filter[interfaceId].' },
      ...commonStatProps,
    },
    required: ['statId', 'tenants', 'fromTime', 'thruTime', 'interval', 'interfaceId'],
    additionalProperties: false,
  },
};

export async function handleStatisticsDevice(args: {
  statId: string;
  tenants: string;
  fromTime: string;
  thruTime: string;
  interval: string;
  deviceId: string;
}) {
  try {
    const c = getCredentials();
    if (!c) return noCreds();
    const { statId, deviceId, fromTime, thruTime, interval, tenants } = args;
    return ok(
      await createAuvikClient(c).statistics.device(statId, {
        tenants,
        filter_fromTime: fromTime,
        filter_thruTime: thruTime,
        filter_interval: interval,
        filter_deviceId: deviceId,
      })
    );
  } catch (e) {
    return fail(e);
  }
}

export async function handleStatisticsInterface(args: {
  statId: string;
  tenants: string;
  fromTime: string;
  thruTime: string;
  interval: string;
  interfaceId: string;
}) {
  try {
    const c = getCredentials();
    if (!c) return noCreds();
    const { statId, interfaceId, fromTime, thruTime, interval, tenants } = args;
    return ok(
      await createAuvikClient(c).statistics.interface(statId, {
        tenants,
        filter_fromTime: fromTime,
        filter_thruTime: thruTime,
        filter_interval: interval,
        filter_interfaceId: interfaceId,
      })
    );
  } catch (e) {
    return fail(e);
  }
}
