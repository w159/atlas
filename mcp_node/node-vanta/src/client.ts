import type { VantaClientConfig } from './types/common.js';
import { HttpClient } from './http.js';
import { RateLimiter } from './rate-limiter.js';
import { VantaAuthManager } from './auth.js';
import { FrameworksResource } from './resources/frameworks.js';
import { ControlsResource } from './resources/controls.js';
import { TestsResource } from './resources/tests.js';
import { DocumentsResource } from './resources/documents.js';
import { IntegrationsResource } from './resources/integrations.js';
import { PeopleResource } from './resources/people.js';
import { VendorsResource } from './resources/vendors.js';
import { RiskScenariosResource } from './resources/risk-scenarios.js';
import { VulnerabilitiesResource } from './resources/vulnerabilities.js';
import { PoliciesResource } from './resources/policies.js';
import { MonitoredComputersResource } from './resources/monitored-computers.js';

const DEFAULT_BASE_URL = 'https://api.vanta.com/v1';
const DEFAULT_TOKEN_URL = 'https://api.vanta.com/oauth/token';
const DEFAULT_SCOPE = 'vanta-api.all:read';

export class VantaClient {
  readonly frameworks: FrameworksResource;
  readonly controls: ControlsResource;
  readonly tests: TestsResource;
  readonly documents: DocumentsResource;
  readonly integrations: IntegrationsResource;
  readonly people: PeopleResource;
  readonly vendors: VendorsResource;
  readonly riskScenarios: RiskScenariosResource;
  readonly vulnerabilities: VulnerabilitiesResource;
  readonly policies: PoliciesResource;
  readonly monitoredComputers: MonitoredComputersResource;

  readonly auth: VantaAuthManager;

  constructor(config: VantaClientConfig) {
    const tokenUrl = config.tokenUrl ?? DEFAULT_TOKEN_URL;
    const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    const scope = config.scope ?? DEFAULT_SCOPE;

    this.auth = new VantaAuthManager({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      tokenUrl,
      scope,
    });

    const rateLimiter = new RateLimiter(config.rateLimitPerSecond ?? 10);
    const http = new HttpClient({
      baseUrl,
      auth: this.auth,
      maxRetries: config.maxRetries ?? 3,
      rateLimiter,
    });

    this.frameworks = new FrameworksResource(http);
    this.controls = new ControlsResource(http);
    this.tests = new TestsResource(http);
    this.documents = new DocumentsResource(http);
    this.integrations = new IntegrationsResource(http);
    this.people = new PeopleResource(http);
    this.vendors = new VendorsResource(http);
    this.riskScenarios = new RiskScenariosResource(http);
    this.vulnerabilities = new VulnerabilitiesResource(http);
    this.policies = new PoliciesResource(http);
    this.monitoredComputers = new MonitoredComputersResource(http);
  }
}
