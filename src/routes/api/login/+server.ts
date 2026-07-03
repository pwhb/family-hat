import { DB_NAME, MODE, SECRET_KEY } from "$env/static/private";
import { getConfig } from "$lib/configs";
import clientPromise from "$lib/db";
import { checkBasicAuth } from "$lib/util/server";
import { json, type RequestHandler } from "@sveltejs/kit";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken"

export const POST: RequestHandler = async ({ request, params }) => {
    try {
        if (!checkBasicAuth(request)) {
            return json({ message: 'Unauthorized' }, { status: 401 });
        }
        if (MODE !== "dev") {
            return json({ message: 'Forbidden' }, { status: 403 });
        }
        const { username, password } = await request.json();
        const client = await clientPromise;
        const col = client.db(DB_NAME).collection("users");
        const user = await col.findOne({ username: username, isActive: true })
        if (!user) {
            return json({ message: 'Not Found' }, { status: 404 })
        }
        const matched = await compare(password, user.hashedPassword)
        if (!matched) {
            return json({ message: 'Unauthorized' }, { status: 401 });
        }
        const authConf = await getConfig("AUTH")
        const token = jwt.sign({ username: user.username }, SECRET_KEY, {
            expiresIn: authConf.jwtExpiresIn
        })
        return json({ token, expiresIn: authConf.jwtExpiresIn });
    } catch (error) {
        console.log(error);
        return json({ message: 'Internal Server Error', log: error }, { status: 500 });
    }
};
