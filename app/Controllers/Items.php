<?php

namespace App\Controllers;

use CodeIgniter\Model;

class Items extends BaseController
{
    function index()
    {
        $i = 1;
        $search = strtoupper($this->request->getVar()['search']);
        $q1 = "SELECT i.id, i.description, i.price$i , b.barcode
        FROM cso1_item AS i 
        LEFT JOIN cso1_item_barcode AS b ON b.itemId = i.id
        WHERE 
        description LIKE '%$search %' OR 
        shortDesc LIKE '%$search %'     
        ORDER BY description ASC";
        $items = $this->db->query($q1)->getResultArray();

        $data = array(
            "error" => false,
            "items" =>  $items,
            "s" =>  $search,
        );
       
        return $this->response->setJSON($data);
    }
 
}