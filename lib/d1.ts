const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!;
const CF_API_TOKEN = process.env.CF_API_TOKEN!;
const CF_D1_DATABASE_ID = process.env.CF_D1_DATABASE_ID!;

const D1_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_D1_DATABASE_ID}/query`;

export interface D1Result<T = Record<string, unknown>> {
    results: T[];
    success: boolean;
    meta: Record<string, unknown>;
}

export async function d1Query<T = Record<string, unknown>>(
    sql: string,
    params: (string | number | boolean | null)[] = []
): Promise<D1Result<T>> {
    const res = await fetch(D1_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${CF_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params }),
        cache: 'no-store',
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`D1 query failed (${res.status}): ${err}`);
    }

    const json = await res.json();

    // Cloudflare wraps results in a top-level { result: [ { results, success, meta } ] }
    if (json.result && Array.isArray(json.result)) {
        return json.result[0] as D1Result<T>;
    }

    return json as D1Result<T>;
}
