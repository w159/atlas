import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCredentials } from '../credentials.js';
import { createAuvikClient } from '../client-factory.js';
import { toMcpError } from '../errors.js';

export const statisticsDeviceTool: Tool = {
  name: 'auvik_statistics_device',
  description: 'Get CPU/memory/availability statistics for specific Auvik devices (filter_devices required) over a time range (fromTime and thruTime required).',
  inputSchema: {
    type: 'object',
    properties: {
      fromTime: { type: 'string', description: 'ISO 8601 start time for the statistics window, e.g. 2024-01-01T00:00:00Z.' },
      thruTime: { type: 'string', description: 'ISO 8601 end time for the statistics window.' },
      filter_devices: { type: 'string', description: 'Comma-separated Auvik device IDs to scope statistics to.' },
      tenants: { type: 'string', description: 'Comma-separated tenant IDs (optional)' },
    },
    required: ['fromTime', 'thruTime', 'filter_devices'],
    additionalProperties: false,
  },
};

export const statisticsInterfaceTool: Tool = {
  name: 'auvik_statistics_interface',
  description: 'Get bandwidth/utilization statistics for specific Auvik interfaces (filter_interfaces required) over a time range (fromTime and thruTime required).',
  inputSchema: {
    type: 'object',
    properties: {
      fromTime: { type: 'string', description: 'ISO 8601 start time for the statistics window, e.g. 2024-01-01T00:00:00Z.' },
      thruTime: { type: 'string', description: 'ISO 8601 end time for the statistics window.' },
      filter_interfaces: { type: 'string', description: 'Comma-separated Auvik interface IDs to scope statistics to.' },
      tenants: { type: 'string', description: 'Comma-separated tenant IDs (optional)' },
    },
    required: ['fromTime', 'thruTime', 'filter_interfaces'],
    additionalProperties: false,
  },
};

export const statisticsServiceTool: Tool = {
  name: 'auvik_statistics_service',
  description: 'Get availability and response-time statistics for specific Auvik services (filter_services required) over a time range (fromTime and thruTime required).',
  inputSchema: {
    type: 'object',
    properties: {
      fromTime: { type: 'string', description: 'ISO 8601 start time for the statistics window, e.g. 2024-01-01T00:00:00Z.' },
      thruTime: { type: 'string', description: 'ISO 8601 end time for the statistics window.' },
      filter_services: { type: 'string', description: 'Comma-separated Auvik service IDs to scope statistics to.' },
      tenants: { type: 'string', description: 'Comma-separated tenant IDs (optional)' },
    },
    required: ['fromTime', 'thruTime', 'filter_services'],
    additionalProperties: false,
  },
};

export const statisticsSnmpPollerTool: Tool = {
  name: 'auvik_statistics_snmp_poller',
  description: 'Get custom SNMP OID poll data for specific Auvik SNMP pollers (filter_pollers required) over a time range (fromTime and thruTime required).',
  inputSchema: {
    type: 'object',
    properties: {
      fromTime: { type: 'string', description: 'ISO 8601 start time for the statistics window, e.g. 2024-01-01T00:00:00Z.' },
      thruTime: { type: 'string', description: 'ISO 8601 end time for the statistics window.' },
      filter_pollers: { type: 'string', description: 'Comma-separated Auvik SNMP poller IDs to scope statistics to.' },
      tenants: { type: 'string', description: 'Comma-separated tenant IDs (optional)' },
    },
    required: ['fromTime', 'thruTime', 'filter_pollers'],
    additionalProperties: false,
  },
};

export async function handleStatisticsDevice(args: any): Promise<any> {
  try {
    const credentials = getCredentials();
    if (!credentials) {
      return {
        content: [{ type: 'text' as const, text: 'No Auvik credentials configured' }],
        isError: true,
      };
    }

    const client = createAuvikClient(credentials);
    const response = await client.statistics.device(args);

    if (!response.data || response.data.length === 0) {
      return {
        content: [{ type: 'text' as const, text: 'No Auvik device statistics found for specified criteria' }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(response, null, 2),
      }],
    };
  } catch (error) {
    const mcpError = toMcpError(error);
    return {
      content: [{ type: 'text' as const, text: mcpError.message }],
      isError: true,
    };
  }
}

export async function handleStatisticsInterface(args: any): Promise<any> {
  try {
    const credentials = getCredentials();
    if (!credentials) {
      return {
        content: [{ type: 'text' as const, text: 'No Auvik credentials configured' }],
        isError: true,
      };
    }

    const client = createAuvikClient(credentials);
    const response = await client.statistics.interface(args);

    if (!response.data || response.data.length === 0) {
      return {
        content: [{ type: 'text' as const, text: 'No Auvik interface statistics found for specified criteria' }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(response, null, 2),
      }],
    };
  } catch (error) {
    const mcpError = toMcpError(error);
    return {
      content: [{ type: 'text' as const, text: mcpError.message }],
      isError: true,
    };
  }
}

export async function handleStatisticsService(args: any): Promise<any> {
  try {
    const credentials = getCredentials();
    if (!credentials) {
      return {
        content: [{ type: 'text' as const, text: 'No Auvik credentials configured' }],
        isError: true,
      };
    }

    const client = createAuvikClient(credentials);
    const response = await client.statistics.service(args);

    if (!response.data || response.data.length === 0) {
      return {
        content: [{ type: 'text' as const, text: 'No Auvik service statistics found for specified criteria' }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(response, null, 2),
      }],
    };
  } catch (error) {
    const mcpError = toMcpError(error);
    return {
      content: [{ type: 'text' as const, text: mcpError.message }],
      isError: true,
    };
  }
}

export async function handleStatisticsSnmpPoller(args: any): Promise<any> {
  try {
    const credentials = getCredentials();
    if (!credentials) {
      return {
        content: [{ type: 'text' as const, text: 'No Auvik credentials configured' }],
        isError: true,
      };
    }

    const client = createAuvikClient(credentials);
    const response = await client.statistics.snmpPoller(args);

    if (!response.data || response.data.length === 0) {
      return {
        content: [{ type: 'text' as const, text: 'No Auvik SNMP poller statistics found for specified criteria' }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(response, null, 2),
      }],
    };
  } catch (error) {
    const mcpError = toMcpError(error);
    return {
      content: [{ type: 'text' as const, text: mcpError.message }],
      isError: true,
    };
  }
}