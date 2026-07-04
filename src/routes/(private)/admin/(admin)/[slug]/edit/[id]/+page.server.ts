import type { PageServerLoad } from './$types';
import clientPromise from '$lib/db';
import { DB_NAME } from '$env/static/private';
import { getConfig } from '$lib/configs';
import { ObjectId, type Document } from 'mongodb';
import { createLookUpSlice } from '$lib/util/server';

export const load: PageServerLoad = async ({ cookies, url, params }) => {
    const client = await clientPromise
    const colName = params.slug.replaceAll("-", "_")
    const col = client.db(DB_NAME).collection(colName)
    const pipeline: Document[] = [
        {
            $match: {
                _id: new ObjectId(params.id)
            }
        },
        {
            $project: {
                appId: 0,
            },
        },
        {
            $limit: 1
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
     const [_, admin, slug, action] = url.pathname.split("/")
    const key = `${admin}_${action}_${slug}`.toUpperCase();
    const pageConfig = await getConfig(key)
    return {
        key,
        pageData: {
            data: data[0],
        },
        pageConfig: pageConfig
    };
};
