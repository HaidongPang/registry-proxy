import { Env, KVValue } from "./envs";
import { createMiddleware } from "hono/factory";
import { parseBearerFields } from "./utils";
import { RegistryNotSupportedException } from "./exceptions";


const ensureTargetRegistrySupportedMiddleware = createMiddleware<Env>(async (context, next) => {
    const originUrl = new URL(context.req.url);
    const subDomain = originUrl.hostname.split(".")[0];
    const targetRegistryInfo = await context.env.REGISTRY_MAPS.get<KVValue>(subDomain, { type:"json" });
    
    if (!targetRegistryInfo) {
        throw new RegistryNotSupportedException(subDomain);
    }
    const { targetDomain, authEndpoint } = targetRegistryInfo;
    const targetBaseUrl = `${originUrl.protocol}//${targetDomain}`;
    context.set("targetRegistry", targetBaseUrl);
    context.set("targetAuthUrl", authEndpoint);
    await next();
});
const rewriteAuthHeaderMiddleware = createMiddleware<Env>(async (context, next) => {
    await next();
    if(context.res.status === 401 && context.res.headers.get("www-authenticate")) {
        const { service, scope } = parseBearerFields(context.res.headers.get("www-Authenticate") as string);
        const selfUrl = new URL(context.req.url);
        const selfBaseUrl = `${selfUrl.protocol}//${selfUrl.hostname}`;
        const selfAuthPath = "/v2/auth";
        const selfAuthUrl = new URL(selfAuthPath, selfBaseUrl);
        const bearerStr = `Bearer realm="${selfAuthUrl.toString()}",service="${service ? service : ""}",scope="${scope ? scope : ""}"`;
        context.header("www-authenticate", bearerStr);
    }
});


export { ensureTargetRegistrySupportedMiddleware, rewriteAuthHeaderMiddleware };