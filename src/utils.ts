import { BearerFieldsParseError } from "./exceptions";

interface BearerFields {
    realm?: string;
    service?: string;
    scope?: string;
}

const cloneResponse = (response: Response) => {
    return new Response(response.body, response);
};
const parseBearerFields = (bearerStr: string) => {
    if (bearerStr.startsWith("Bearer")) {
        const bearerFieldList = bearerStr
            .replace("Bearer", "")
            .replaceAll(/\s/g, "")
            .split(",")
            .map((item) => {
                const [key, value] = item.split("=");
                return [key.toLowerCase(), value.replaceAll("\"", "").toLowerCase()] as const;
            })
            .filter(item => item[0] && item[1]);
        const bearerFields = Object.fromEntries(new Map(bearerFieldList)) as BearerFields;
        return bearerFields;
    }else {
        throw new BearerFieldsParseError(bearerStr);
    }
};

export { cloneResponse, parseBearerFields };