const esbuild = require('esbuild');

const config = {
  entryPoints: ['app/javascript/application.js'],
  bundle: true,
  outdir: 'app/assets/builds',
  publicPath: '/assets',
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx',
  },
  target: 'es2017',
  logLevel: 'info',
  sourcemap: true,
  minify: isProduction,
  define: {
    'process.env.NODE_ENV': `"${process.env.NODE_ENV || 'development'}"`,
  },
};
/startup/registration.jsx:2:3
if (isWatch) {
  (async () => {
    const ctx = await esbuild.context({
      ...config,
      banner: {
        js: ' (() => new EventSource("http://localhost:4040").onmessage = () => location.reload())();',
      },
    });

    await ctx.watch();
    console.log('Watching for file changes...');
  })();
} else {
  esbuild.build(config).catch(() => process.exit(1));
}
