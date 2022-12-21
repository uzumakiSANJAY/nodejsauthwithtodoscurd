require("dotenv").config();
// Initialize fastify.
const fastify = require("fastify")({
  logger: true, //enable this to receive logs of every request from fastify.
});

fastify.register(require("./routes.js"));

//Async root file function.
const start = async () => {
  try {
    //Use Port from ENV APP_PORT, if there is no such variable it will use port 3000
    await fastify.listen({port : process.env.APP_PORT || 3000});

    fastify.log.info(`server listening on ${process.env.APP_PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
//Run the servers!
start();
