<?php

namespace App\Controllers;

use CodeIgniter\Model;

class Parking extends BaseController
{
    function index()
    {
        $q1 = "SELECT * FROM cso1_kiosk_uuid where presence = 1 order by input_date ASC";
        $items = $this->db->query($q1)->getResultArray();

        $data = array(
            "error" => false,
            "items" =>  $items,
            "parkingTotal" => count($items),
        );
       
        return $this->response->setJSON($data);
    }
 
}