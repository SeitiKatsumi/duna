declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    ADMIN_EMAIL?: string;
    CRM_WEBHOOK_URL?: string;
    CRM_WEBHOOK_TOKEN?: string;
    DUNA_AGENT_URL?: string;
  }
}
