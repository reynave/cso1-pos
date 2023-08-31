<?php

namespace App\Models;

use CodeIgniter\Model;
use CodeIgniter\CodeIgniter;

class Promo extends Model
{
    protected $id = null;
    protected $db = null;
    protected $request = null;

    function __construct()
    {
        $this->request = \Config\Services::request();
        $this->db = \Config\Database::connect();
    }
    function select($field = "", $table = "", $where = " 1 ")
    {
        $data = null;
        if ($field != "") {
            $query = $this->db->query("SELECT $field  FROM $table WHERE $where LIMIT 1");
            if ($query->getRowArray()) {
                $row = $query->getRowArray();
                $data = $row[$field];
            }
        } else {
            $data = null;
        }
        return $data;
    }
    function getId($itemId = "", $qty = 0)
    {
        $today = date('D', time());
        $q = "SELECT  i.promotionId, i.id AS 'promotionItemId', i.qtyFrom, i.qtyTo, p.typeOfPromotion,
        FROM_UNIXTIME(p.startDate) AS 'startDate', FROM_UNIXTIME(p.endDate) AS 'endDate', NOW() as 'nowDate',  p.$today as '$today' 
        FROM cso1_promotion_item AS i
        LEFT JOIN cso1_promotion AS p ON p.id = i.promotionId
        WHERE i.itemId = '$itemId' AND  p.typeOfPromotion = 1 
        AND (p.startDate < unix_timestamp(now()) AND unix_timestamp(NOW()) <  p.endDate)
        AND ( i.qtyFrom <= $qty AND i.qtyTo >= $qty)
        AND p.$today = 1 AND p.`status` = 1 AND p.presence = 1 AND i.presence = 1 AND i.`status` = 1"; 
        $items = $this->db->query($q)->getResultArray();
 

        $data = array(
            "error" => count($items) > 0 ? false : true,
            "promo" => $items, 
            "q" =>  $q, 
        );

        return $data;
    }

    function getPromo($itemId, $qty = 0)
    {
        $promo = model("promo")->getId($itemId, $qty);
        $i = 1;
        if ($promo['error'] == false) {

            $promotionItemId = $promo['promo'][0]['promotionItemId'];
            $typeOfPromotion = $promo['promo'][0]['typeOfPromotion'];

            $isSpecialPrice = (int) model("Promo")->select("specialPrice", "cso1_promotion_item", "id=$promotionItemId") > 0 ? 1 : 0;
            if ($isSpecialPrice == 1) {
                $newPrice = (int) model("Promo")->select("specialPrice", "cso1_promotion_item", "id=$promotionItemId");
            } else {
                $discountPrice = model("Promo")->select("discountPrice", "cso1_promotion_item", "id=$promotionItemId");

                $discx = [
                    "disc1" => model("Promo")->select("disc1", "cso1_promotion_item", "id=$promotionItemId"),
                    "disc2" => model("Promo")->select("disc2", "cso1_promotion_item", "id=$promotionItemId"),
                    "disc3" => model("Promo")->select("disc3", "cso1_promotion_item", "id=$promotionItemId"),
                ];

                $price = model("Promo")->select("price$i", "cso1_item", "id=$itemId");


                $disc1 = $discx['disc1'] / 100;
                $disc2 = $discx['disc2'] / 100;
                $disc3 = $discx['disc3'] / 100;

                $discLevel1 = $price * $disc1;
                $discLevel2 = ($price - $discLevel1) * $disc2;
                $discLevel3 = ($price - $discLevel1 - $discLevel2) * $disc3;

                $discLevel = $discLevel1 + $discLevel2 + $discLevel3;


                $newPrice = $price - ($discountPrice + $discLevel);

            }
            $data = array(
                "itemId" => $itemId,
                "typeOfPromotion" => $typeOfPromotion,
                "promotionId" => $promo['promo'][0]['promotionId'],
                "promotionItemId" => $promotionItemId,  
                "newPrice" => (int) $newPrice,
                "isSpecialPrice" => $isSpecialPrice > 0 ? 1 : 0,
                "discount" => $isSpecialPrice == 1 ? 0 : $discountPrice + $discLevel,
                "promoDetail" => $promo,
            );


        } else {
            $data = array(
                "itemid" => null,
                "typeOfPromotion" => 0,
                "promotionId" => 0,
                "promotionItemId" => 0,
                "newPrice" => 0,
                "isSpecialPrice" => 0,
                "discount" => 0,
            );
        }
        return $data;
    }


    function getFreeItem($itemId) {
        $today = date('D', time());
        $q2 = "SELECT   i.id AS 'promotionItemId', i.*,
        p.typeOfPromotion,
        FROM_UNIXTIME(p.startDate) AS 'startDate', FROM_UNIXTIME(p.endDate) AS 'endDate', 
        NOW() as 'nowDate',  p.$today as '$today' 
        FROM cso1_promotion_free AS i
        LEFT JOIN cso1_promotion AS p ON p.id = i.promotionId
        WHERE i.itemId = '$itemId' AND  p.typeOfPromotion = 2 
        AND (p.startDate < unix_timestamp(now()) AND unix_timestamp(NOW()) <  p.endDate)
     
        AND p.$today = 1 AND p.`status` = 1 AND p.presence = 1 AND i.presence = 1 AND i.`status` = 1"; 
        $free = $this->db->query($q2)->getResultArray();
        if(!count($free)){
            $data = [
                "itemId"=> null,
            ];

        }else{
            $data = $free[0];
        }

        return   $data;
    }


    function orderByID(&$array) {
        $length = count($array);
    
        for ($i = 0; $i < $length - 1; $i++) {
            for ($j = 0; $j < $length - $i - 1; $j++) {
                if ($array[$j]['id'] > $array[$j + 1]['id']) {
                    // Tukar posisi elemen jika id lebih besar
                    $temp = $array[$j];
                    $array[$j] = $array[$j + 1];
                    $array[$j + 1] = $temp;
                }
            }
        }
    }
}