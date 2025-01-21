import axios from 'axios';

export interface SystemDirectory {
  path: string;
  required: boolean;
}

export interface SystemFile {
  path: string;
  content: string;
  required: boolean;
}

export interface AppConfig {
  id: string;
  name: string;
  description: string;
  default: boolean;
  required?: boolean;
  size?: string;
  dependencies?: string[];
  files?: SystemFile[];
  directories?: SystemDirectory[];
  installOrder?: number;
}

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  order: number;
  required: boolean;
}

export interface PageContent {
  id: string;
  type: 'welcome' | 'options' | 'install' | 'finish';
  title: string;
  description: string;
  showExistingDataWarning?: boolean;
  showConfigLoader?: boolean;
  actions: {
    primary?: {
      text: string;
      action: 'next' | 'install' | 'finish' | 'restart';
    };
    secondary?: {
      text: string;
      action: 'back' | 'exit';
    };
  };
}

export interface SetupConfig {
  version: string;
  branding: {
    title: string;
    welcomeMessage: string;
    logo?: string;
  };
  steps: SetupStep[];
  pages: PageContent[];
  systemRequirements: {
    storage: string;
    memory: string;
    driveSize: number; // Size in GB
    requiredFeatures?: string[];
  };
  filesystem: {
    directories: SystemDirectory[];
    files: SystemFile[];
  };
  recommendedApps: AppConfig[];
  errorMessages: {
    fsError: string;
    networkError: string;
    installError: string;
    generalError: string;
  };
  installationSteps: {
    id: string;
    title: string;
    description: string;
    order: number;
    timeout: number;
  }[];
}

export type ConfigSource = {
  type: 'remote';
  url: string;
} | {
  type: 'local';
  path: string;
} | {
  type: 'default';
};

const DEFAULT_CONFIG: SetupConfig = {
  version: "1.0.0",
  branding: {
    title: "Linux React Installer",
    welcomeMessage: "Welcome to Linux React! This wizard will guide you through the installation process.",
  },
  steps: [
    {
      id: "welcome",
      title: "Welcome",
      description: "Start the installation process",
      order: 1,
      required: true
    },
    {
      id: "options",
      title: "Choose Apps",
      description: "Select additional applications",
      order: 2,
      required: true
    },
    {
      id: "installing",
      title: "Installing",
      description: "Installing system components",
      order: 3,
      required: true
    },
    {
      id: "finish",
      title: "Complete",
      description: "Finish installation",
      order: 4,
      required: true
    }
  ],
  pages: [
    {
      id: "welcome",
      type: "welcome",
      title: "Welcome",
      description: "Start the installation process",
      actions: {
        primary: {
          text: "Next",
          action: "next"
        }
      }
    },
    {
      id: "options",
      type: "options",
      title: "Choose Apps",
      description: "Select additional applications",
      actions: {
        primary: {
          text: "Next",
          action: "next"
        }
      }
    },
    {
      id: "installing",
      type: "install",
      title: "Installing",
      description: "Installing system components",
      actions: {
        primary: {
          text: "Install",
          action: "install"
        }
      }
    },
    {
      id: "finish",
      type: "finish",
      title: "Complete",
      description: "Finish installation",
      actions: {
        primary: {
          text: "Finish",
          action: "finish"
        }
      }
    }
  ],
  systemRequirements: {
    storage: "50MB",
    memory: "128MB",
    driveSize: 0,
    requiredFeatures: ["localStorage", "indexedDB"]
  },
  filesystem: {
    directories: [
      { path: "/", required: true },
      { path: "/home", required: true },
      { path: "/apps", required: true },
      { path: "/system", required: true }
    ],
    files: [
      {
        path: "/system/version",
        content: "1.0.0",
        required: true
      }
    ]
  },
  recommendedApps: [
    {
      id: "calculator",
      name: "Calculator",
      description: "Basic calculator app",
      default: true,
      size: "1.2MB",
      installOrder: 1,
      directories: [
        { path: "/apps/calculator", required: true }
      ]
    },
    {
      id: "terminal",
      name: "Terminal",
      description: "Command line interface",
      default: false,
      required: true,
      size: "2.1MB",
      installOrder: 0,
      dependencies: ["system-utils"]
    }
  ],
  errorMessages: {
    fsError: "Failed to initialize filesystem",
    networkError: "Unable to download required components",
    installError: "Installation failed",
    generalError: "An unexpected error occurred"
  },
  installationSteps: [
    {
      id: "fs-init",
      title: "Setting up Filesystem",
      description: "Initializing system directories",
      order: 1,
      timeout: 1000
    },
    {
      id: "core-install",
      title: "Installing Core Components",
      description: "Setting up essential system files",
      order: 2,
      timeout: 2000
    },
    {
      id: "app-install",
      title: "Installing Applications",
      description: "Installing selected applications",
      order: 3,
      timeout: 1500
    },
    {
      id: "user-setup",
      title: "Configuring User Settings",
      description: "Setting up user preferences",
      order: 4,
      timeout: 1000
    }
  ]
};

// Default remote config URL
const REMOTE_CONFIG_URL = 'https://cdn.jsdelivr.net/gh/spaceofnova/linux-react-data-store@master/setup-config.json';

export async function loadLocalConfig(path: string): Promise<SetupConfig> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load local config: ${response.statusText}`);
    }
    const data = await response.json();
    return validateConfig(data);
  } catch (error) {
    console.warn('Failed to load local config:', error);
    throw error;
  }
}

function validateConfig(config: unknown): SetupConfig {
  if (!config || typeof config !== 'object') {
    throw new Error('Invalid configuration data received');
  }

  const typedConfig = config as Partial<SetupConfig>;

  // Validate essential properties
  if (!typedConfig.branding?.title || !typedConfig.steps?.length) {
    console.warn('Missing required properties in config:', config);
    throw new Error('Configuration is missing required properties');
  }

  // Validate steps structure
  if (!typedConfig.steps.every((step): step is SetupStep => 
    step && 
    typeof step.id === 'string' && 
    typeof step.title === 'string' && 
    typeof step.order === 'number'
  )) {
    console.warn('Invalid steps structure in config:', typedConfig.steps);
    throw new Error('Configuration has invalid steps structure');
  }

  return config as SetupConfig;
}

export async function fetchSetupConfig(source: ConfigSource = { type: 'remote', url: REMOTE_CONFIG_URL }): Promise<SetupConfig> {
  try {
    let config: SetupConfig;

    switch (source.type) {
      case 'remote': {
        const url = source.url || REMOTE_CONFIG_URL;
        const timestamp = Date.now();
        const response = await axios.get<SetupConfig>(`${url}?t=${timestamp}`);
        config = validateConfig(response.data);
        break;
      }
      
      case 'local': {
        config = await loadLocalConfig(source.path);
        break;
      }

      case 'default': {
        config = validateConfig(DEFAULT_CONFIG);
        break;
      }
    }

    return config;

  } catch (error) {
    console.warn('Failed to fetch setup config, using default:', error);
    return validateConfig(DEFAULT_CONFIG);
  }
} 