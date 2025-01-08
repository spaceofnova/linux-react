import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import { usePrefrencesStore } from "@/stores/prefrencesStore";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { settingsConfig } from "@/lib/constants";
import {
  PrefrenceSection,
  PrefrencePath,
  SettingConfig,
} from "@/types/settings";
import { useWindowStore } from "@/stores/windowStore";
import { Button } from "@/components/ui/button";

type SettingValue = boolean | string | number;
type PrefrenceRecord = Record<string, SettingValue | undefined>;

const SettingsApp = ({
  id,
  deepLink,
}: {
  id: string;
  deepLink: PrefrenceSection;
}) => {
  const [currentPage, setCurrentPage] = useState<PrefrenceSection>(
    deepLink || "display"
  );
  const updateCurrentPage = (page: PrefrenceSection) => {
    useWindowStore.getState().updateWindow(id, {
      deepLink: undefined,
    });
    setCurrentPage(page);
  };

  const { prefrences, updatePrefrence } = usePrefrencesStore();

  // This makes sure if the window is already open it listens to the deepLink updating
  useEffect(() => {
    if (deepLink) {
      setCurrentPage(deepLink);
    }
  }, [deepLink]);

  // Generate setting component based on type
  const renderSetting = (
    section: PrefrenceSection,
    setting: SettingConfig,
    index: number
  ) => {
    const path = setting.prefrence
      ? (`${section}.${setting.prefrence}` as PrefrencePath)
      : undefined;
    const sectionValues = prefrences[section] as PrefrenceRecord;
    const value = path ? sectionValues?.[setting.prefrence!] : undefined;

    switch (setting.type) {
      case "boolean":
        return (
          <div
            className="flex items-center justify-between"
            key={`${section}-${index}`}
          >
            <label htmlFor={path} className="text-sm font-medium">
              {setting.label}
            </label>
            <Switch
              id={path}
              checked={Boolean(value)}
              onCheckedChange={(checked) =>
                path && updatePrefrence(path, checked)
              }
            />
          </div>
        );
      case "string":
        return (
          <div className="flex flex-col gap-2" key={`${section}-${index}`}>
            <label htmlFor={path} className="text-sm font-medium">
              {setting.label}
            </label>
            <Input
              id={path}
              value={String(value || "")}
              onChange={(e) => path && updatePrefrence(path, e.target.value)}
            />
          </div>
        );
      case "number":
        return (
          <div className="flex flex-col gap-2" key={`${section}-${index}`}>
            <label htmlFor={path} className="text-sm font-medium">
              {setting.label}
            </label>
            <Input
              id={path}
              type="number"
              min={setting.min}
              max={setting.max}
              step={setting.step}
              value={Number(value || setting.min || 0)}
              onChange={(e) =>
                path && updatePrefrence(path, String(e.target.value))
              }
            />
          </div>
        );
      case "select":
        return (
          <div className="flex flex-col gap-2" key={`${section}-${index}`}>
            <label htmlFor={path} className="text-sm font-medium">
              {setting.label}
            </label>
            <Select
              value={String(value || setting.options[0])}
              onValueChange={(value) => path && updatePrefrence(path, value)}
            >
              <SelectTrigger id={path}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {setting.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "button":
        return (
          <div
            className="flex items-center justify-between"
            key={`${section}-${index}`}
          >
            <span className="text-sm font-medium">{setting.label}</span>
            <Button onClick={setting.onClick} variant="outline" size="sm">
              {setting.label}
            </Button>
          </div>
        );
    }
  };

  // Generate pages based on config
  const pages = Object.entries(settingsConfig)
    .filter(([, section]) =>
      section.settings.some(
        (setting) => !("hidden" in setting && setting.hidden)
      )
    )
    .map(([section, { description, settings }]) => ({
      title: section as PrefrenceSection,
      description,
      component: (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="space-y-4">
            {settings
              .filter((setting) => !("hidden" in setting && setting.hidden))
              .map((setting, index) =>
                renderSetting(section as PrefrenceSection, setting, index)
              )}
          </div>
        </div>
      ),
    }));

  const activePage = pages.find((page) => page.title === currentPage);

  if (!activePage) return null;

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar
        pages={pages}
        activePage={currentPage}
        setActivePage={updateCurrentPage}
      />
      <div className="p-4 w-full max-w-2xl overflow-y-auto">
        <h1 className="text-2xl font-bold capitalize mb-6">
          {activePage.title}
        </h1>
        {activePage.component}
      </div>
    </div>
  );
};

export default SettingsApp;
