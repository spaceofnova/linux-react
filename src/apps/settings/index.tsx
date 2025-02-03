import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import { usePrefrencesStore } from "shared/hooks/prefrencesStore";
import { Switch } from "shared/components/ui/switch";
import { Input } from "shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "shared/components/ui/select";
import { settingsConfig } from "shared/constants";
import {
  PrefrenceSection,
  PrefrencePath,
  SettingConfig,
} from "shared/types/settings";
import { useWindowStore } from "shared/hooks/windowStore";
import { Button } from "shared/components/ui/button";

type SettingValue = boolean | string | number;
type PrefrenceRecord = Record<string, SettingValue | undefined>;

const SettingsApp = ({
  id,
  deepLink,
}: {
  id: string;
  deepLink: PrefrenceSection;
}) => {
  const [currentPage, setCurrentPage] = useState<PrefrenceSection | "home">(
    deepLink || "home"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const updateCurrentPage = (page: PrefrenceSection | "home") => {
    useWindowStore.getState().updateWindow(id, {
      deepLink: undefined,
    });
    setCurrentPage(page);
  };

  const { prefrences, updatePrefrence } = usePrefrencesStore();

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
            className="flex items-center justify-between p-2 bg-card rounded-lg hover:bg-accent/10 transition-colors"
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
          <div className="flex flex-col gap-1 p-2 bg-card rounded-lg hover:bg-accent/10 transition-colors" key={`${section}-${index}`}>
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
          <div className="flex flex-col gap-1 p-2 bg-card rounded-lg hover:bg-accent/10 transition-colors" key={`${section}-${index}`}>
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
          <div className="flex flex-col gap-1 p-2 bg-card rounded-lg hover:bg-accent/10 transition-colors" key={`${section}-${index}`}>
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
            className="flex items-center justify-between p-2 bg-card rounded-lg hover:bg-accent/10 transition-colors"
            key={`${section}-${index}`}
          >
            <span className="text-sm font-medium">{setting.label}</span>
            <Button onClick={setting.onClick} variant="outline" size="sm">
              {setting.secondaryLabel || setting.label}
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
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="space-y-2">
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

  const filteredPages = searchQuery
    ? pages.filter(
        (page) =>
          page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pages;

  return (
    <div className="flex h-full w-full bg-background">
      <Sidebar
        pages={pages}
        activePage={currentPage}
        setActivePage={updateCurrentPage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="flex-1 h-full overflow-y-auto">
        <div className="p-3 max-w-2xl">
          {currentPage === "home" ? (
            renderHomePage()
          ) : (
            activePage && (
              <>
                <h1 className="text-2xl font-semibold capitalize mb-3">
                  {activePage.title}
                </h1>
                {activePage.component}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsApp;
