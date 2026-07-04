import type { PageServerLoad } from './$types';
import clientPromise from '$lib/db';
import { DB_NAME } from '$env/static/private';
import { getConfig } from '$lib/configs';
import type { Document } from 'mongodb';
import { createLookUpSlice } from '$lib/util/server';

export const load: PageServerLoad = async ({ cookies, url, params }) => {
    const client = await clientPromise
    const colName = params.slug.replaceAll("-", "_")
    const col = client.db(DB_NAME).collection(colName)
    const count = await col.countDocuments()
    const page = Number(url.searchParams.get("page"))
    const size = Number(url.searchParams.get("size"))
    const pipeline: Document[] = [
        {
            $match: {}
        },
        {
            $project: {
                appId: 0,
            },
        },
        {
            $skip: (page - 1) * size,
        },
        {
            $limit: size
        }
    ]

    if (params.slug === "members") {
        const lookupSlice = createLookUpSlice({
            from: "families",
            localField: "familyID",
            foreignField: "_id",
            as: "family"
        })
        const matchIndex = pipeline.findIndex(stage => '$match' in stage);
        if (matchIndex !== -1) {
            pipeline.splice(matchIndex + 1, 0, ...lookupSlice);
        }
    }
    const data = await col
        .aggregate(pipeline)
        .toArray()
    const [_, admin, slug] = url.pathname.split("/")
    const key = `${admin}_list_${slug}`.toUpperCase();
    const pageConfig = await getConfig(key)
    return {
        key,
        pageData: {
            page,
            size,
            data,
            count
        },
        pageConfig: pageConfig
    };
};
