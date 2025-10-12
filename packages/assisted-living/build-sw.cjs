const esbuild = require('esbuild');
const dotenv = require('dotenv');


// Load .env file
dotenv.config();

// Create the define object for esbuild
const define = {};
for (const k in process.env) {
  if (k.startsWith('NEXT_PUBLIC_')) {
    define[`process.env.${k}`] = JSON.stringify(process.env[k]);
  }
}

// Run esbuild
esbuild.build({
  entryPoints: ['auth-service-worker.ts'],
  bundle: true,
  sourcemap: true,
  outfile: 'public/auth-service-worker.js',
  define: define,
}).catch(() => process.exit(1));
