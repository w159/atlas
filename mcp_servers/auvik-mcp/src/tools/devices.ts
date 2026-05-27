import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCredentials } from '../credentials.js';
import { createAuvikClient } from '../client-factory.js';
import { toMcpError } from '../errors.js';
import { DevicesListSchema, DeviceGetSchema, DeviceDetailsSchema, DeviceWarrantySchema, DeviceLifecycleSchema } from '../schemas/devices.js';

export const devicesListTool: Tool = {
  name: 'auvik_devices_list',
  description: 'List Auvik-managed network devices; filter by type, vendor, online status, or modification date. Returns device IDs needed for other device tools.',
  inputSchema: {
    type: 'object',
    properties: {
      page: { type: 'number', description: 'Page number for pagination (default: 1).' },
      pageSize: { type: 'number', description: 'Page size — items per page (integer 1-1000).' },
      tenants: { type: 'string', description: 'Comma-separated Auvik tenant IDs to scope the query.' },
      filter_deviceType: { type: 'string', description: 'Filter by Auvik device type string, e.g. "switch", "router", "firewall".' },
      filter_modifiedAfter: { type: 'string', description: 'ISO 8601 datetime — return only devices modified after this time, e.g. 2024-01-01T00:00:00Z.' },
      filter_vendorName: { type: 'string', description: 'Filter by hardware vendor name, e.g. "Cisco", "HP".' },
      filter_onlineStatus: {
        type: 'string',
        enum: ['online', 'offline', 'unreachable', 'testing', 'unknown', 'dormant', 'notPresent', 'lowerLayerDown'],
        description: 'Filter by current device online status.'
      },
    },
    additionalProperties: false,
  },
};

export const devicesGetTool: Tool = {
  name: 'auvik_devices_get',
  description: 'Get basic info (name, type, vendor, status) for a single Auvik device by deviceId (required).',
  inputSchema: {
    type: 'object',
    properties: {
      deviceId: { type: 'string', description: 'The Auvik device ID' },
      tenants: { type: 'string', description: 'Comma-separated tenant IDs (optional)' },
    },
    required: ['deviceId'],
    additionalProperties: false,
  },
};

export const devicesGetDetailsTool: Tool = {
  name: 'auvik_devices_get_details',
  description: 'Get extended detail (IP, MAC, location, management settings) for an Auvik device by deviceId (required). Use when basic info is insufficient.',
  inputSchema: {
    type: 'object',
    properties: {
      deviceId: { type: 'string', description: 'The Auvik device ID' },
      tenants: { type: 'string', description: 'Comma-separated tenant IDs (optional)' },
    },
    required: ['deviceId'],
    additionalProperties: false,
  },
};

export const devicesGetWarrantyTool: Tool = {
  name: 'auvik_devices_get_warranty',
  description: 'Get warranty expiry and support contract details for an Auvik device by deviceId (required). Use for lifecycle planning.',
  inputSchema: {
    type: 'object',
    properties: {
      deviceId: { type: 'string', description: 'The Auvik device ID' },
      tenants: { type: 'string', description: 'Comma-separated tenant IDs (optional)' },
    },
    required: ['deviceId'],
    additionalProperties: false,
  },
};

export const devicesGetLifecycleTool: Tool = {
  name: 'auvik_devices_get_lifecycle',
  description: 'Get end-of-life and end-of-support dates for an Auvik device by deviceId (required). Use when assessing hardware refresh needs.',
  inputSchema: {
    type: 'object',
    properties: {
      deviceId: { type: 'string', description: 'The Auvik device ID' },
      tenants: { type: 'string', description: 'Comma-separated tenant IDs (optional)' },
    },
    required: ['deviceId'],
    additionalProperties: false,
  },
};

export async function handleDevicesList(args: any = {}): Promise<any> {
  try {
    const parsedArgs = DevicesListSchema.parse(args);
    const credentials = getCredentials();
    if (!credentials) {
      return {
        content: [{ type: 'text' as const, text: 'No Auvik credentials configured' }],
        isError: true,
      };
    }

    const client = createAuvikClient(credentials);
    const response = await client.devices.list(parsedArgs);

    if (!response.data || response.data.length === 0) {
      return {
        content: [{ type: 'text' as const, text: 'No Auvik devices found for specified criteria' }],
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

export async function handleDevicesGet(args: { deviceId: string; tenants?: string }): Promise<any> {
  try {
    const parsedArgs = DeviceGetSchema.parse(args);
    const credentials = getCredentials();
    if (!credentials) {
      return {
        content: [{ type: 'text' as const, text: 'No Auvik credentials configured' }],
        isError: true,
      };
    }

    const client = createAuvikClient(credentials);
    const response = await client.devices.get(parsedArgs.deviceId);

    if (!response.data) {
      return {
        content: [{ type: 'text' as const, text: `No Auvik device found with ID: ${parsedArgs.deviceId}` }],
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

export async function handleDevicesGetDetails(args: { deviceId: string; tenants?: string }): Promise<any> {
  try {
    const parsedArgs = DeviceDetailsSchema.parse(args);
    const credentials = getCredentials();
    if (!credentials) {
      return {
        content: [{ type: 'text' as const, text: 'No Auvik credentials configured' }],
        isError: true,
      };
    }

    const client = createAuvikClient(credentials);
    const response = await client.devices.getDetails(parsedArgs.deviceId);

    if (!response.data) {
      return {
        content: [{ type: 'text' as const, text: `No Auvik device details found with ID: ${parsedArgs.deviceId}` }],
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

export async function handleDevicesGetWarranty(args: { deviceId: string; tenants?: string }): Promise<any> {
  try {
    const parsedArgs = DeviceWarrantySchema.parse(args);
    const credentials = getCredentials();
    if (!credentials) {
      return {
        content: [{ type: 'text' as const, text: 'No Auvik credentials configured' }],
        isError: true,
      };
    }

    const client = createAuvikClient(credentials);
    const response = await client.devices.getWarranty(parsedArgs.deviceId);

    if (!response.data) {
      return {
        content: [{ type: 'text' as const, text: `No Auvik device warranty found with ID: ${parsedArgs.deviceId}` }],
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

export async function handleDevicesGetLifecycle(args: { deviceId: string; tenants?: string }): Promise<any> {
  try {
    const parsedArgs = DeviceLifecycleSchema.parse(args);
    const credentials = getCredentials();
    if (!credentials) {
      return {
        content: [{ type: 'text' as const, text: 'No Auvik credentials configured' }],
        isError: true,
      };
    }

    const client = createAuvikClient(credentials);
    const response = await client.devices.getLifecycle(parsedArgs.deviceId);

    if (!response.data) {
      return {
        content: [{ type: 'text' as const, text: `No Auvik device lifecycle found with ID: ${parsedArgs.deviceId}` }],
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