import fs from "@zenfs/core";
import { useAppStore } from "@/stores/appstore";
import FileManager from "./FM";
import { useEffect } from "react";
import { useTheme } from "@/stores/themestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function TEMP__StyleEditor() {
  const { setTheme, theme } = useTheme();
  const apps = useAppStore((state) => state.apps);
  const launchApp = useAppStore((state) => state.launchApp);

  // Theme Management
  const getUserTheme = () => {
    const configPath = "/data/themes/theme.config";
    try {
      const theme = fs.readFileSync(configPath);
      return theme;
    } catch (err) {
      console.error(err);
      return "macos.css";
    }
  };

  const reloadTheme = () => {
    const theme = getUserTheme();
    try {
      const style = fs.readFileSync(`/data/themes/${theme}`);
      const stylerheader = document.getElementById("styler-styles");
      if (stylerheader) {
        stylerheader.innerHTML = style.toString();
      }
    } catch (err) {
      console.error(err);
    }
  };
  // Default Styles
  const downloadDefaultStyles = async () => {
    const files = [
      {
        in: "/styles/default.css",
        out: "/data/themes/default.css",
      },
      {
        in: "/styles/macos.css",
        out: "/data/themes/macos.css",
      },
      {
        in: "/styles/windows.css",
        out: "/data/themes/windows.css",
      },
    ];
    files.forEach(async (file) => {
      await fetch(file.in)
        .then((res) => res.text())
        .then((data) => {
          fs.writeFileSync(file.out, data);
        });
    });
  };

  useEffect(() => {
    reloadTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="absolute top-0 right-0 h-full w-96 p-4 flex flex-col gap-4 border-l bg-background">
      {apps.map((app, index) => (
        <Button
          variant="secondary"
          className="w-12 aspect-square p-0 text-2xl font-bold"
          key={index}
          onClick={() => launchApp(app.name)}
        >
          {app.name.charAt(0).toUpperCase()}
        </Button>
      ))}
      <FileManager />
      <Button variant="outline" onClick={reloadTheme}>
        Reload Styles
      </Button>
      <Button variant="outline" onClick={downloadDefaultStyles}>
        Download Styles
      </Button>
      <Select defaultValue={theme} onValueChange={setTheme}>
        <SelectTrigger>
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
