"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getViteHandle", {
    enumerable: true,
    get: function() {
        return getViteHandle;
    }
});
const _helpers = require("./helpers");
const _utils = require("./utils");
const getViteHandle = async (server)=>{
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
        const frontendType = await (0, _helpers.getFrontendTypeFromIndicatorFile)();
        const config = (0, _utils.getInternalFrontendConfig)(frontendType);
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
