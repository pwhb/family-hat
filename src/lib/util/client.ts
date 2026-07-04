export const getToken = (request: Request, header = 'authorization') => {
    const auth = request.headers.get(header);
    if (!auth) {
        return null;
    }
    return auth.split(' ')[1];
};


// export function getValue(obj: Record<string, any>, path: string, fallback: any = undefined): any {
//     if (!obj || typeof path !== 'string') return fallback;

//     const value = path.split('.').reduce((current, key) => {
//         return current && typeof current === 'object' && key in current 
//             ? current[key] 
//             : undefined;
//     }, obj);

//     return value !== undefined ? value : fallback;
// }
export function fillTemplate(template: string, source: Record<string, any>): string {
    if (!template || !source) return template;
    return template.replace(/\{\{(.*?)\}\}/g, (match, path) => {
        const cleanPath = path.trim();
        const value = cleanPath.split('.').reduce((current: any, key: string) => {
            return current && typeof current === 'object' && key in current
                ? current[key]
                : undefined;
        }, source);
        return value !== undefined ? String(value) : match;
    });
}

export const getOptions = async ({ type, url, method, headers, values, label, value }: any) => {
    if (type === 'constant') {
        return values;
    } else if (type === 'fetch') {
        const res = await fetch(url, {
            method: method,
            headers: {
                ...headers
            }
        });
        const resJSON = await res.json();
        if (resJSON && resJSON.data) {
            return resJSON.data.map((v: any) => ({
                label: getDeepValue(v, label),
                value: getDeepValue(v, value)
            }));
        }
    }
};

export function getDeepValue(source: any, path: string) {
    return path.split('.').reduce((curr, key) => curr && curr[key], source);
}

export function buildEditableObj(fields: any[], dataSource: any) {
    const obj: Record<string, any> = {};

    for (const field of fields) {
        const rawValue = getDeepValue(dataSource, field.key);

        if (field.lang && field.lang.length) {
            obj[field.key] = {};
            for (const lang of field.lang) {
                obj[field.key][lang] = rawValue && rawValue[lang] !== undefined ? rawValue[lang] : "";
            }
        } else {
            obj[field.key] = rawValue !== undefined ? rawValue : "";
        }
    }

    return obj;
}