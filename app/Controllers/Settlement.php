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
        left join cso1_user as u on u.id = t.cashierId
        where t.presence  = 1 and t.locked = 1 and t.settlementId = '' order by t.inputDate DESC";
        $items = $this->db->query($q1)->getResultArray();

        $data = array(
            "error" => false,
            "items" => $items,
            "total" => (int) model("Core")->select("count(id)", "cso1_transaction", "presence  = 1 and locked = 1 and settlementId = ''"),
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
            $cso2_settlement = $this->db->query($q1)->getResultArray();

            $q2 = "SELECT *  FROM cso2_balance  
            where settlementId = '" . $post['id'] . "' order by input_date ASC";
            $cso2_balance = $this->db->query($q2)->getResultArray();

 
            $q2 = "SELECT *  FROM cso1_transaction  
            where settlementId = '" . $post['id'] . "' order by input_date ASC";
            $cso1_transaction = $this->db->query($q2)->getResultArray();

            $q2 = "SELECT t.settlementId, d.* FROM cso1_transaction_detail AS d
            LEFT JOIN cso1_transaction AS t ON t.id = d.transactionId
            WHERE t.settlementId =  '" . $post['id'] . "'  ORDER BY t.inputDate ASC";
            $cso1_transaction_detail = $this->db->query($q2)->getResultArray();

            $q2 = "SELECT a.* , t.id
            FROM cso1_transaction_payment AS a
            LEFT JOIN cso1_transaction AS t ON t.id = a.transactionId
            WHERE t.settlementId = '".$post['id']."';
            ";
            $cso1_transaction_payment = $this->db->query($q2)->getResultArray();

            $settlementId = $post['id']; 
         
            $date = strtotime(model("Core")->select("input_date","cso2_settlement"," id = '$settlementId' "));
            $date  = date("Y-m-d", $date);

            $data = array(
                "error" => false,
                "post" => $post,
                "csv" => array(
                    "cso1_transaction" => CSVHelper::arrayToCsv($cso1_transaction, $settlementId.'_pos_transaction' , $date),
                    "cso1_transaction_detail" => CSVHelper::arrayToCsv($cso1_transaction_detail, $settlementId.'_pos_transaction_detail', $date), 
                    "cso2_settlement" => CSVHelper::arrayToCsv($cso2_settlement, $settlementId.'_pos_settlement', $date),  
                    "cso2_balance" => CSVHelper::arrayToCsv($cso2_balance, $settlementId.'_pos_balance', $date),
                    "cso1_transaction_payment" => CSVHelper::arrayToCsv($cso1_transaction_payment, $settlementId.'_pos_transaction_payment', $date),
                    
                    //"voucher" => CSVHelper::arrayToCsv($cso2_balance, 'pos_balance_' . $settlementId, $date),
                
                ),
                "cso1_transaction" => $cso1_transaction, 
                "cso2_settlement" => $cso2_settlement,
                "cso2_balance" => $cso2_balance, 
              
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
 
            $this->db->table("cso1_transaction")->update([
                "settlementId" => $settlementId,
            ], "   presence  = 1 AND locked = 1 AND settlementId = '' ");
 
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
  

            $q1 = "SELECT * FROM cso1_transaction 
            WHERE settlementId = '$settlementId'
            order by inputDate DESC";
            $cso1_transaction = $this->db->query($q1)->getResultArray();

            $q1 = "SELECT * FROM cso1_transaction 
            WHERE settlementId = '$settlementId'
            order by inputDate DESC";
            $cso2_balance = $this->db->query($q1)->getResultArray();

            $q1 = "SELECT * FROM cso1_transaction 
            WHERE settlementId = '$settlementId'
            order by inputDate DESC";
            $cso2_settlement = $this->db->query($q1)->getResultArray();


            $csv = array(
                "cso1_transaction" => $cso1_transaction, 
                "cso2_settlement" => $cso2_settlement,
                "cso2_balance" => $cso2_balance, 
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