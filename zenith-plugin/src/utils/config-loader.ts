import { AppConfig, AppConfigSchema } from '@/src/configuration/schema';

// Import all available configs
import defaultConfigData from '@/config/default.tgd.json';

export type ConfigName = 'default';

/**
 * Loads the appropriate configuration based on the environment variable
 * @param configName - The name of the config to load
 * @returns The loaded configuration
 */
export const loadConfig = (configName: string): AppConfig => {
  console.log(`Loading config: ${configName}`);
  
  // Map config names to their data
  const configMap: Record<ConfigName, any> = {
    default: defaultConfigData,
  };
  
  // Get the config data
  const configData = configMap[configName as ConfigName];
  
  if (!configData) {
    console.warn(`Config '${configName}' not found, falling back to 'default'`);
    return loadConfig('default');
  }
  
  // Handle both array and object formats
  const config = Array.isArray(configData) ? configData[0] : configData;
  
  // Validate the configuration using Zod schema
  try {
    const validatedConfig = AppConfigSchema.parse(config);
    console.log('✅ Configuration validated successfully');
    return validatedConfig;
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    throw new Error(`Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};


export const getCurrentConfigName = (): string => {
  return import.meta.env.VITE_CONFIG_NAME || 'default';
};
