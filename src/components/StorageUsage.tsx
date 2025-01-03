import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

const StorageUsage = () => {
  const [used, setUsed] = useState(0);
  const [total, setTotal] = useState(0);
  const [notAvailable, setNotAvailable] = useState(false);
  useEffect(() => {
    const getStorageUsage = async () => {
      const storage = await navigator.storage.estimate();
      if (storage && storage.usage && storage.quota) {
        setUsed(storage.usage / 1000000);
        setTotal(storage.quota / 1000000);
      } else {
        console.error("Error getting storage usage:", storage);
        setNotAvailable(true);
      }
    };
    setInterval(getStorageUsage, 5000);
    getStorageUsage();
  }, []);
  return (
    <div>
      {notAvailable ? (
        <div>Not Available, check your browser settings</div>
      ) : (
        <div>
          <p>
            {used.toFixed(2)} MB /{" "}
            {total.toString().length > 4
              ? `${(total / 1000).toFixed(2)} GB`
              : `${total} MB`}
          </p>
          <Progress value={used / total} />
          <p>{((used / total) * 100).toFixed(0)}% Used.</p>
        </div>
      )}
    </div>
  );
};

export default StorageUsage;
