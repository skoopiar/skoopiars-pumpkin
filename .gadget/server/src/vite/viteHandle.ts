import type { FastifyInstance } from "fastify";
import { getFrontendTypeFromIndicatorFile } from "./helpers";
import { getInternalFrontendConfig } from "./utils";

type ViteHandle = { devServer: any } | { manifestPath: string };

export const getViteHandle = async (server: FastifyInstance): Promise<ViteHandle> => {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    const frontendType = await getFrontendTypeFromIndicatorFile();
    const config = getInternalFrontendConfig(frontendType);
    return { manifestPath: config.manifestFilePaths[0] };
  } else {
    const devServer = await (server as any)?.frontendServerManager?.devServerManager?.getServer();

    if (!devServer) {
      throw new Error("No vite dev server found");
    }

    return { devServer };
  }
};
