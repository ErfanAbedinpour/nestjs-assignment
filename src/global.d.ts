import { IEnv } from "./types/env.interface";

declare global {
    namespace NodeJS {
        interface ProcessEnv extends IEnv { }
    }
}

export { }
