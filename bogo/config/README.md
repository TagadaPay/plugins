# Plugin Configuration Files

This directory contains plugin configuration files used in different environments.

## Configuration Files

### Main Config Files
- `default.config.json` - Default plugin configuration (UI/UX content, branding, styling)
- `schema.json` - JSON schema defining the configuration structure
- `ui-schema.json` - UI hints for rendering the config editor in the CRM

### Local Development Only

#### `resources.static.json`
**Purpose:** Mock static resources for local plugin development.

This file allows you to simulate static resources (like offer IDs, variant IDs, etc.) that would normally be configured in the CRM's funnel editor. These resources are made available at `context.static` when using the `useFunnel()` hook.

**For BOGO Checkout:**
```json
{
  "offer": {
    "id": "offer_ad2e64728dd8"
  },
  "bundle1": {
    "id": "variant_4dc634640bff"
  },
  "bundle2": {
    "id": "variant_02e3520f9c78"
  },
  "bundle3": {
    "id": "variant_ae4642c60ede"
  }
}
```

**How Merchants Configure Bundles:**
1. **In CRM Funnel Editor**: Configure `bundle1`, `bundle2`, `bundle3` static resources per step/variant
2. **Fallback**: If not configured, plugin auto-detects variants from checkout session line items
3. **Local Dev**: Use this file to test with specific variants without CRM configuration

**Important Notes:**
- This file is **only loaded in local development** (localhost, *.localhost, ngrok, etc.)
- Values from the backend (CRM) always take precedence over local mock data
- This file should **NOT** be deployed to production
- Static resources are **optional** - plugin gracefully handles missing resources

**How it works:**
1. The SDK automatically loads `/config/resources.static.json` in development
2. Values are merged into `context.static` in the `useFunnel()` hook
3. Backend static resources override local values if both exist
4. Code checks `context.static.bundle1?.id` to get configured variant

**Use Case:**
When developing the BOGO checkout locally, you can specify which 3 product variants should be shown as bundle options without needing to configure them in the CRM funnel editor.

