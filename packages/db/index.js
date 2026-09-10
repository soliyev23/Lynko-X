const client = require("./client");

/** @type {import('./client').PrismaClient} */
const prisma = new client.PrismaClient();

module.exports = { ...client, prisma };
