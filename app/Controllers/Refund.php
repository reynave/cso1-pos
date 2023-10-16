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
        WHERE id LIKE '%$search%'     
        ORDER BY inputDate DESC";
        $items = $this->db->query($q1)->getResultArray();

        $data = array(
            "error" => false,
            "items" => $items,
            "s" => $search,
        );

        return $this->response->setJSON($data);
    }
    function transaction_detail()
    {
        $id = strtoupper($this->request->getVar()['id']);
        $q1 = "SELECT t.id, i.description, t.price , t.refund, t.promotionId, t.promotionFreeId, t.promotionItemId, '' as 'promotion', '' as checkbox
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
            $ticket = $post['terminalId'].model("Core")->number("refund");
            foreach ($post['detail'] as $row) {
                if ($row['checkbox'] == true) { 
                    $this->db->table("cso1_transaction_detail")->update([
                        "refund" => $ticket,
                        "updateDate" => time(),
                    ], "id = '" . $row['id'] . "'"); 
                }
            }
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
            );
        }
        return $this->response->setJSON($data);
    }

    function  ticket() {
        $id = strtoupper($this->request->getVar()['id']);
        $transactionId = model("Core")->select("transactionId","cso2_refund","id= '$id' ");

        $q1 = "SELECT t.id, i.description, t.price , t.refund, t.promotionId, t.promotionFreeId, t.promotionItemId, '' as 'promotion', '' as checkbox
        FROM cso1_transaction_detail AS t
        LEFT JOIN cso1_item AS i ON i.id = t.itemId
        WHERE t.transactionId = '" . $transactionId. "' AND refund = '$id' AND t.void = 0 AND t.presence = 1 ORDER BY t.id ASC;";
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