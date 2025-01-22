import { Button } from "shared/components/ui/button";
import { PrefrenceSection } from "shared/types/settings";

interface SidebarProps {
  pages: {
    title: PrefrenceSection;
    description: string;
    component: React.ReactNode;
  }[];
  activePage: PrefrenceSection;
  setActivePage: (page: PrefrenceSection) => void;
}

const Sidebar = ({ pages, activePage, setActivePage }: SidebarProps) => {
  return (
    <div className="flex flex-col gap-2 items-center p-2 w-48 border-r border-border h-full">
      <h1 className="text-2xl font-bold my-2 text-left w-full">Settings</h1>
      <div className="w-full space-y-1">
        {pages.map((page) => (
          <Button
            variant={activePage === page.title ? "default" : "ghost"}
            key={String(page.title)}
            onClick={() => setActivePage(page.title)}
            className="w-full justify-start items-start"
            title={page.description}
          >
            {page.title}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
