
import type { FastifyInstance } from "fastify";
type ViteHandle = {
	devServer: any
} | {
	manifestPath: string
};
export declare const getViteHandle: (server: FastifyInstance) => Promise<ViteHandle>;
export {};
