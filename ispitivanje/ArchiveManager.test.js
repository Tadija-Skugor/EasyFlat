const pool = require('../db');
const ArchiveManager = require('./ArchiveManager');

beforeAll(async () => {
    await pool.query("insert into diskusija values (16, 'Discussion 16', 'text 16', 1, '2024-08-01', '2024-09-09', 4, 'description')")
    await pool.query("insert into diskusija values (17, 'Discussion 17', 'text 17', 2, '2024-09-01', '2024-12-22', 4, 'description')")
    await pool.query("insert into diskusija values (18, 'Discussion 18', 'text 18', 2, '2024-09-01', '2024-12-24', 4, 'description')")
    await pool.query("insert into diskusija values (19, 'Discussion 19', 'text 19', 1, '2024-09-01', '2025-01-14', 4, 'description')")
});

afterAll(async () => {
    await pool.query('delete from arhiva where id=16')
    await pool.query('delete from arhiva where id=17')
    await pool.query('delete from diskusija where id=18')
    await pool.query('delete from diskusija where id=19')
    
});

test('diskusija neaktivna vise od 30 dana',async () => {
    ArchiveManager.checkforArchiving();
    const resultArhiva = await pool.query(
        'SELECT * FROM arhiva WHERE id=16'
      );
      const resultDiskusija = await pool.query(
        'SELECT * FROM diskusija WHERE id=16'
      );
    await expect(resultArhiva.rowCount).toBe(1)
    await expect(resultDiskusija.rowCount).toBe(0)
});

test('diskusija neaktivna tocno 31 dan',async () => {
    ArchiveManager.checkforArchiving();
    const resultArhiva = await pool.query(
        'SELECT * FROM arhiva WHERE id=17'
      );
      const resultDiskusija = await pool.query(
        'SELECT * FROM diskusija WHERE id=17'
      );
    await expect(resultArhiva.rowCount).toBe(1)
    await expect(resultDiskusija.rowCount).toBe(0)
});

test('diskusija neaktivna tocno 30 dana',async () => {
    ArchiveManager.checkforArchiving();
    const resultArhiva = await pool.query(
        'SELECT * FROM arhiva WHERE id=18'
      );
      const resultDiskusija = await pool.query(
        'SELECT * FROM diskusija WHERE id=18'
      );
    await expect(resultArhiva.rowCount).toBe(0)
    await expect(resultDiskusija.rowCount).toBe(1)
});

test('diskusija neaktivna manje od 30 dana',async () => {
    ArchiveManager.checkforArchiving();
    const resultArhiva = await pool.query(
        'SELECT * FROM arhiva WHERE id=19'
      );
      const resultDiskusija = await pool.query(
        'SELECT * FROM diskusija WHERE id=19'
      );
    await expect(resultArhiva.rowCount).toBe(0)
    await expect(resultDiskusija.rowCount).toBe(1)
});