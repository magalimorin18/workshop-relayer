import express, { Express, Request, Response } from "express";
import http from "http";
import { AddressInfo } from "net";
import executeController from "./execute-relay-call/execute.controller";
import { RELAYER_BASE_URL } from "./globals";

const createApp = () => {
  const app: Express = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Security : do not display the technology used to power the server
  app.disable("x-powered-by");

  app.get("/health", (_req: Request, res: Response) => {
    res.send("Backend is running.");
  });

  return app;
};

const startServer = () => {
  const app = createApp();

  app.use("/", executeController);

  const url = new URL(RELAYER_BASE_URL);
  const server = http
    .createServer(app)
    .listen({ host: url.hostname, port: url.port }, () => {
      const serverInfo = server.address() as AddressInfo;

      console.log(
        `✅ Server successfully started at http://${serverInfo.address}:${serverInfo.port}`
      );
    });

  const signalTraps: NodeJS.Signals[] = ["SIGTERM", "SIGINT", "SIGUSR2"];
  signalTraps.forEach((type) => {
    process.once(type, async () => {
      console.log(`process.once ${type}`);
      server.close(() => {
        console.log("Closing server.");
      });
    });
  });
};

startServer();
