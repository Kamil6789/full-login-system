import { prisma } from "../../../index.js";


export default async (fastify, options) => {

    fastify.requireAuthentication(fastify);

    fastify.get("/me", async (req, res) => {

        const { username, email, createdAt, lastLoginAt, avatarUrl, totpSecret, totpBackupCodes } = await prisma.users.findFirst({
            where: {
                AND: [
                    { username: req.auth.username },
                    { status: 1 }
                ]
            }
        });

        res.send({
            success: true,
            data: { 
                username, email, createdAt, lastLoginAt, avatarUrl,
                backupCodes: JSON.parse(totpBackupCodes),
                mfaEnabled: totpSecret ? true : false
            }
        });

    });
    
}
