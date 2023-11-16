<?php

namespace App\Controllers;

use CodeIgniter\Model;
use Unsplash\HttpClient;

class Func extends BaseController
{
    function index()
    {
        $userId = model("Core")->accountId();
        $q1 = "SELECT * FROM cso1_user_func  
        where  userId = '$userId' ";
        $items = $this->db->query($q1)->getResultArray();
        $data = array(
            "error" => false,
            "items" => $items,
        );
        return $this->response->setJSON($data);
    }


    function saveFunc()
    {
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {
            foreach ($post['items'] as $items) {
 
                $this->db->table("cso1_user_func")->update([
                    "number" => $items['number'],
                ], " id = '" . $items['id'] . "'  ");
            }
            $data = array(
                "error" => false,
                "post" => $post,
            );
        }

        return $this->response->setJSON($data);
    }

    function onCashIn()
    {
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {
            $this->db->table("cso2_balance")->insert([
                "cashIn" => $post['cashIn'],
                "transactionid" => "_S1",
                "terminalId" => $post['terminalId'],
                "cashierId" => model("Core")->accountId(),
                "input_date" => date("Y-m-d H:i:s")
            ]);

            $data = array(
                "error" => false,
                "post" => $post,
            );
        }

        return $this->response->setJSON($data);
    }
}