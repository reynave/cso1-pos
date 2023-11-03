const mysql = require('mysql2');
const request = require('request-promise');
const fs = require('fs');
const url = "http://localhost:7344/app/cso1-api/voucher/";
const options = { json: true };

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'cso1'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }

    let filename = 'V000008.txt';
    const savePath = '.\\data\\' + filename; // Ganti dengan lokasi penyimpanan yang sesuai
    
    const loadQuery = `LOAD DATA LOCAL INFILE '${savePath}' 
    INTO TABLE voucher
    FIELDS TERMINATED BY ';'
    ENCLOSED BY '"'
    LINES TERMINATED BY '\n' 
    (id, voucherMasterId, number, amount, input_date);`;
 
    // Izinkan server MySQL untuk membaca file
    connection.query({
        sql: loadQuery,
        values: [savePath],
        infileStreamFactory: () => fs.createReadStream(savePath) 
    }, (error, results) => {
        if (error) {
            console.error('Error:', error);
        } else {
            console.log('Data from CSV file loaded into the database.');
        }

      
    });
});
