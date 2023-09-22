<?php

namespace App\Controllers;

use CodeIgniter\Model;
use Unsplash\HttpClient;

class Setting extends BaseController
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

    function getFunc()  { 
        $id  =model("Core")->accountId();
        $data = array(
            "error" => false,
            "saveFunc" => model("Core")->select("saveFunc","cso1_user","id = '$id'"),
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
            $accountId = model("Core")->accountId();
            $this->db->table("cso1_user")->update([
                "saveFunc" => $post['saveFunc'], 
                "updateDate" => time(),
                "update_date" => date("Y-m-d H:i:s")
            ]," id =  '$accountId' ");

            $data = array(
                "error" => false,
                "post" => $post,
            );
        }

        return $this->response->setJSON($data);
    }
}