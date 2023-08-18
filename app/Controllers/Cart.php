<?php

namespace App\Controllers;

use CodeIgniter\Model;

class Cart extends BaseController
{
    function index()
    {
        $kioskUuid = $this->request->getVar()['kioskUuid'];

        $q1 = "SELECT c.*, i.shortDesc, c.price
        FROM (
        SELECT k.barcode, k.itemId , COUNT(k.barcode) AS 'qty', 
        sum(k.originPrice) AS 'total', sum(k.discount) AS 'discount', k.price
        FROM cso1_kiosk_cart AS k 
        WHERE k.kioskUuid = '$kioskUuid'  AND k.void = 0 
        GROUP BY k.price, k.barcode, k.discount) AS c
        LEFT JOIN cso1_item AS i ON  i.id = c.itemId";
        $items = $this->db->query($q1)->getResultArray();


        $data = array(
            "error" => false,
            "items" => $items,
        );
        return $this->response->setJSON($data);
    }

    function addToCart()
    {
        $i = 1;
        $isItem = true;
        $item = [];
        $data = [];
        $result = "";
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {
            $barcode = str_replace(["'", "\"",], "", $post['barcode']);

            $cashierId = model("Core")->select("id", "cso2_cashier", "id = '$barcode' AND supervisor  = 1 ");
            if($cashierId != ""){
                $isItem = false;
                $result  = "SUPERVISOR";
            }
            /** 
            // CHECK BARCODE 
            $barcode = str_split($post['barcode']); 
            $arrItem = $this->model->barcode($post['barcode']);
            if(count($barcode) >= 13 &&  $arrItem['prefix'] == 2  ){
                $arrItem = $this->model->barcode($post['barcode']); 
                
                    // BARCODE DINAMIC  
                    $itemId = $this->model->select("itemId", "cso1_itemBarcode", "barcode = '" .  $arrItem['itemId'] . "' and presence = 1"); 
                    $weight = $arrItem['weight']; 
                    $note = number_format($arrItem['weight'],$arrItem['config']['digitFloat'])." Kg";
                
                
            }else{
                // BARCODE STATIC
                $itemId = $this->model->select("itemId", "cso1_itemBarcode", "barcode = '" . $post['barcode'] . "' and presence = 1");  
            }
            */


            $itemId = model("Core")->select("itemId", "cso1_item_barcode", "barcode = '$barcode' ");

            if ($itemId && $isItem == true) {
                $result  = "ITEMS";
                $this->db->table("cso1_kiosk_cart")->insert([
                    "kioskUuid" => $post['kioskUuid'],
                    "itemId" => $itemId,
                    "barcode" => $post['barcode'],
                    "originPrice" => model("Core")->select("price$i", "cso1_item", "id = '$itemId' "),
                    "price" => model("Core")->select("price$i", "cso1_item", "id = '$itemId' "),
                    "discount" => 0,
                    "input_date" => date("Y-m-d H:i:s")
                ]);
                $q1 = "SELECT *
                FROM cso1_item
                WHERE id = '$itemId' ";
                $item = $this->db->query($q1)->getResultArray()[0];
                $item['barcode'] = $barcode;
            }

            $data = array(
                "error" => false,
                "post" => $post,
                "cashierId" => $cashierId,
                "item" => $item,
                "result" => $result,
            );
        }

        return $this->response->setJSON($data);
    }

    function onSubmitQty()
    {
        $i = 1;
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {
            $itemid = $post['item']['itemId'];
            for ($n = 0; $n < (int)$post['addQty']; $n++) { 
                $this->db->table("cso1_kiosk_cart")->insert([
                    "kioskUuid" => $post['kioskUuid'],
                    "itemId" => $itemid,
                    "barcode" => $post['item']['barcode'],
                    "originPrice" => model("Core")->select("price$i", "cso1_item", "id = '$itemid' "),
                    "price" => model("Core")->select("price$i", "cso1_item", "id = '$itemid' "),
                    "discount" => 0,
                    "input_date" => date("Y-m-d H:i:s")
                ]);
            }
            $data = array(
                "error" => false,
                "post" => $post,
            );
        }

        return $this->response->setJSON($data);
    }
}