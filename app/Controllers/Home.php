<?php

namespace App\Controllers; 
use CodeIgniter\Model; 
use Unsplash\HttpClient;
class Home extends BaseController
{
    public function index()
    {
        $q1 = "SELECT *  FROM auto_number limit 1";
        $items = $this->db->query($q1)->getResultArray();

        $data = array(
            "error" => false,
            "con" => 200,
            "items" => $items,

        );
        return $this->response->setJSON($data);
    }

 
    public function start()
    {
      
        $data = array(
            "error" => false,
            "cashIn" => (int)model("Core")->select("cashIn","cso2_balance"," close = 0 AND transactionId = '_S1' "), 
            
        );
        return $this->response->setJSON($data);
    }
}
