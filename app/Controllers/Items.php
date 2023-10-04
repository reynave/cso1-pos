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

    function tebusMurah(){
        
        $kioskUuid = $this->request->getVar()['kioskUuid'];
        $total = model("Core")->select("sum(price)","cso1_kiosk_cart","kioskUuid = '$kioskUuid' and presence = 1");
        $totalCart = model("Core")->select("count(id)","cso1_kiosk_cart","promotionId = 'tebusMurah' and kioskUuid = '$kioskUuid' and presence = 1");
       
        $total =  $total > 0 ?  $total :0;
        $totalCart =  $totalCart > 0 ?  $totalCart :0;
         
        $q1 = "SELECT i.id, i.itemId, i.price, t.expDate, t.maxItem,
        t.exp_date, t.minTransaction, t.maxItem, m.description
        FROM cso1_tebus_murah_items AS i 
        LEFT JOIN cso1_tebus_murah AS t ON t.id = i.tembusMurahId
        LEFT JOIN cso1_item AS m ON m.id = i.itemId
        WHERE $total >=  t.minTransaction and  $totalCart < t.maxItem and t.status = 1 
        ";
        $items = $this->db->query($q1)->getResultArray();
        $i=0;
        foreach($items as $row){
            $items[$i]['barcode'] = "";
            $q2 = "SELECT * FROM cso1_item_barcode where itemId = '".$row['itemId']."' ";
            $temp = $this->db->query($q2)->getResultArray();
            foreach($temp as $re){
                $items[$i]['barcode'] .= $re["barcode"].' ';
            } 
            $items[$i]['search'] = $row['itemId'].' '.$row['description'].' '.  $items[$i]['barcode']; 
            $i++;
        }

        $data = array(
            "error" => false,
            "items" => $items, 
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