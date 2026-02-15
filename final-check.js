const { Client } = require('pg');

async function finalCheck() {
    // Definitive pooler connection string
    const connectionString = 'postgresql://postgres.dnkhbbapqqksogokuzkg:MyPass123@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('--- FINAL DATABASE CHECK ---');

        const tables = await client.query(`SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'`);
        console.log('Public tables found:', tables.rows[0].count);

        const users = await client.query(`SELECT count(*) FROM public.users`);
        console.log('Public users found:', users.rows[0].count);

        console.log('Status: LIVE');
    } catch (err) {
        console.error('VERIFY_ERROR:', err.message);
    } finally {
        await client.end();
    }
}

finalCheck();
