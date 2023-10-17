<?php

namespace App\Controllers;

use CodeIgniter\Model;

class KioskUuid extends BaseController
{
    function index()
    {
        $json = file_get_contents('php://input');
        $post = json_decode($json, true);
        $data = [
            "error" => true,
            "post" => $post,
        ];
        if ($post) {
            $data = array(
                "error" => false,
            );
        }
        return $this->response->setJSON($data);
    }

    function getId()
    {
        $json = file_get_contents('php://input');
        $post = json_decode($json, true);
        $data = [
            "error" => true,
            "post" => $post,
        ];
        if ($post) {
            $insert = false;
            if ($post['kiosUuid'] == '') {
                $id = $post['terminalId'] . model("Core")->number("kiosk");
                $insert = true;
            } else {
                $id = $post['kiosUuid'];
            }

            if ($insert == true) {
                $this->db->table("cso2_parking")->insert([
                    "terminalId" => $post['terminalId'],
                    "cashierId" => model("Core")->accountId(),
                    "kioskUuid" => $id,
                    "update_date" => date("Y-m-d H:i:s"),
                    "input_date" => date("Y-m-d H:i:s")
                ]);
            }

            $data = array(
                "error" => false,
                "id" => $id,
                "post" => $post,
                "insert" => $insert,
            );
        }
        return $this->response->setJSON($data);
    }
    function getKioskUuid()
    {
        $json = file_get_contents('php://input');
        $post = json_decode($json, true);
        $data = [
            "error" => true,
            "post" => $post,
        ];
        if ($post) {

            $id = $post['terminalId'] .'.'.date("ymd").'.'.model("Core")->number("pos");  

            $this->db->table("cso1_kiosk_uuid")->insert([
                "kioskUuid" => $id,
                "terminalId" => $post['terminalId'],
                "cashierId" => model("Core")->accountId(), 
                "update_date" => date("Y-m-d H:i:s"),
                "input_date" => date("Y-m-d H:i:s"),
                "inputDate" => time(), 
                
            ]);

            if(isset($post['exchange'])){
                $ticket = $post['terminalId'].model("Core")->number("exchange");
 
                $this->db->table("cso1_kiosk_uuid")->update([ 
                    "exchange" => $ticket,
                ]," kioskUuid = '$id' ");

                foreach($post['exchange'] as $row){
                    $insert = [ 
                        "kioskUuid" => $id,
                        "itemId" => model("Core")->select("itemId","cso1_transaction_detail","id='".$row['id']."'"),
                        "barcode" => model("Core")->select("barcode","cso1_transaction_detail","id='".$row['id']."'"),
                        "originPrice" => $row['price'],
                        "price" => -1 * $row['price'],
                        "promotionId" => "0",
                        "input_date" => date("Y-m-d H:i:s"),
                        "inputDate" => time(),
                        "note" => $ticket,
                    ];
                    if($row['checkbox'] == true){
                        $this->db->table("cso1_kiosk_cart")->insert($insert);
                        
                        $this->db->table("cso1_transaction_detail")->update([
                            "exchange" => $ticket,
                        ]," id = '".$row['id']."' ");
                    } 
                }
            }
 
            $data = array(
                "error" => false,
                "id" => $id,
                "post" => $post, 
            );
        }
        return $this->response->setJSON($data);
    }

}