<?php

namespace App\Controllers;

use CodeIgniter\Model;
use Unsplash\HttpClient;

class Balance extends BaseController
{
    public function index()
    {
        $q1 = "SELECT * FROM cso2_balance  
        where  close = 0 order by input_date ASC";
        $items = $this->db->query($q1)->getResultArray();

        $data = array(
            "error" => false,
            "items" => $items,
        );
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