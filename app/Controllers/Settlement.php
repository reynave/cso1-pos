<?php

namespace App\Controllers;

use CodeIgniter\Model;
use CURLFile;
use Unsplash\HttpClient;
use App\Helpers\CSVHelper;

class Settlement extends BaseController
{
    function index()
    {
        $q1 = "SELECT t.*, u.name  FROM cso1_transaction as t
        join cso1_user as u on u.id = t.cashierId
        where t.presence  = 1 and t.locked = 1 and t.settlementId = '' order by t.inputDate DESC";
        $items = $this->db->query($q1)->getResultArray();

        $data = array(
            "error" => false,
            "items" => $items,
            "total" => (int)model("Core")->select("count(id)","cso1_transaction","presence  = 1 and locked = 1 and settlementId = ''"),
        );
        return $this->response->setJSON($data);
    }
    function history()
    {
        $q1 = "SELECT *  FROM cso2_settlement  order by input_date DESC";
        $items = $this->db->query($q1)->getResultArray();

        $data = array(
            "error" => false,
            "items" => $items,
        );
        return $this->response->setJSON($data);
    }
    function print()
    {
        $post = $this->request->getVar();

        if ($post) {
            $q1 = "SELECT *  FROM cso2_settlement  
            where id = '" . $post['id'] . "'";
            $item = $this->db->query($q1)->getResultArray();

            $q2 = "SELECT *  FROM cso2_balance  
            where settlementId = '" . $post['id'] . "' order by input_date ASC";
            $balance = $this->db->query($q2)->getResultArray();

            $data = array(
                "error" => false,
                "post" => $post,
                "item" => $item[0],
                "balance" => $balance,
            );
        }
        return $this->response->setJSON($data);
    }

    function onSetSettlement()
    {
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {
            $this->db->transStart();
            $settlementId = $post['terminalId'] . model("Core")->number("settlement");

            $q1 = "SELECT t.*, u.name  FROM cso1_transaction as t
            join cso1_user as u on u.id = t.cashierId
            where t.presence  = 1 and t.locked = 1 and t.settlementId = '' order by t.inputDate DESC";
            $items = $this->db->query($q1)->getResultArray();

            foreach ($items as $row) {
                $this->db->table("cso1_transaction")->update([
                    "settlementId" => $settlementId,
                ], " id = '" . $row['id'] . "'");
            }

            $this->db->table("cso2_balance")->update([
                "settlementId" => $settlementId,
                "close" => 1,
            ], " settlementId = '' and close = 0 ");

            $this->db->table("cso2_settlement")->insert([
                "id" => $settlementId,
                "amount" => model("Core")->select("sum(total)", "cso1_transaction", "settlementId = '$settlementId' "),
                "total" => model("Core")->select("count(id)", "cso1_transaction", "settlementId = '$settlementId' "),
                "input_date" => date("Y-m-d H:i:s")
            ]);



            $q = "SELECT *  FROM cso1_transaction  
            where  settlementId = '$settlementId' order by id ASC";
            $data = $this->db->query($q)->getResultArray();
            $filePath1 = CSVHelper::arrayToCsv($data, 'cso1_transaction.' . $settlementId);

            foreach ($data as $row) {
                $q = "SELECT *  FROM cso1_transaction_detail  
                WHERE  transactionId = '" . $row['id'] . "' order by id ASC";
                $transaction_detail = $this->db->query($q)->getResultArray();
                $filePath2 = CSVHelper::arrayToCsv($transaction_detail, 'cso1_transaction_detail.' . $settlementId);

                $q = "SELECT *  FROM cso1_transaction_payment  
                WHERE  transactionId = '" . $row['id'] . "' order by id ASC";
                $transaction_payment = $this->db->query($q)->getResultArray();
                $filePath3 = CSVHelper::arrayToCsv($transaction_payment, 'cso1_transaction_payment.' . $settlementId);

            }

            $q = "SELECT *  FROM cso2_balance  
            where  settlementId = '$settlementId' order by id ASC";
            $data = $this->db->query($q)->getResultArray();
            $filePath4 = CSVHelper::arrayToCsv($data, 'cso2_balance.' . $settlementId);

            $csv = array(
                "cso1_transaction" => $filePath1,
                "cso1_transaction_detail" => $filePath2,
                "cso1_transaction_payment" => $filePath3,
                "cso2_balance" => $filePath4,

            );

            $this->db->transComplete();




            $data = array(
                "error" => false,
                "id" => $settlementId,
                "post" => $post,
                "transStatus" => $this->db->transStatus(),
                "csv" => $csv,
            );
        }

        return $this->response->setJSON($data);
    }

    
 
    function testCSV()
    {
        $data = [
            ['name' => 'Joh2n', 'age' => 230, 'email' => 'john@example.com'],
            ['name' => 'Jane', 'age' => 425, 'email' => 'jane@example.com'],
        ];


        // Memanggil fungsi dari Helper
        $filePath = CSVHelper::arrayToCsv($data, 'data_export');
        $filePath = CSVHelper::arrayToCsv($data, 'data_export2');


        if ($filePath) {
            echo "File CSV berhasil dibuat dan disimpan di: " . $filePath;
        } else {
            echo "Gagal membuat file CSV.";
        }
    }
}