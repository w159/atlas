import type { AuvikClientConfig, AuvikRegion } from './types/index.js';
import { HttpClient } from './http.js';
import { resolveRegion } from './region.js';
import { CredentialsResource } from './resources/credentials.js';
import { TenantsResource } from './resources/tenants.js';
import { InventoryDeviceResource } from './resources/inventory-device.js';
import { InventoryNetworkResource } from './resources/inventory-network.js';
import { InventoryInterfaceResource } from './resources/inventory-interface.js';
import { InventoryConfigurationResource } from './resources/inventory-configuration.js';
import { InventoryEntityResource } from './resources/inventory-entity.js';
import { InventoryComponentResource } from './resources/inventory-component.js';
import { AlertsResource } from './resources/alerts.js';
import { StatisticsResource } from './resources/statistics.js';
import { BillingResource } from './resources/billing.js';

export class AuvikClient {
  readonly credentials: CredentialsResource;
  readonly tenants: TenantsResource;
  readonly inventoryDevice: InventoryDeviceResource;
  readonly inventoryNetwork: InventoryNetworkResource;
  readonly inventoryInterface: InventoryInterfaceResource;
  readonly inventoryConfiguration: InventoryConfigurationResource;
  readonly inventoryEntity: InventoryEntityResource;
  readonly inventoryComponent: InventoryComponentResource;
  readonly alerts: AlertsResource;
  readonly statistics: StatisticsResource;
  readonly billing: BillingResource;

  private httpClient: HttpClient | null = null;
  private readonly config: AuvikClientConfig;

  constructor(config: AuvikClientConfig) {
    this.config = {
      timeout: 30_000,
      maxRetries: 3,
      fetchImpl: globalThis.fetch,
      ...config,
    };

    // Create a lazy HTTP client getter that resources can use
    const getClient = async () => this.getHttpClient();

    // Initialize resources with the lazy client getter
    this.credentials = new CredentialsResource(getClient);
    this.tenants = new TenantsResource(getClient);
    this.inventoryDevice = new InventoryDeviceResource(getClient);
    this.inventoryNetwork = new InventoryNetworkResource(getClient);
    this.inventoryInterface = new InventoryInterfaceResource(getClient);
    this.inventoryConfiguration = new InventoryConfigurationResource(getClient);
    this.inventoryEntity = new InventoryEntityResource(getClient);
    this.inventoryComponent = new InventoryComponentResource(getClient);
    this.alerts = new AlertsResource(getClient);
    this.statistics = new StatisticsResource(getClient);
    this.billing = new BillingResource(getClient);
  }

  private async getHttpClient(): Promise<HttpClient> {
    if (this.httpClient) {
      return this.httpClient;
    }

    let baseUrl = this.config.baseUrl;

    if (!baseUrl) {
      let region: AuvikRegion;

      if (this.config.region) {
        region = this.config.region;
      } else {
        region = await resolveRegion(
          this.config.username,
          this.config.apiKey,
          this.config.fetchImpl
        );
      }

      baseUrl = `https://auvikapi.${region}.my.auvik.com/v1`;
    }

    this.httpClient = new HttpClient({
      baseUrl,
      username: this.config.username,
      apiKey: this.config.apiKey,
      timeout: this.config.timeout!,
      maxRetries: this.config.maxRetries!,
      fetchImpl: this.config.fetchImpl!,
    });

    return this.httpClient;
  }
}