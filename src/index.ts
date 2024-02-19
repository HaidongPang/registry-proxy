import { ensureTargetRegistrySupportedMiddleware, rewriteAuthHeaderMiddleware } from "./middlewares";
import { cloneResponse } from "./utils";
import { Env } from "./envs";
import { Hono } from "hono";


const app = new Hono<Env>().basePath("/v2");
app.use("*", ensureTargetRegistrySupportedMiddleware, rewriteAuthHeaderMiddleware);

app.get("/auth", async (context)=>{
    const targetAuthUrl = new URL(context.get("targetAuthUrl"));
    const searchParamas = context.req.query();
    Object.entries(searchParamas).forEach(([key, value]) => {
        targetAuthUrl.searchParams.set(key, value);
    });
        
    const targetAuthRequest = new Request(targetAuthUrl, {
        method: "GET",
        headers: context.req.raw.headers,
        redirect: "follow"
    });
    return await fetch(targetAuthRequest);
        
});
app.all("/*", async (context)=>{
    const targetBaseUrl = context.get("targetRegistry");
    const targetUrl = new URL(context.req.path, targetBaseUrl);
    
    const targetRequest = new Request(targetUrl, {
        method: context.req.method,
        headers: context.req.raw.headers,
        redirect: "follow"
    });
    // The headers of Response returned by fetch are immutable.
    // So, we need to clone the Response.
    return cloneResponse(await fetch(targetRequest));
});

export default app;
