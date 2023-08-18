<?php

namespace App\Controllers; 
use CodeIgniter\Model; 
use Unsplash\HttpClient;
class Home extends BaseController
{
    public function index()
    {
        $q1 = "SELECT *  FROM auto_number";
        $items = $this->db->query($q1)->getResultArray();

        $data = array(
            "error" => false,
            "items" => $items,
        );
        return $this->response->setJSON($data);
    }
}
