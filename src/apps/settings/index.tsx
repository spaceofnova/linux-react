// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - this is a hack to get around the type errors cause its is a mess. TODO: fix this fucking mess

import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import { Switch } from "shared/components/ui/switch";
import { Input } from "shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "shared/components/ui/select";
import { settingsPages } from "shared/constants";
import { Preferences } from "shared/types/settings";
import { useWindowStore } from "shared/hooks/windowStore";
import { Button } from "shared/components/ui/button";
import { useRegistryStore } from "shared/hooks/registry";

type PreferenceSection = keyof Preferences;
type Setting = (typeof settingsPages)[number]["settings"][number];

interface SettingsAppProps {
  id: string;
  deepLink?: PreferenceSection;
}

const SettingsApp = ({ id, deepLink }: SettingsAppProps) => {
  const [currentPage, setCurrentPage] = useState<PreferenceSection | "home">(
    deepLink || "home",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { setKey } = useRegistryStore();

  const updateCurrentPage = (page: PreferenceSection | "home") => {
    useWindowStore.getState().updateWindow(id, {
      deepLink: undefined,
    });
    setCurrentPage(page);
  };

  useEffect(() => {
    if (deepLink) {
      setCurrentPage(deepLink);
    }
  }, [deepLink]);

  const renderSetting = (setting: Setting) => {
    if (setting.type === "button") {
      return (
        <div
          className="flex items-center justify-between p-2 bg-card rounded-lg hover:bg-accent/10 transition-colors"
          key={`${setting.key}`}
        >
          <span className="text-sm font-medium">{setting.label}</span>
          <Button onClick={setting.onClick} variant="outline" size="sm">
            {setting.secondaryLabel || setting.label}
          </Button>
        </div>
      );
    }

    if (!setting.key) return <div>Invalid Setting</div>;

    const value = useRegistryStore.getState().getKey(setting.key);

    switch (setting.type) {
      case "boolean":
        return (
          <div
            className="flex items-center justify-between p-2 bg-card rounded-lg hover:bg-accent/10 transition-colors"
            key={`${setting.key}`}
          >
            <label htmlFor={setting.key} className="text-sm font-medium">
              {setting.label}
            </label>
            <Switch
              id={setting.key}
              checked={Boolean(value)}
              onCheckedChange={(checked) =>
                setKey(setting.key as never, checked as never)
              }
            />
          </div>
        );

      case "string":
        return (
          <div
            className="flex flex-col gap-1 p-2 bg-card rounded-lg hover:bg-accent/10 transition-colors"
            key={`${setting.key}`}
          >
            <label htmlFor={setting.key} className="text-sm font-medium">
              {setting.label}
            </label>
            <Input
              id={setting.key}
              value={String(value || "")}
              onChange={(e) =>
                setKey(setting.key as never, e.target.value as never)
              }
            />
          </div>
        );

      case "select":
        return (
          <div
            className="flex flex-col gap-1 p-2 bg-card rounded-lg hover:bg-accent/10 transition-colors"
            key={`${setting.key}`}
          >
            <label htmlFor={setting.key} className="text-sm font-medium">
              {setting.label}
            </label>
            <Select
              value={String(value || setting.options[0])}
              onValueChange={(newValue) => {
                const mappedValue =
                  setting.valueMap?.[newValue] ?? (newValue as never);
                setKey(setting.key as never, mappedValue as never);
              }}
            >
              <SelectTrigger id={setting.key}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {/* @ts-expect-error - dont feel like fixing this */}
                {(setting as unknown).options.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "number":
        return (
          <div
            className="flex flex-col gap-1 p-2 bg-card rounded-lg hover:bg-accent/10 transition-colors"
            key={`${setting.key}`}
          >
            <label htmlFor={setting.key} className="text-sm font-medium">
              {setting.label}
            </label>
            <Input
              id={setting.key}
              type="number"
              min={setting.min}
              max={setting.max}
              step={setting.step}
              value={Number(value || setting.min || 0)}
              onChange={(e) =>
                setKey(setting.key as never, Number(e.target.value))
              }
            />
          </div>
        );
    }
  };

  const pages = Object.entries(settingsPages)
    .filter(([, section]) =>
      section.settings.some(
        (setting) => !("hidden" in setting && setting.hidden),
      ),
    )
    .map(([section, { title, description, settings }]) => ({
      title: title,
      description,
      component: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="space-y-2">
            {settings
              .filter((setting) => !("hidden" in setting && setting.hidden))
              .map((setting) => renderSetting(setting))}
          </div>
        </div>
      ),
    }));

  const activePage = pages.find((page) => page.title === currentPage);

  const renderHomePage = () => (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="space-y-1">
        {pages.map((page) => (
          <Button
            key={page.title}
            variant="ghost"
            className="flex flex-col items-start p-2 bg-card rounded-lg hover:bg-accent/10 transition-colors w-full gap-0 h-12"
            onClick={() => updateCurrentPage(page.title)}
          >
            <h2 className="text-base font-semibold capitalize">{page.title}</h2>
            <p className="text-xs text-muted-foreground text-left">
              {page.description}
            </p>
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-full w-full">
      <Sidebar
        pages={pages}
        activePage={currentPage}
        setActivePage={updateCurrentPage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="flex-1 h-full overflow-y-auto">
        <div className="p-3 max-w-2xl">
          {currentPage === "home"
            ? renderHomePage()
            : activePage && (
                <>
                  <h1 className="text-2xl font-semibold capitalize mb-3">
                    {activePage.title}
                  </h1>
                  {activePage.component}
                </>
              )}
        </div>
      </div>
    </div>
  );
};

export default SettingsApp;
