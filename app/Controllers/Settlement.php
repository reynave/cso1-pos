<?php

namespace App\Controllers;

use CodeIgniter\Model;
use Unsplash\HttpClient;

class Settlement extends BaseController
{
    public function index()
    {
        $q1 = "SELECT t.*, u.name  FROM cso1_transaction as t
        join cso1_user as u on u.id = t.cashierId
        where t.presence  = 1 and t.locked = 1 and t.settlementId = '' order by t.inputDate DESC";
        $items = $this->db->query($q1)->getResultArray();

        $data = array(
            "error" => false,
            "items" => $items,
        );
        return $this->response->setJSON($data);
    }

    function print(){
        $post = $this->request->getVar();
       
        if ($post) {
            $q1 = "SELECT *  FROM cso2_settlement  
            where id = '".$post['id']."'";
            $item = $this->db->query($q1)->getResultArray();

            $data = array(
                "error" => false, 
                "post"  => $post,
                "item"  => $item[0]
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
            $settlementId = $post['terminalId'].model("Core")->number("settlement");
            $q1 = "SELECT t.*, u.name  FROM cso1_transaction as t
            join cso1_user as u on u.id = t.cashierId
            where t.presence  = 1 and t.locked = 1 and t.settlementId = '' order by t.inputDate DESC";
            $items = $this->db->query($q1)->getResultArray();
            foreach ($items as $row) { 

                $this->db->table("cso1_transaction")->update([
                    "settlementId" => $settlementId,
                ], " id = '" . $row['id'] . "'");
            }
 
            $this->db->table("cso2_settlement")->insert([
                "id"            => $settlementId,
                "total"         => model("Core")->select("sum(total)","cso1_transaction","settlementId = '$settlementId' "),
                "amount"        => model("Core")->select("count(id)","cso1_transaction","settlementId = '$settlementId' "),
                "input_date"    => date("Y-m-d H:i:s")
            ]);

            $data = array(
                "error" => false,
                "id"    => $settlementId,
                "post"  => $post,
            );
        }

        return $this->response->setJSON($data);
    }
}