const mysql = require('mysql2/promise');

async function createDatabase() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'Asd123.com',
    charset: 'utf8mb4',
  };

  const database = process.env.DB_DATABASE || 'spiritlink';

  try {
    console.log(`[SpiritLink] 连接 MySQL ${config.host}:${config.port} ...`);
    const conn = await mysql.createConnection(config);
    console.log(`[SpiritLink] MySQL 连接成功`);

    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`[SpiritLink] 数据库 ${database} 已就绪`);
    console.log(`[SpiritLink] 等待 TypeORM synchronize 自动建表...`);
    await conn.end();
  } catch (err) {
    console.error('[SpiritLink] 数据库初始化失败:', err.message);
    process.exit(1);
  }
}

createDatabase();
