<?php
namespace App\Controllers;

use CodeIgniter\Model;

class Cart extends BaseController
{
    function index()
    {
        $kioskUuid = $this->request->getVar()['kioskUuid'];

        $q1 = "SELECT c.barcode, c.itemId, c.qty, c.promotionId , c.total, c.discount, c.originPrice,
        i.shortDesc, i.description, c.price, c.note
        FROM (
            SELECT k.barcode, k.itemId , COUNT(k.barcode) AS 'qty', k.promotionId,  k.note,
            sum(k.price) AS 'total', sum(k.discount) AS 'discount', k.price, k.originPrice
            FROM cso1_kiosk_cart AS k 
            WHERE k.kioskUuid = '$kioskUuid'  AND k.void = 0 and k.presence = 1
            GROUP BY k.barcode, k.itemId, k.promotionId, k.price, k.originPrice, k.discount
        ) AS c
        LEFT JOIN cso1_item AS i ON  i.id = c.itemId";
        $items = $this->db->query($q1)->getResultArray();

        $i = 0;
        foreach ($items as $row) {
            $items[$i]['promotionDescription'] = model("Core")->select("description", "cso1_promotion", "id = '" . $row['promotionId'] . "'  ");
            $items[$i]['id'] = (int) model("Core")->select("id", "cso1_kiosk_cart", "kioskUuid = '$kioskUuid'  and itemId = '" . $row['itemId'] . "' order by input_date DESC  ");
            
            $i++;
        }

        model("Promo")->orderByID($items);


        $q2 = "SELECT p.id, p.description, i.description AS 'item', f.scanFree, f.printOnBill, 
        c.itemId, c.qty, c.freeItemId, c.freeQty , f.useBykioskUuidId
        FROM cso1_kiosk_cart_free_item  AS f
        JOIN cso1_promotion AS p ON p.id = f.promotionId
        JOIN cso1_promotion_free AS c ON c.id = f.promotionFreeId
        JOIN cso1_item AS i ON i.id = f.freeItemId
        
        WHERE f.kioskUuid = '$kioskUuid'";
        $itemsFree = $this->db->query($q2)->getResultArray();
        $i = 0;
        foreach ($itemsFree as $row) {
            $itemsFree[$i]['freeItem'] = model("Core")->select("description", "cso1_item", "id = '" . $row['freeItemId'] . "'");
            $i++;
        }
        ;

        $kioskUuid = model("Core")->select("kioskUuid", "cso1_kiosk_uuid", "kioskUuid = '$kioskUuid' and presence = 1  ");
        $data = array(
            "kioskUuid" => $kioskUuid,
            "error" => $kioskUuid ? false : true,
            "items" => $kioskUuid ? $items : [],
            "itemsFree" => $itemsFree,
            "ilock" => (int) model("Core")->select("ilock", "cso1_kiosk_uuid", "kioskUuid = '$kioskUuid'  "),
            "bill" => [
                "originPrice" => (int) model("Core")->select("sum(originPrice)", "cso1_kiosk_cart", "presence = 1 and void = 0 and kioskUuid = '$kioskUuid'"),
                "total" => (int) model("Core")->select("sum(price)", "cso1_kiosk_cart", "presence = 1 and void = 0 and kioskUuid = '$kioskUuid'"),
                "discount" => (int) model("Core")->select("sum(discount)", "cso1_kiosk_cart", "presence = 1 and void = 0 and kioskUuid = '$kioskUuid'"),
            ],
        );

        $data['promo_fixed'] = model("Promo")->promo_fixed($data['bill']['total']);

        return $this->response->setJSON($data);
    }

    function getPromo($itemId, $qty = 1)
    {
        return $this->response->setJSON(model("Promo")->getPromo($itemId, $qty));
    }

    function getFreeItem($itemId)
    {

        return $this->response->setJSON(model("promo")->getFreeItem($itemId));
    }

    function addToCart()
    {
        $weight = 1;
        $i = 1;
        $isItem = true;
        $item = [];
        $data = [];
        $freeItem = [];
        $result = "";
        $qty = 0;
        $promo = [];
        $note  = "";
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {
            $barcode = str_replace(["'", "\"",], "", $post['barcode']);

            $cashierId = model("Core")->select("id", "cso1_user", "id = '$barcode' AND userAccessId  = 1 ");
            if ($cashierId != "") {
                $isItem = false;
                $result = "SUPERVISOR";
            }
            /** 
            // CHECK BARCODE 
            2020020006507
            2026539004607
            2020035008381
            */

            $barcode = str_split($post['barcode']);
            $arrItem = model("Core")->barcode($post['barcode']);
            if (count($barcode) >= 13 && $arrItem['prefix'] == 2) {
                $arrItem = model("Core")->barcode($post['barcode']);
                $result = "ITEMS";
                // BARCODE DINAMIC  
                $itemId = model("Core")->select("itemId", "cso1_item_barcode", "barcode = '" . $arrItem['itemId'] . "' and presence = 1");
                $weight = $arrItem['weight'];
                $note = number_format($arrItem['weight'], $arrItem['config']['digitFloat']) . " Kg";


            } else {
                // BARCODE STATIC
                $itemId = model("Core")->select("itemId", "cso1_item_barcode", "barcode = '".$post['barcode']."' ");
            }


            if ($itemId && $isItem == true) {
                $result = "ITEMS";

                $originPrice = model("Core")->select("price$i", "cso1_item", "id = '$itemId' ");
                

                $insert = [
                    "kioskUuid" => $post['kioskUuid'],
                    "itemId" => $itemId,
                    "barcode" => $post['barcode'],
                    "originPrice" => $originPrice,
                    "price" =>  $originPrice,  
                    "promotionId" => "0",
                    "input_date" => date("Y-m-d H:i:s"),
                    "inputDate" => time(),
                    "note" =>  $note,
                ];
        
                $this->db->table("cso1_kiosk_cart")->insert($insert);
                $cartId = model("Core")->select("id","cso1_kiosk_cart"," kioskUuid = '".$post['kioskUuid']."' ORDER BY  id DESC");
                
                
                // PROMOTION_ITEM
                $qty = (int) model("Core")->select("count(id)", "cso1_kiosk_cart", " kioskUuid = '" . $post['kioskUuid'] . "' AND  itemId = '$itemId' ") + 1;
                $promo = model("Promo")->getPromo($itemId, $qty);
               
                if($promo['promotionItemId'] > 0 ){
                    $update = [
                        "kioskUuid" => $post['kioskUuid'],
                        "price" =>  $promo['newPrice'],
                        "isSpecialPrice" => isset($promo['isSpecialPrice']),
                        "promotionId" => isset($promo['promotionId']) ? $promo['promotionId'] : "",
                        "promotionItemId" => isset($promo['promotionItemId']) ? $promo['promotionItemId'] : "",
                        "discount" => $promo['discount'],
                    ]; 
                    $this->db->table("cso1_kiosk_cart")->update( $update," id = $cartId ");
                }
              


                $q1 = "SELECT * FROM cso1_item  WHERE id = '$itemId' ";
                $item = $this->db->query($q1)->getResultArray()[0];
                $item['barcode'] = $barcode;
            }


            //FREE ITEM 
            // $kioskCartId = model("Core")->select("id", "cso1_kiosk_cart", " presence = 1 order by input_date DESC ");
            // $freeItem = model("promo")->getFreeItem($itemId);
            // if ($freeItem['itemId'] != null) {
            //     $insert = array(
            //         "kioskCartId" => $kioskCartId,
            //         "barcode" => $barcode,
            //         "kioskUuid" => $post['kioskUuid'],
            //         "useBykioskUuidId" => 0,
            //         "promotionFreeId" => $freeItem['id'],
            //         "promotionId" => $freeItem['promotionId'],
            //         "freeItemId" => $freeItem['freeItemId'],
            //         "scanFree" => $freeItem['scanFree'],
            //         "printOnBill" => $freeItem['printOnBill'],
            //         "presence" => 1,
            //         "status" => 0,
            //         "inputDate" => time(),
            //         "updateDate" => time(),
            //     );
            //     $this->db->table("cso1_kiosk_cart_free_item")->insert($insert);
            // }

            $item['barcode'] = $post['barcode'];

            $data = array(
                "error" => false,
                "post" => $post,
                "qty" => $qty,
                "promo" => $promo,
                "cashierId" => $cashierId,
                "freeItem" => $freeItem,
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
            for ($n = 0; $n < (int) $post['addQty']; $n++) {
                $this->db->table("cso1_kiosk_cart")->insert([
                    "kioskUuid" => $post['kioskUuid'],
                    "itemId" => $itemid,
                    "barcode" => $post['item']['barcode'],
                    "price" => $post['activeCart']['price'],
                    "discount" => $post['activeCart']['discount'],
                    "promotionId" => $post['activeCart']['promotionId'],
                    "originPrice" => model("Core")->select("price$i", "cso1_item", "id = '$itemid' "),
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

    function fnAdminSubmit()
    {
        $i = 1;
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {
            $id = model("Core")->select("id", "cso1_user", "userAccessId  = 1 and password = '" . md5($post['password']) . "' and id = '" . $post['barcode'] . "' ");

            $data = array(
                "error" => false,
                "post" => $post,
                "id" => $id,
                "pass" => md5($post['password']),
            );
        }

        return $this->response->setJSON($data);
    }

    function detail()
    {
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {
            $kioskUuid = $post['kioskUuid'];
            $q1 = "SELECT c.*, i.description, i.shortDesc FROM cso1_kiosk_cart as c 
            left join cso1_item as i on c.itemId = i.id
            where c.presence = 1 AND c.kioskUuid = '$kioskUuid' AND c.price = '" . $post['item']['price'] . "' AND c.void = 0 AND c.barcode = '" . $post['item']['barcode'] . "'
            ";
            $item = $this->db->query($q1)->getResultArray();
            $data = array(
                "error" => false,
                "items" => $item,
                "post" => $post,
                "detail" => array(
                    "price" => (int) $item[0]['price'],
                    "discount" => (float) $item[0]['discount'],
                    "barcode" => (float) $item[0]['barcode'],
                    "originPrice" => (int) $item[0]['originPrice'],
                )
            );
        }
        return $this->response->setJSON($data);
    }

    function voidCart()
    {
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {

            $this->db->table("cso1_kiosk_cart")->update([
                "void" => 1,
                "presence" => 0,
                "updateDate" => time(),
                "update_date" => date("Y-m-d H:i:s"),
                "updateBy" => "",

            ], "id = " . $post['item']['id']);

            $data = array(
                "error" => false,
                "post" => $post,
            );
        }
        return $this->response->setJSON($data);
    }

    function updatePrice()
    {
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {
            $this->db->table("cso1_kiosk_cart")->update([
                "price" => $post['detail']['price'] - $post['detail']['discount'],
                "discount" => $post['detail']['discount'],
                "isPriceEdit" => 1,
                "updateDate" => time(),
                "update_date" => date("Y-m-d H:i:s"),
                "updateBy" => "",

            ], "barcode = " . $post['detail']['barcode'] . " and kioskUuid =  '" . $post['kioskUuid'] . "' ");


            $data = array(
                "error" => false,
                "post" => $post,
            );
        }
        return $this->response->setJSON($data);
    }

    function fnVoidAllCartItems()
    {
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {
            $this->db->table("cso1_kiosk_cart")->update([
                "void" => 1,
                "presence" => 0,
                "updateDate" => time(),
                "update_date" => date("Y-m-d H:i:s"),
                "updateBy" => "",
            ], "barcode = " . $post['detail']['barcode'] . " and kioskUuid =  '" . $post['kioskUuid'] . "' ");

            $data = array(
                "error" => false,
                "post" => $post,
            );
        }
        return $this->response->setJSON($data);
    }

    function cancelTrans()
    {
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {
            $this->db->table("cso1_kiosk_uuid")->update([
                "presence" => 0,
                "update_date" => date("Y-m-d H:i:s"),
            ], "  kioskUuid =  '" . $post['kioskUuid'] . "' ");

            $this->db->table("cso1_kiosk_cart")->update([
                "void" => 0,
                "presence" => 0,
                "updateDate" => time(),
                "update_date" => date("Y-m-d H:i:s"),
            ], "  kioskUuid =  '" . $post['kioskUuid'] . "' ");

            $data = array(
                "error" => false,
                "post" => $post,
            );
        }
        return $this->response->setJSON($data);
    }

    function goToPayment()
    {
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {
            $this->db->table("cso1_kiosk_uuid")->update([
                "ilock" => 1,
                "update_date" => date("Y-m-d H:i:s"),
            ], "  kioskUuid =  '" . $post['kioskUuid'] . "' ");

            $data = array(
                "error" => false,
                "post" => $post,
            );
        }
        return $this->response->setJSON($data);
    }
}