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
            "items" => $items
        );
        return $this->response->setJSON($data);
    }
}
