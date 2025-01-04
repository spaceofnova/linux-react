import { Hono } from "hono";
import { renderToString } from "react-dom/server";

const app = new Hono();
app.get("/", (c) => {
  return c.html(
    renderToString(
      <html>
        <head>
          <meta charSet="utf-8" />
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          <script type="module" src="/src/client.tsx"></script>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    )
  );
});

export default app;
