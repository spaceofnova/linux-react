import type { NextApiRequest, NextApiResponse } from 'next';
import type { SetupConfig } from '@/lib/setup-config';

// This could be loaded from a database or external configuration service
const SETUP_CONFIG: SetupConfig = {
  version: "1.0.0",
  welcomeMessage: "Welcome to Linux React! This wizard will guide you through the installation process.",
  steps: {
    welcome: "Welcome",
    options: "Choose Apps",
    installing: "Installing",
    finish: "Complete"
  },
  recommendedApps: [
    {
      id: "calculator",
      name: "Calculator",
      description: "Basic calculator app",
      default: true,
      size: "1.2MB"
    },
    {
      id: "notepad",
      name: "Notepad",
      description: "Simple text editor",
      default: true,
      size: "0.8MB"
    },
    // Add more apps as needed
  ],
  systemRequirements: {
    storage: "50MB",
    memory: "128MB"
  }
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SetupConfig>
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  res.status(200).json(SETUP_CONFIG);
} 