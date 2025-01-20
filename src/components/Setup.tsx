import { Button } from "@/components/ui/button";
import fs from "@zenfs/core";
import { Loader2, LucideCheck } from "lucide-react";
import { useEffect, useState } from "react";

const Page1 = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  const [loading, setLoading] = useState(false);
  const startLoading = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNavigate("/install");
    }, 987);
  };

  const checkForExistingData = () => {
    try {
      fs.existsSync("/");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return false;
    }
    return true;
  };

  const cancelSetup = () => {
    localStorage.setItem("setuplock", "true");
    window.location.reload();
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="max-w-md text-center">
        This is a setup wizard for Linux React. It will help you set up your
        system and install the necessary dependencies.
      </p>
      {checkForExistingData() ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-center text-destructive">
            Existing data found! Contining with setup will erase all data.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={cancelSetup}>
              Exit Setup
            </Button>
            <Button onClick={startLoading} disabled={loading}>
              {loading && <Loader2 className="animate-spin" />} Continue Setup
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => checkForExistingData()}>Start Setup</Button>
      )}
    </div>
  );
};

const MainInstall = ({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) => {
  const [progress, setProgress] = useState([
    {
      id: 0,
      title: "Setting up Filesystem",
      completed: false,
      inProgress: true,
    },
    {
      id: 1,
      title: "Installing core packages",
      completed: false,
      inProgress: false,
    },
    {
      id: 2,
      title: "Setting up user",
      completed: false,
      inProgress: false,
    },
    {
      id: 3,
      title: "Finishing up",
      completed: false,
      inProgress: false,
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  const updateStep = (id: number, completed: boolean, inProgress: boolean) => {
    setProgress((prev) => {
      const newProgress = [...prev];
      newProgress[id] = { ...newProgress[id], completed, inProgress };
      return newProgress;
    });
  };

  const wait = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const clearDirectory = (path: string) => {
    const files = fs.readdirSync(path);
    for (const file of files) {
      const filePath = `${path}/${file}`;
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        clearDirectory(filePath);
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    }
  };

  const mainSetup = async () => {
    if (!fs) {
      setError("Filesystem not available");
      return;
    }

    try {
      updateStep(0, false, true);
      await wait(400);

      // Initialize filesystem
      if (!fs.existsSync("/")) {
        fs.mkdirSync("/");
      }

      // Verify root exists
      if (!fs.existsSync("/")) {
        throw new Error("Failed to create root directory");
      }

      // Clear root if it exists
      try {
        clearDirectory("/");
      } catch (err) {
        console.log("Clear directory error:", err);
        // Continue even if clear fails - might be empty
      }

      // Create and verify base directories
      fs.mkdirSync("/home");
      if (!fs.existsSync("/home")) {
        throw new Error("Failed to create /home directory");
      }

      fs.mkdirSync("/apps");
      if (!fs.existsSync("/apps")) {
        throw new Error("Failed to create /apps directory");
      }

      updateStep(0, true, false);
      updateStep(1, false, true);
      await wait(400);

      // Create and verify user file
      const userData = JSON.stringify({
        username: "user",
        created: new Date().toISOString()
      });
      fs.writeFileSync("/home/user.json", userData);

      if (!fs.existsSync("/home/user.json")) {
        throw new Error("Failed to create user.json");
      }

      // Verify file contents
      const readData = fs.readFileSync("/home/user.json", "utf-8");
      if (readData !== userData) {
        throw new Error("User data verification failed");
      }

      console.log("Filesystem verification:", {
        root: fs.existsSync("/"),
        home: fs.existsSync("/home"),
        apps: fs.existsSync("/apps"),
        userFile: fs.existsSync("/home/user.json"),
        rootContents: fs.readdirSync("/"),
        homeContents: fs.readdirSync("/home")
      });

      updateStep(1, true, false);
      updateStep(2, false, true);
      await wait(400);
      updateStep(2, true, false);
      updateStep(3, false, true);
      await wait(400);
      updateStep(3, true, false);
      await wait(200);

      localStorage.setItem("setuplock", "true");
      onNavigate("/finish");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Setup failed:", err);
      setError(errorMessage);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      mainSetup();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col justify-center gap-4 text-left p-2 bg-muted rounded-md">
        <p className="text-lg font-bold text-destructive">Setup Failed</p>
        <p className="text-sm text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()} variant="destructive">
          Retry Setup
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center gap-4 text-left p-2 bg-muted rounded-md">
      <p className="text-lg font-bold">Installing...</p>
      <div className="flex flex-col justify-center gap-4">
        {progress.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <p>
              {step.inProgress && <Loader2 className="w-4 h-4 animate-spin" />}
            </p>
            <p>{step.completed && <LucideCheck className="w-4 h-4" />}</p>
            <p>{step.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Finish = () => {
  const runFinish = () => {
    localStorage.setItem("setuplock", "true");
    window.location.href = "/";
    window.location.reload();
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-lg font-bold">Setup Complete!</p>
      <p>
        Your system is ready to use! You can now restart your system to use it.
      </p>
      <Button onClick={runFinish}>Restart</Button>
    </div>
  );
};

const Setup = () => {
  const [currentPath, setCurrentPath] = useState("/");

  const renderRoute = () => {
    switch (currentPath) {
      case "/":
        return <Page1 onNavigate={setCurrentPath} />;
      case "/install":
        return <MainInstall onNavigate={setCurrentPath} />;
      case "/finish":
        return <Finish />;
      default:
        return <Page1 onNavigate={setCurrentPath} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-12">
      <h1 className="text-2xl font-bold">Linux React Installer</h1>
      {renderRoute()}
    </div>
  );
};

export default Setup;
