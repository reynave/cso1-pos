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
            "items" => $items,
            "s" => $search,
        );

        return $this->response->setJSON($data);
    }

    function endOfDay()
    { 
        $json = file_get_contents('php://input');
        $post = json_decode($json, true);
        $data = [
            "error" => true,
            "post" => $post,
        ];
        if ($post) {
            $this->db->table("auto_number")->update([
                "runninNumber" => 0
            ]," pos = 'pos' ");
        }
    }

}