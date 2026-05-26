import type { BlumiraClientConfig } from './types/index.js';
import { HttpClient } from './http.js';
import { RateLimiter } from './rate-limiter.js';
import { HealthResource } from './resources/health.js';
import { FindingsResource } from './resources/findings.js';
import { AgentsResource } from './resources/agents.js';
import { UsersResource } from './resources/users.js';
import { ResolutionsResource } from './resources/resolutions.js';
import { MspResource } from './resources/msp.js';

export class BlumiraClient {
  readonly health: HealthResource;
  readonly findings: FindingsResource;
  readonly agents: AgentsResource;
  readonly users: UsersResource;
  readonly resolutions: ResolutionsResource;
  readonly msp: MspResource;

  constructor(config: BlumiraClientConfig) {
    const rateLimiter = new RateLimiter(config.rateLimitPerMinute ?? 60);
    const http = new HttpClient({
      baseUrl: config.baseUrl ?? 'https://api.blumira.com/public-api/v1',
      jwtToken: config.jwtToken,
      maxRetries: config.maxRetries ?? 3,
      rateLimiter,
    });

    this.health = new HealthResource(http);
    this.findings = new FindingsResource(http);
    this.agents = new AgentsResource(http);
    this.users = new UsersResource(http);
    this.resolutions = new ResolutionsResource(http);
    this.msp = new MspResource(http);
  }
}
