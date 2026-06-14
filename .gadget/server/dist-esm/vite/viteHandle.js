import { getFrontendTypeFromIndicatorFile } from "./helpers.js";
import { getInternalFrontendConfig } from "./utils.js";
export const getViteHandle = async (server)=>{
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
        const frontendType = await getFrontendTypeFromIndicatorFile();
        const config = getInternalFrontendConfig(frontendType);
        return {
            manifestPath: config.manifestFilePaths[0]
        };
    } else {
        const devServer = await server?.frontendServerManager?.devServerManager?.getServer();
        if (!devServer) {
            throw new Error("No vite dev server found");
        }
        return {
            devServer
        };
    }
};
