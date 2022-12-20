const dotenv = require("dotenv");

// Inisilize Fastify
const fastify = require("fastify")({ logger: true });

fastify.register(require("fastify-formbody"));

// Routes root access
fastify.register(require("./routes"));
