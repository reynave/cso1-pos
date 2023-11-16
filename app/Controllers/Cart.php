<?php
namespace App\Controllers;

use CodeIgniter\Model;

class Cart extends BaseController
{
    function index()
    {
        $kioskUuid = $this->request->getVar()['kioskUuid'];

        $q1 = "SELECT c.barcode, c.itemId, c.qty, c.promotionId , c.total, c.discount, c.originPrice,
        i.shortDesc, i.description, c.price, '' as promotionFreeId
        FROM (
            SELECT k.barcode, k.itemId , COUNT(k.barcode) AS 'qty', k.promotionId, 
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
            $items[$i]['id'] = (int) model("Core")->select("inputDate", "cso1_kiosk_cart", "kioskUuid = '$kioskUuid'  and itemId = '" . $row['itemId'] . "' order by input_date DESC  ");

            $i++;
        }

        $q2 = " 
        SELECT c.barcode, c.itemId, c.qty, c.promotionId , c.total, c.discount, i.price1 AS 'originPrice',
        i.shortDesc, i.description, c.price, '' AS 'note' , c.promotionFreeId
        FROM (
            SELECT f.freeItemId AS 'barcode', f.freeItemId AS 'itemId' , count(id) AS 'qty', f.promotionId, 0 AS 'price',
            0 AS 'total', 0 AS 'discount',0 AS 'originPrice' , f.promotionFreeId
            FROM cso1_kiosk_cart_free_item AS f 
            WHERE f.kioskUuid =  '$kioskUuid'
            group BY f.freeItemId , f.promotionFreeId, f.promotionId
        ) AS c
        LEFT JOIN cso1_item AS i ON i.id = c.itemId
        ";
        $freeItem = $this->db->query($q2)->getResultArray();

        $i = 0;
        foreach ($freeItem as $row) {
            $freeItem[$i]['promotionDescription'] = model("Core")->select("description", "cso1_promotion", "id = '" . $row['promotionId'] . "'  ") . " ORIGIN";
            $freeItem[$i]['id'] = (int) model("Core")->select("inputDate", "cso1_kiosk_cart_free_item", "kioskUuid = '$kioskUuid'  and freeItemId = '" . $row['itemId'] . "' order by inputDate DESC  ");
            $i++;
        }


        $items = array_merge($items, $freeItem);

        model("Promo")->orderByID($items);
        $kioskUuid = model("Core")->select("kioskUuid", "cso1_kiosk_uuid", "kioskUuid = '$kioskUuid' and presence = 1  ");

        $totalTebusMurah = model("Core")->select("count(id)", "cso1_kiosk_cart", "promotionId = 'tebusMurah' and kioskUuid = '$kioskUuid' and presence = 1  ");

        $data = array(
            "kioskUuid" => $kioskUuid,
            "error" => $kioskUuid ? false : true,
            "items" => $kioskUuid ? $items : [],
            "ilock" => (int) model("Core")->select("ilock", "cso1_kiosk_uuid", "kioskUuid = '$kioskUuid'  "),
            "bill" => [
                "originPrice" => (int) model("Core")->select("sum(originPrice)", "cso1_kiosk_cart", "presence = 1 and void = 0 and kioskUuid = '$kioskUuid'"),
                "total" => (int) model("Core")->select("sum(price)", "cso1_kiosk_cart", "presence = 1 and void = 0 and kioskUuid = '$kioskUuid'"),
                "discount" => (int) model("Core")->select("sum(discount)", "cso1_kiosk_cart", "presence = 1 and void = 0 and kioskUuid = '$kioskUuid'"),
            ],
            "freeItem" => $freeItem,
            "totalTebusMurah" => $totalTebusMurah
        );

        $data['promo_fixed'] = model("Promo")->promo_fixed($data['bill']['total'], isset($this->request->getVar()['step']));



        // $data['bill']['total']
        $tb = model("Core")->select("count(id)", "cso1_tebus_murah", "status= 1 and  " . $data['bill']['total'] . " >=  minTransaction");

        $data['tebus_murah'] = $tb > 0 ? '<i class="bi bi-check"></i>Tersedia tebus murah' : '';

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

    function addTebusMurah()
    {
        $i = 1;
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {

            $this->db->table("cso1_kiosk_cart")->insert([
                "kioskUuid" => $post['kioskUuid'],
                "promotionId" => "tebusMurah",
                "itemId" => $post['item']['itemId'],
                "barcode" => $post['item']['itemId'],

                "originPrice" => model("Core")->select("price1", "cso1_item", "id = '" . $post['item']['itemId'] . "' "),
                "price" => $post['item']['price'],
                "presence" => 1,
                "inputDate" => time(),
                "input_date" => date("Y-m-d H:i:s"),
            ]);

            $data = array(
                "error" => false,
                "post" => $post,
            );
        }

        return $this->response->setJSON($data);
    }

    function addToCart()
    {
        $getPromoFree = "";
        $freeItemMod = "";
        $qtyItemId = 0;
        $weight = 1;
        $i = 1;
        $isItem = true;
        $item = [];
        $data = [];
        $freeItem = [];
        $result = "";
        $qty = 0;
        $promo = [];
        $note = "";
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
            CHECK BARCODE 
            2020020006507             2026539004607            2020035008381
            */

            $barcode = str_split($post['barcode']);
            $arrItem = model("Core")->barcode($post['barcode']);

            if (count($barcode) >= 13 && $arrItem['prefix'] == 2) {
                $result = "ITEMS";
                $arrItem = model("Core")->barcode($post['barcode']);

                // BARCODE DINAMIC  
                $itemId = model("Core")->select("itemId", "cso1_item_barcode", "barcode = '" . $arrItem['itemId'] . "' and presence = 1");
                $weight = $arrItem['weight'];
                $note = number_format($arrItem['weight'], $arrItem['config']['digitFloat']) . " Kg";
            } else {
                // BARCODE STATIC
                $itemId = model("Core")->select("itemId", "cso1_item_barcode", "barcode = '" . $post['barcode'] . "' ");
            }

            if ($itemId && $isItem == true) {
                $result = "ITEMS";
                $originPrice = model("Core")->select("price$i", "cso1_item", "id = '$itemId' ");

                $insert = [
                    "kioskUuid" => $post['kioskUuid'],
                    "itemId" => $itemId,
                    "barcode" => $post['barcode'],
                    "originPrice" => $originPrice,
                    "price" => $originPrice,
                    "promotionId" => "0",
                    "input_date" => date("Y-m-d H:i:s"),
                    "inputDate" => time(),
                    "note" => $note,
                ];

                $this->db->table("cso1_kiosk_cart")->insert($insert);
                $kioskCartId = model("Core")->select("id", "cso1_kiosk_cart", " kioskUuid = '" . $post['kioskUuid'] . "' ORDER BY  id DESC");


                // PROMOTION_ITEM 
                $qty = (int) model("Core")->select("count(id)", "cso1_kiosk_cart", " kioskUuid = '" . $post['kioskUuid'] . "' AND  itemId = '$itemId' ") + 1;
                $promo = model("Promo")->getPromo($itemId, $qty);
                if ($promo['promotionItemId'] > 0) {
                    $update = [
                        "kioskUuid" => $post['kioskUuid'],
                        "price" => $promo['newPrice'],
                        "isSpecialPrice" => isset($promo['isSpecialPrice']),
                        "promotionId" => isset($promo['promotionId']) ? $promo['promotionId'] : "",
                        "promotionItemId" => isset($promo['promotionItemId']) ? $promo['promotionItemId'] : "",
                        "discount" => $promo['discount'],
                    ];
                    $this->db->table("cso1_kiosk_cart")->update($update, " id = $kioskCartId ");
                }
                // END >> PROMOTION_ITEM

                // PROMOTION_FREE 
                $getPromoFree = model("Promo")->getPromoFree($itemId);
                $qtyItemId = model("Core")->select("count(id)", "cso1_kiosk_cart", "itemId = '$itemId' and presence = 1");

                $freeItem = model("Promo")->getFreeItem($itemId, $qty);
                $freeItemMod = 1;
                if (isset($getPromoFree)) {
                    if ($getPromoFree['qty'] > 0) {
                        $freeItemMod = $qtyItemId % $getPromoFree['qty'];
                    }
                }
                if (isset($freeItem[0]) && $freeItemMod == 0) {
                    $freeItem = $freeItem[0];
                    for ($i = 0; $i < $freeItem['freeQty']; $i++) {
                        $insert = array(
                            "kioskCartId" => $kioskCartId,
                            "barcode" => $post['barcode'],
                            "kioskUuid" => $post['kioskUuid'],
                            "useBykioskUuidId" => 0,
                            "promotionFreeId" => $freeItem['id'],
                            "promotionId" => $freeItem['promotionId'],
                            "freeItemId" => $freeItem['freeItemId'],
                            "scanFree" => $freeItem['scanFree'],
                            "printOnBill" => $freeItem['printOnBill'],
                            "presence" => 1,
                            "status" => 0,
                            "inputDate" => time(),
                            "updateDate" => time(),
                        );
                        $this->db->table("cso1_kiosk_cart_free_item")->insert($insert);
                    }
                    $update = [
                        "promotionFreeId" => $kioskCartId,
                        "updateDate" => time(),
                        "note" => "Get Promo Free Item"
                    ];
                    $this->db->table("cso1_kiosk_cart")->update($update, "id = '$kioskCartId' ");
                }

                $q1 = "SELECT * FROM cso1_item  WHERE id = '$itemId' ";
                $item = $this->db->query($q1)->getResultArray()[0];
                $item['barcode'] = $barcode;
            }

            $item['barcode'] = $post['barcode'];

            $data = array(
                "error" => false,
                "post" => $post,
                "qty" => $qty,
                "promo" => $promo,
                "cashierId" => $cashierId,
                "item" => $item,
                "result" => $result,
                "freeItem" => $freeItem,
                "getPromoFree" => $getPromoFree,
                "freeItemMod" => $freeItemMod,
                "qtyItemId" => $qtyItemId,
            );
        }

        return $this->response->setJSON($data);
    }

    function exchange()
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
        $note = "";
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {

            $itemId = model("Core")->select("itemId", "cso1_item_barcode", "barcode = '" . $post['barcode'] . "' ");

            if ($itemId && $isItem == true) {
                $result = "ITEMS";
                $originPrice = model("Core")->select("price$i", "cso1_item", "id = '$itemId' ");
                $ticket = $post['terminalId'] . model("Core")->number("exchange");
                $kioskUuid = $post['terminalId'] . '.' . date("ymd") . '.' . model("Core")->number("pos");

                $this->db->table("cso1_kiosk_uuid")->insert([
                    "kioskUuid" => $kioskUuid,
                    "exchange" => $ticket,
                    "terminalId" => $post['terminalId'],
                    "cashierId" => model("Core")->accountId(),
                    "update_date" => date("Y-m-d H:i:s"),
                    "input_date" => date("Y-m-d H:i:s"),
                    "inputDate" => time(),
                ]);
                $deff = $originPrice - $post['totalExchange'];
                $insert = [
                    "kioskUuid" => $kioskUuid,
                    "itemId" => $itemId,
                    "barcode" => $post['barcode'],
                    "originPrice" => $originPrice,
                    "price" => $deff < 0 ? 0 : $deff,
                    "promotionId" => "0",
                    "input_date" => date("Y-m-d H:i:s"),
                    "inputDate" => time(),
                    "note" => "note 123",
                ];
                $this->db->table("cso1_kiosk_cart")->insert($insert);
            }

            $item['barcode'] = $post['barcode'];

            $data = array(
                "error" => false,
                "post" => $post,
                "ticket" => $ticket,
                "kioskUuid" => $kioskUuid,
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
            where c.presence = 1 AND c.kioskUuid = '$kioskUuid' AND c.price = '" . $post['item']['price'] . "' 
            AND c.void = 0 AND c.itemId = '" . $post['item']['itemId'] . "'
            ";
            $item = $this->db->query($q1)->getResultArray();

            $itemId = $post['item']['itemId'];
            $getPromoFree = model("Promo")->getPromoFree($itemId);
            $totalItem = count($item);
            $data = array(
                "getPromoFree" => $getPromoFree,
                "error" => false,
                "items" => $item,
                "post" => $post,
                "detail" => array(
                    "price" => (int) $item[0]['price'],
                    "discount" => (float) $item[0]['discount'],
                    "barcode" => (float) $item[0]['barcode'],
                    "originPrice" => (int) $item[0]['originPrice'],
                ),
                "freeItemQty" => $getPromoFree['qty'] != false ? $getPromoFree['freeQty'] * (int) ($totalItem / $getPromoFree['qty']) : 0,

            );
        }
        return $this->response->setJSON($data);
    }
    private function auditFreeItem($itemId, $kioskUuid, $price)
    {
        $q1 = "SELECT c.*, i.description, i.shortDesc 
        FROM cso1_kiosk_cart as c 
        left join cso1_item as i on c.itemId = i.id
        where c.presence = 1 AND c.kioskUuid = '$kioskUuid' AND c.price = '" . $price . "'
         AND c.void = 0 AND c.itemId = '" . $itemId . "' ";

        $item = $this->db->query($q1)->getResultArray();
        $totalItem = count($item);
        $getPromoFree = model("Promo")->getPromoFree($itemId);
        $freeItemQty = $getPromoFree['qty'] != false ? $getPromoFree['freeQty'] * (int) ($totalItem / $getPromoFree['qty']) : 0;
        return $freeItemQty;
    }

    function voidCart()
    {
        $updateFreeItem = 0;
        $freeItemQty = 0;
        $promotionFree = 0;
        $totalCartFreeItem = 0;

        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {
            $checkTebusMurah = model("Core")->select("count(id)", "cso1_kiosk_cart", "kioskUuid = '" . $post['item']['kioskUuid'] . "' and promotionId = 'tebusMurah' and void = 0 and presence = 1 ");

            $isItemTebusMurah = model("Core")->select("id", "cso1_kiosk_cart", "id = '" . $post['item']['id'] . "' AND promotionId = 'tebusMurah' ");
            if ($isItemTebusMurah) {
                $this->db->table("cso1_kiosk_cart")->update([
                    "void" => 0,
                    "presence" => 0,
                    "updateDate" => time(),
                    "update_date" => date("Y-m-d H:i:s"),
                    "updateBy" => "",
                ], "id = " . $post['item']['id'] . " and  promotionId = 'tebusMurah' ");
            } else {
                if ($checkTebusMurah <= 0) {
                    $this->db->table("cso1_kiosk_cart")->update([
                        "void" => 0,
                        "presence" => 0,
                        "updateDate" => time(),
                        "update_date" => date("Y-m-d H:i:s"),
                        "updateBy" => "",
                    ], "id = " . $post['item']['id']);

                    $freeItemQty = self::auditFreeItem($post['item']['itemId'], $post['item']['kioskUuid'], $post['item']['price']);
                    $updateFreeItem = false;
                    $promotionFree = [];
                    $totalCartFreeItem = 0;
                    $promotionFree = model("Promo")->getPromoFree($post['item']['itemId']);
                    if (isset($promotionFree['promotionId'])) {
                        $totalCartFreeItem = (int) model("Core")->select("count(id)", "cso1_kiosk_cart_free_item", " promotionId = '" . $promotionFree['promotionId'] . "'  AND promotionFreeId = '" . $promotionFree['promotionFreeId'] . "'  AND barcode = '" . $post['item']['itemId'] . "' and presence = 1");

                    }

                    if ($freeItemQty >= 0 && $promotionFree) {
                        $updateFreeItem = true;

                        if ($totalCartFreeItem > $freeItemQty) {
                            for ($i = 0; $i < ($totalCartFreeItem - $freeItemQty); $i++) {
                                $id = model("Core")->select("id", "cso1_kiosk_cart_free_item", " promotionId = '" . $promotionFree['promotionId'] . "'  AND promotionFreeId = '" . $promotionFree['promotionFreeId'] . "'  AND barcode = '" . $post['item']['itemId'] . "' and presence = 1 order by id DESC");
                                $this->db->table("cso1_kiosk_cart_free_item")->delete(" id = $id");
                            }
                        }
                    }
                }
            }

            $data = array(
                "error" => false,
                "post" => $post,
                "updateFreeItem" => $updateFreeItem,
                "freeItemQty" => $freeItemQty,
                "promotionFree" => $promotionFree,
                "totalCartFreeItem" => $totalCartFreeItem,
            );
        }
        return $this->response->setJSON($data);
    }
    function fnReduceCart()
    {
        $post = json_decode(file_get_contents('php://input'), true);
        $data = array(
            "error" => true,
            "post" => $post,
        );
        if ($post) {

            $kioskUuid = $post['kioskUuid'];
            $itemId = $post['item']['itemId'];
            $barcode = $post['item']['barcode'];
            $price = $post['item']['price'];
            
            $where = " presence = 1 and kioskUuid = '$kioskUuid' and itemId = '$itemId' and barcode = '$barcode' AND  price = '$price' ";

            $total = model("Core")->select("count(id)", "cso1_kiosk_cart", $where) - $post['addQty'];
            for ($i = 0; $i < $total; $i++) {
                $id = model("Core")->select("id", "cso1_kiosk_cart", $where);
                $this->db->table("cso1_kiosk_cart")->update([
                    "void" => 0,
                    "presence" => 0,
                ], " id = $id ");
            }

            $data = array(
                "error" => false,
                "post" => $post,
                "total" => $total,
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
                "price" => $post['activeCart']['price'],
                "discount" => 0,
                "isPriceEdit" => 1,
                "updateDate" => time(),
                "update_date" => date("Y-m-d H:i:s"),
                "updateBy" => "",

            ], "barcode = " . $post['activeCart']['barcode'] . " AND price < 2 AND kioskUuid =  '" . $post['kioskUuid'] . "' ");


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

    function removeItem()
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
                "update_date" => date("Y-m-d H:i:s"),
            ], "  kioskUuid =  '" . $post['kioskUuid'] . "' 
                AND  itemId = '".$post['activeCart']['itemId']."' 
                AND  barcode = '".$post['activeCart']['barcode']."'
                AND  price = '".$post['activeCart']['price']."' 
            ");

            $data = array(
                "error" => false,
                "post" => $post,
            );
        }
        return $this->response->setJSON($data);
    }
}