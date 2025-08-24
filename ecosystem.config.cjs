module.exports = {
  apps: [
    {
      name: 'trading-hevea',
      script: 'npm',
      args: 'run dev -- --port 3000 --host 0.0.0.0',
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
