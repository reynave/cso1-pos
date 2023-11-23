const sql = require('mssql')
console.log("WINDOWS-AN3885S\SQLEXPRESS");

// Konfigurasi koneksi ke SQL Server dengan Windows Authentication
const config = {
    server: 'WINDOWS-AN3885S\\SQLEXPRESS', // Ganti dengan nama server SQL Server Anda
    database: 'cso1',
    options: {
      trustedConnection: true, // Mengaktifkan Windows Authentication
    },
  };
  
  // Membuat objek koneksi
  const pool = new sql.ConnectionPool(config);
  
  // Fungsi untuk menjalankan kueri
  async function executeQuery() {
    try {
      // Menghubungkan ke database
      await pool.connect();
  
      // Menjalankan kueri
      const result = await pool.request().query('SELECT * FROM gold_barcode');
  
      // Output hasil kueri
      console.log(result.recordset);
    } catch (err) {
      // Tangani kesalahan koneksi atau eksekusi kueri
      console.error('Error: ', err);
    } finally {
      // Menutup koneksi setelah selesai
      pool.close();
    }
  }
  
  // Memanggil fungsi untuk menjalankan kueri
  executeQuery();