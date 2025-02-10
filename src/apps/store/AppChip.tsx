import { Button } from "src/shared/components/ui/button";
import { AppType } from "src/shared/types/storeTypes";

export const AppChip = ({ app }: { app: AppType }) => {
  return (
    <div className="flex bg-card rounded w-80 h-24 gap-2 cursor-pointer">
      <div className="h-full aspect-square">
        <img
          src={app.icon}
          alt={app.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col w-full h-full p-1">
        <h1 className="text-lg font-bold">{app.name}</h1>
        <p className="text-sm text-gray-500">{app.description}</p>
        <span className="flex-1" />
        <Button variant="outline" className="w-full">
          Install
        </Button>
      </div>
    </div>
  );
};
