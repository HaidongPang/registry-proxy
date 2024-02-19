import { HTTPException } from "hono/http-exception";

class RegistryNotSupportedException extends HTTPException {
    constructor (subDomain: string) {
        const message = `Target Registry Is Not Supported: ${subDomain}`;
        super(400, { message });
    }
}

class BearerFieldsParseError extends Error {
    constructor (bearerStr: string) {
        super(`Invalid Bearer String: ${bearerStr}`);
    }
}

export { RegistryNotSupportedException, BearerFieldsParseError };