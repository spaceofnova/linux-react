import { Button } from "@/components/ui/button";
import fs from "@zenfs/core";
import { Loader2, LucideCheck } from "lucide-react";
import { useEffect, useState } from "react";
//@ts-expect-error This resolves to a file just fine.
const defualtWallpaper = await import("../assets/images/wallpaper.jpg");

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

  const mainSetup = async () => {
    if (!fs) return;
    updateStep(0, false, true);
    if (!fs.existsSync("/")) {
      fs.readdirSync("/").forEach((file) => {
        if (file.includes(".")) {
          fs.unlinkSync(`/${file}`);
        } else {
          fs.rmdirSync(`/${file}`);
        }
      });
    }
    const dirs = ["/home", "/apps"];
    dirs.forEach((dir) => {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
      } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error);
      }
    });
    await wait(400);
    updateStep(0, true, false);
    updateStep(1, false, true);
    fs.writeFileSync("/home/wallpaper.jpg", defualtWallpaper);
    fs.writeFileSync("/home/user.json", JSON.stringify({}));
    updateStep(1, true, false);
    await wait(400);
    updateStep(2, false, true);
    await wait(400);
    updateStep(2, true, false);
    await wait(400);
    updateStep(3, false, true);
    await wait(400);
    updateStep(3, true, false);
    await wait(200);
    localStorage.setItem("setuplock", "true");
    onNavigate("/finish");
  };

  useEffect(() => {
    setTimeout(() => {
      mainSetup();
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
