import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export const MainErrorFault = (error: Error, componentStack: string) => {
  return (
    <div className="flex justify-center items-center h-screen w-screen absolute top-0 left-0">
      <Card className="w-[90%] max-w-3xl">
        <CardHeader>
          <CardTitle className="text-red-500">Woah! Something broke!</CardTitle>
          <CardDescription>An error occurred in the application that caused the application to crash!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Error Message:</h3>
            <p className="text-red-500">{error.message}</p>
          </div>
          
          {error.stack && (
            <div>
              <h3 className="font-semibold mb-2">Error Stack:</h3>
              <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-auto text-sm overflow-x-auto">
                {error.stack}
              </pre>
            </div>
          )}
          
          {componentStack && (
            <div>
              <h3 className="font-semibold mb-2">Component Stack:</h3>
              <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-auto text-sm overflow-x-auto">
                {componentStack}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
