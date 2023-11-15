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

    request(url, options)
        .then((body) => { 
            body['items'].forEach(el => { 
                let query = 'SELECT * FROM `voucher_master` WHERE id = "' + el['id'] + '" ';
                connection.query(query,
                    function (err, results, fields) {
                       
                        if (results.length === 0) { 
                            // Jika hasil query kosong, maka lakukan operasi INSERT
                            const insertQuery = 'INSERT INTO `voucher_master` (id, name,amount,expDate,input_date,filename) VALUES (?, ?, ? ,?,?,? )';
                            const insertValues = [
                                el['id'],
                                el['name'],
                                el['amount'],
                                el['expDate'],
                                el['input_date'],
                                el['filename']

                            ]; // Ganti 'some_value' dengan nilai yang sesuai
                            let filename = el['filename'];
                            connection.query(insertQuery, insertValues, (err, results) => {
                                if (err) {
                                    console.error('Error executing INSERT query:', err);
                                } else {
                                    console.log('Data has been inserted successfully.', filename);

                                    const csvUrl = 'http://localhost:7344/app/cso1-api/uploads/voucher/' + filename;
                                    const savePath = './data/' + filename; // Ganti dengan lokasi penyimpanan yang sesuai
                                    downloadFile(csvUrl, savePath);
                                     
                                    setTimeout(()=>{
                                        const savePathInline = '.\\data\\' + filename; // Ganti dengan lokasi penyimpanan yang sesuai
                                    
                                        const loadQuery = `LOAD DATA LOCAL INFILE '${savePathInline}' 
                                        INTO TABLE voucher
                                        FIELDS TERMINATED BY ';'
                                        ENCLOSED BY '"'
                                        LINES TERMINATED BY '\n' 
                                        (id, voucherMasterId, number, amount, input_date);`;
                                     
                                        // Izinkan server MySQL untuk membaca file
                                        connection.query({
                                            sql: loadQuery,
                                            values: [savePathInline],
                                            infileStreamFactory: () => fs.createReadStream(savePathInline) 
                                        }, (error, results) => {
                                            if (error) {
                                                console.error('Error:', error);
                                            } else {
                                                console.log('Data from CSV file loaded into the database.',filename);
                                            } 
                                        });

                                    },1000);
                                   

                                }
                            });
                        } else {
                            console.log("duplacate");
                        }
                    }
                );
            });

        })
        .catch((error) => {
            //  console.log(error);
            let message = `
//
// SERVER OFFLINE!                     
// URL : ${url}                         
//
            `;
            console.log(message);
            connection.end();
        }).finally(() => {
           
            console.log("END");
        });



});


function downloadFile(url, savePath) {
    const fileStream = fs.createWriteStream(savePath);

    request(url)
        .on('response', (response) => {
            if (response.statusCode !== 200) {
                console.error('Error downloading file. Status code:', response.statusCode);
            }
        })
        .on('error', (error) => {
            console.error('Error downloading file:', error);
        })
        .pipe(fileStream);

    fileStream.on('finish', () => {
        fileStream.close();
        console.log('File downloaded and saved to:', savePath);
    });
}
 