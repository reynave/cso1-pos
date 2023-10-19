<?php

namespace App\Controllers;

use CodeIgniter\Model;

class Refund extends BaseController
{
    function fnSearch()
    {
        $search = strtoupper($this->request->getVar()['searchTrans']);
        $q1 = "SELECT *
        FROM cso1_transaction 
        WHERE id LIKE '%$search%'  AND  total > 0
        ORDER BY inputDate DESC";
        $items = $this->db->query($q1)->getResultArray();

        $data = array(
            "error" => false,
            "items" => $items,
            "maxExchange" => 1,
            "s" => $search,
        );

        return $this->response->setJSON($data);
    }
    function transaction_detail()
    {
        $id = strtoupper($this->request->getVar()['id']);
        $q1 = "SELECT t.id, i.description, t.price , t.refund, t.exchange, t.promotionId, t.promotionFreeId, t.promotionItemId, '' as 'promotion', '' as checkbox
        FROM cso1_transaction_detail AS t
        LEFT JOIN cso1_item AS i ON i.id = t.itemId
        WHERE t.transactionId = '" . $id . "' AND t.void = 0 AND t.presence = 1 ORDER BY t.id ASC;";
        $item = $this->db->query($q1)->getResultArray();
        $i = 0;
        foreach ($item as $row) {
            $item[$i]['promotion'] = model("Core")->select("description", "cso1_promotion", "id='" . $row['promotionId'] . "'");
        }

        $data = array(
            "error" => false,
            "detail" => $item,
        );

        return $this->response->setJSON($data);
    }

    function fnRefund()
    {
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {
            $id =  $post['terminalId']."." .date("ymd"). "." .model("Core")->number("transaction");
            $ticket = $post['terminalId'] . model("Core")->number("refund");
            foreach ($post['detail'] as $row) {
                if ($row['checkbox'] == true) {
                    $this->db->table("cso1_transaction_detail")->update([
                        "refund" => $ticket,
                        "updateDate" => time(),
                    ], "id = '" . $row['id'] . "'");
                    if($post['paymentMethod']['paymentTypeId'] == 'CASH'){
                        $this->db->table("cso2_balance")->insert([
                            "cashOut" => (int)$row['price'] * -1,
                            "cashIn" => 0,
                            "transactionId" => $id,
                            "kioskUuid" => $ticket, 
                            "terminalId" => $post['terminalId'],
                            "cashierId" => model("Core")->accountId(),
                            "input_date" => date("Y-m-d H:i:s")
                        ]);
                    }
                 

                    $insertDetail = array(
                        "transactionId" => $id,  
                        "itemId" => model("Core")->select("itemId","cso1_transaction_detail","id='".$row['id']."'"),
                        "barcode" => model("Core")->select("barcode","cso1_transaction_detail","id='".$row['id']."'"),
                        "promotionId" => "REFUND",
                        "originPrice" => (int)$row['price'] * -1,
                        "price" =>(int)$row['price'] * -1, 
                        "note" => $ticket,
                        "presence" => 1,
                        "inputDate" => time(),
                        "updateDate" =>  time(),
                    );
                    $this->db->table("cso1_transaction_detail")->insert($insertDetail);
                }
            }
          
            $this->db->table("cso1_transaction")->insert([
                "id" => $id,
                "transactionDate" => time(),
                "kioskUuid" => $ticket,
                "paymentTypeId" => "", 
                "startDate" => date("Y-m-d H:i:s"),
                "endDate" => date("Y-m-d H:i:s"), 
                "terminalId" => $post['terminalId'],
                "struk" => $post['transactionId'],
                "cashierId" => model("Core")->accountId(),
                "pthType" => 1,  
                "total" => (int) $post['total'] * -1, 
                "finalPrice" => (int) $post['total'] * -1,
                "locked" => 1,
                "presence" => 1,
                "inputDate" => time(),
                "updateDate" => time(), 
                "transaction_date" => date("Y-m-d H:i:s"),
                "input_date" => date("Y-m-d H:i:s"),
                "update_date" => date("Y-m-d H:i:s"), 
            ]); 

            $insertDetail = array(
                "transactionId" => $id,
                "paymentTypeId" => $post['paymentMethod']['paymentTypeId'],
                "amount" => (int) $post['total'] * -1, 
                "presence" => 1,
                "inputDate" => time(),
                "updateDate" =>  time(),
                "input_date" => date("Y-m-d H:i:s"),
                "update_date" => date("Y-m-d H:i:s"), 
            );
            $this->db->table("cso1_transaction_payment")->insert($insertDetail); 

            $this->db->table("cso2_refund")->insert([
                "id" => $ticket,
                "transactionId" => $post['transactionId'],
                "refundTotalAmount" =>  $post['total'],
                "terminalId" =>  $post['terminalId'],
                "inputDate" => time(),
                "input_date" => date("Y-m-d H:i:s"),
                "input_by" => model("Core")->accountId(),
            ]);

            $data = array(
                "error" => false,
                "ticket" => $ticket,
                "id" => $id,
            );
        }
        return $this->response->setJSON($data);
    }

    function fnExchange()
    {
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {
            $kioskUuid = $post['terminalId'] . model("Core")->number("kiosk");
            $ticket = $post['terminalId'] . model("Core")->number("refund");

            $this->db->table("cso1_kiosk_uuid")->insert([
                "kioskUuid" => $kioskUuid,  
                "exchange" => $ticket,
                "terminalId" => $post['terminalId'], 
                "presence" => 1,
                "inputDate" => time(), 
            ]);


            foreach ($post['detail'] as $row) {

                if ($row['checkbox'] == true) {

                    //new Transaction 
                    $this->db->table("cso1_kiosk_cart")->insert([
                        "kioskUuid" => $kioskUuid,  
                        "promotionId" => "EXCHANGES",
                        "itemId" => model("Core")->select("itemId","cso1_transaction_detail","id='".$row['id']."'"),
                        "barcode" => model("Core")->select("barcode","cso1_transaction_detail","id='".$row['id']."'"), 
                        "originPrice" => (int)$row['price'] * -1,
                        "price" =>(int)$row['price'] * -1, 
                        "note" => $ticket,
                        "presence" => 1,
                        "inputDate" => time(),
                        "updateDate" =>  time(),
                    ]);

 
                    $this->db->table("cso1_transaction_detail")->update([
                        "exchange" => $ticket,
                        "updateDate" => time(),
                    ], "id = '" . $row['id'] . "'");

                    $this->db->table("cso2_exchange")->insert([
                        "exchange" => $ticket,
                        "kioskUuid" => $kioskUuid, 
                        "transactionId" => model("Core")->select("transactionId", "cso1_transaction_detail", "id='" . $row['id'] . "'"),
                        "transactionDetailId" => $row['id'],
                        "itemId" => model("Core")->select("itemId", "cso1_transaction_detail", "id='" . $row['id'] . "'"),
                        "input_date" => date("Y-m-d H:i:s"),
                    ]);
                }
            }

            $data = array(
                "error" => false,
                "ticket" => $ticket,
                "kioskUuid" => $kioskUuid,
            );
        }
        return $this->response->setJSON($data);
    }

    function  ticket()
    {
        $id = strtoupper($this->request->getVar()['id']);
        $transactionId = model("Core")->select("transactionId", "cso2_refund", "id= '$id' ");

        $q1 = "SELECT t.id, i.description, t.price , t.refund, t.promotionId, t.promotionFreeId, t.promotionItemId, '' as 'promotion', '' as checkbox
        FROM cso1_transaction_detail AS t
        LEFT JOIN cso1_item AS i ON i.id = t.itemId
        WHERE t.transactionId = '" . $transactionId . "' AND refund = '$id' AND t.void = 0 AND t.presence = 1 ORDER BY t.id ASC;";
        $items = $this->db->query($q1)->getResultArray();

        $q2 = "SELECT * FROM cso2_refund         
        WHERE id  = '$id' ORDER BY inputDate DESC";
        $refund = $this->db->query($q2)->getResultArray()[0];

        $data = array(
            "error" => false,
            "items" => $items,
            "refund" => $refund,
        );

        return $this->response->setJSON($data);
    }
}
