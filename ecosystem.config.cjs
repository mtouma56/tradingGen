module.exports = {
  apps: [
    {
      name: 'webapp-dev',
      script: 'npx',
      args: 'wrangler pages dev dist --port 3000 --ip 0.0.0.0',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}