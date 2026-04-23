# Plugin Configuration Files

This directory contains plugin configuration files used in different environments.

## Configuration Files

### Main Config Files
- `default.config.json` - Default plugin configuration
- `storm-rock.config.json` - Storm Rock preset configuration
- `oodie.config.json` - Oodie preset configuration
- `schema.json` - JSON schema defining the configuration structure
- `ui-schema.json` - UI hints for rendering the config editor in the CRM

### Config File Structure

Each preset config file (e.g., `default.config.json`, `oodie.config.json`) **must** include a `meta` object at the root with the following fields:

```json
{
  "meta": {
    "id": "preset-id",
    "name": "Display Name",
    "description": "Description of this preset"
  },
  ...rest of config
}
```

**Field Descriptions:**
- `id` (required): Unique identifier for the preset (e.g., "default", "oodie", "storm-rock")
- `name` (required): Human-readable name displayed in the CRM marketplace (e.g., "Default", "Oodie", "Storm Rock")
- `description` (optional): Short description shown as tooltip/subtitle in the preset selector

**Why This Matters:**
The `meta.name` is used in the CRM plugin marketplace to display preset options to merchants. Without it, only the preset ID would be shown.

### Local Development Only

#### `resources.static.json`
**Purpose:** Mock static resources for local plugin development.

This file allows you to simulate static resources (like offer IDs, product IDs, etc.) that would normally be configured in the CRM's funnel editor. These resources are made available at `context.static` when using the `useFunnel()` hook.

**Example:**
```json
{
  "offer": {
    "id": "offer_568e2b33e982"
  },
  "product": {
    "id": "product_abc123"
  }
}
```

**Important Notes:**
- This file is **only loaded in local development** (localhost, *.localhost, ngrok, etc.)
- Values from the backend (CRM) always take precedence over local mock data
- This file should **NOT** be deployed to production
- Consider adding it to `.gitignore` if you have sensitive test data

**How it works:**
1. The SDK automatically loads `/config/resources.static.json` in development
2. Values are merged into `context.static` in the `useFunnel()` hook
3. Backend static resources override local values if both exist

**Use Case:**
When developing a plugin route like `/offerfromstatic` that requires static resources defined in the funnel manifest, you can use this file to provide test data without needing to configure it in the CRM.
