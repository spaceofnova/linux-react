import { useAppStore } from "@/stores/appstore";
import { useTheme } from "@/stores/themestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import StorageUsage from "@/components/StorageUsage";
import { LocalAppInstall } from "@/components/AddApp";

export default function TEMP__StyleEditor() {
  const { setTheme, theme } = useTheme();
  const apps = useAppStore.getState().getApps();
  const removeApp = useAppStore.getState().removeLocalApp;

  return (
    <div className="absolute top-0 right-0 h-full w-48 p-4 flex flex-col gap-4 border-l-2 bg-background">
      {apps.map((app, index) => (
        <Button
          variant="secondary"
          key={index}
          onClick={() => removeApp(app.id)}
        >
          {app.name} - {app.version}
        </Button>
      ))}
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
      <StorageUsage />
      <LocalAppInstall />
    </div>
  );
}
