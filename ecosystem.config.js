/**
 * Configuración de PM2 para AWS EC2
 * Uso: pm2 start ecosystem.config.js
 */

module.exports = {
  apps: [
    {
      name: 'dentisteam-bot',
      script: './index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'tu-ip-ec2-aqui.com',
      key: '~/.ssh/tu-llave.pem',
      ref: 'origin/main',
      repo: 'tu-repo-url',
      path: '/home/ubuntu/bots/botabril',
      'post-deploy': 'npm install && pm2 restart ecosystem.config.js --env production'
    }
  }
};
