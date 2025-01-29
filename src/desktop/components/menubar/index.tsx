import { useEffect, useState } from "react";
import { View } from "src/shared/components/ui/View";

const Menubar = () => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      rounded={false}
      className="w-full h-8 flex items-center justify-between fixed top-0 left-0 z-50 px-2"
    >
      <div className="flex flex-row items-center justify-center gap-4">
        <span className="text-sm">App Menu Placeholder</span>
      </div>
      <div className="flex flex-row items-center justify-center gap-4">
        <p className="text-sm">
          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
        <p className="text-sm">
          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </View>
  );
};

export default Menubar;
