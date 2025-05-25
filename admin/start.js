const { startServer } = require('directus');

startServer().catch((error) => {
    console.error(error);
    process.exit(1);
}); 