import { Button } from "shared/components/ui/button";
import { Input } from "shared/components/ui/input";
import { Search } from "lucide-react";
import { useNotificationStore } from "src/shared/hooks/notifications";

interface SidebarProps {
  pages: {
    title: string;
    description: string;
    component: React.ReactNode;
  }[];
  activePage: string;
  setActivePage: (page: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Sidebar = ({
  pages,
  activePage,
  setActivePage,
  searchQuery,
  setSearchQuery,
}: SidebarProps) => {
  const notify = useNotificationStore((state) => state.notify);
  return (
    <div className="flex flex-col min-w-[160px] w-[30%] max-w-[200px] h-full border-r border-border/30">
      <div className="p-1">
        <div className="relative">
          <Search className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
          <Input
            placeholder="Find a setting..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-6 h-7 text-xs opacity-50 cursor-not-allowed"
            onClick={() =>
              notify({
                message: "Not implemented yet ;)",
                type: "info",
              })
            }
            disabled
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-0.5 space-y-0.5">
          <Button
            variant={activePage === "home" ? "secondary" : "ghost"}
            onClick={() => setActivePage("home")}
            className="w-full justify-start px-1.5 py-1 h-7 text-sm font-normal"
          >
            <span>Home</span>
          </Button>
          {pages.map((page) => (
            <Button
              variant={activePage === page.title ? "secondary" : "ghost"}
              key={String(page.title)}
              onClick={() => setActivePage(page.title)}
              className="w-full justify-start px-1.5 py-1 h-7 text-sm font-normal"
              title={page.description}
            >
              <span className="capitalize">{page.title}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
