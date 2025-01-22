import fs from "@zenfs/core";

const validateFileStructure = () => {
  try {
    const requiredDirs = ["/system", "/apps", "/home"];
    let validatedDirs = [];
    
    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        return false;
      }
      validatedDirs.push(dir);
    }

    if (validatedDirs.length === requiredDirs.length) {
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
};

const checkForDeviceCorruption = () => {
  if (!validateFileStructure()) {
    return true;
  }
  return false;
};

export { checkForDeviceCorruption, validateFileStructure };
