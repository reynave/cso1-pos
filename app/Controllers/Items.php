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

    function tebusMurah()
    {

        $kioskUuid = $this->request->getVar()['kioskUuid'];
        $total = model("Core")->select("sum(price)", "cso1_kiosk_cart", "kioskUuid = '$kioskUuid' and presence = 1");
        $totalCart = model("Core")->select("count(id)", "cso1_kiosk_cart", "promotionId = 'tebusMurah' and kioskUuid = '$kioskUuid' and presence = 1");

        $total = $total > 0 ? $total : 0;
        $totalCart = $totalCart > 0 ? $totalCart : 0;
         $maxItem = (int) model("Core")->select("SUM(maxItem)", "cso1_tebus_murah", "minTransaction <= $total and status = 1 and presence = 1 ");
        $items = [];
        $q1 = null;
        if ( $totalCart < $maxItem) {
 
            $q1 = "SELECT i.id, i.itemId, i.price, t.expDate, t.maxItem,
                t.exp_date, t.minTransaction, t.maxItem, m.description
                FROM cso1_tebus_murah_items AS i 
                LEFT JOIN cso1_tebus_murah AS t ON t.id = i.tembusMurahId
                LEFT JOIN cso1_item AS m ON m.id = i.itemId
                WHERE $total >=  t.minTransaction   and t.status = 1 and t.presence = 1
                ";
            $items = $this->db->query($q1)->getResultArray();
            $i = 0;
            foreach ($items as $row) {
                $items[$i]['barcode'] = "";

                //SELECT itemId, COUNT(itemId) AS 'total' FROM cso1_kiosk_cart 
                // WHERE promotionId = 'tebusMurah' AND presence =1 AND kioskUuid = 'T02.231004.0058'
                // GROUP BY itemId
                $where = " presence = 1 AND itemId = '" . $row['itemId'] . "' AND promotionId = 'tebusMurah' AND presence =1 AND kioskUuid = '$kioskUuid' GROUP BY itemId ";
                $items[$i]['inCart'] = (int) model("Core")->select("COUNT(itemId)", "cso1_kiosk_cart", $where);

                $q2 = "SELECT * FROM cso1_item_barcode where itemId = '" . $row['itemId'] . "' ";
                $temp = $this->db->query($q2)->getResultArray();
                foreach ($temp as $re) {
                    $items[$i]['barcode'] .= $re["barcode"] . ' ';
                }
                $items[$i]['searchable'] = $row['itemId'] . ' ' . $row['description'] . ' ' . $items[$i]['barcode'];
                $i++;
            }

        }

        $data = array(
            "maxItem" => (int) model("Core")->select("SUM(maxItem)", "cso1_tebus_murah", "minTransaction <= $total and status = 1 and presence = 1 "),
            "error" => false,
            "items" => $items,
            "q1" => $q1,
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
            ], " pos = 'pos' ");
        }
    }

}