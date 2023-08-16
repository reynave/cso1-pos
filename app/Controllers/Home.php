<?php

namespace App\Controllers; 
use CodeIgniter\Model; 
class Home extends BaseController
{
    public function index()
    {
        $q1 = "SELECT *  FROM autonumber";
        $items = $this->db->query($q1)->getResultArray();

        $data = array(
            "error" => false,
            "items" => $items,
        );
        return $this->response->setJSON($data);
    }
}
