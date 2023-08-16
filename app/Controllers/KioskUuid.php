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
                $insert=true;
            }else{
                $id = $post['kiosUuid'];
            }

            if($insert == true){
                $this->db->table("cso2_parking")->insert([
                    "terminalId" =>  $post['terminalId'],
                    "cashierId" => model("Core")->accountId(),
                    "kioskUuid" => $id ,
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

}