<?php

namespace App\Controllers;

use CodeIgniter\Model;
use Unsplash\HttpClient;

class Printing extends BaseController
{
    public function index()
    {
        $q1 = "SELECT t.*, u.name  FROM cso1_transaction as t
        join cso1_user as u on u.id = t.cashierId
        where t.presence  = 1 and t.locked = 1 order by t.inputDate DESC";
        $items = $this->db->query($q1)->getResultArray();

        $data = array(
            "error" => false,
            "items" => $items,
        );
        return $this->response->setJSON($data);
    }

    function detail()
    {
        $data = [];

        $id = str_replace(["'", '"', "-"], "", $this->request->getVar()['id']);
        if ($id) {
            $isId = model("Core")->select("endDate", "cso1_transaction", "id='" . $id . "'");

            $items = model("Core")->sql("SELECT t1.*, i.description, i.shortDesc, i.id as 'itemId'
            FROM (
                SELECT count(td.itemId) as qty, td.itemId, sum(td.price - td.discount) as 'totalPrice', td.price, td.barcode,
                sum(td.isSpecialPrice) as 'isSpecialPrice', sum(td.discount) as 'totalDiscount', td.note, td.promotionId
                from cso1_transaction_detail as td
                where td.presence = 1 and td.void = 0 and td.transactionId = '$id' and td.isFreeItem = 0
                group by td.itemId, td.price, td.note , td.barcode, td.promotionId
            ) as t1
            JOIN cso1_item as i on i.id = t1.itemId
            ORDER BY i.description ASC
            ");
            $i = 0;
            foreach ($items as $row) {
                $items[$i]['promotionDescription'] = model("Core")->select("description", "cso1_promotion", "id = '" . $row['promotionId'] . "'  ");
                $items[$i]['id'] = (int) model("Core")->select("id", "cso1_transaction_detail", "transactionId = '$id'  and itemId = '" . $row['itemId'] . "' order by inputDate DESC  ");

                $i++;
            }
            model("Promo")->orderByID($items);


            $data = array(
                "id" => $id,
                "printable" => $isId ? true : false,
                "date" => model("Core")->select("endDate", "cso1_transaction", "id='" . $id . "'"),
                "detail" => $isId ? model("Core")->sql("SELECT t.*, p.label as 'paymentName' 
                from cso1_transaction  as t
                left join cso1_payment_type as p on p.id = t.paymentTypeId
                where t.id= '" . $id . "' ")[0] : [],

                "items" => $items,
                "freeItem" => model("Core")->sql(" SELECT t1.*, i.description, i.shortDesc, i.id as 'itemId'
                    from (
                        select count(td.itemId) as qty, td.itemId, sum(td.isPrintOnBill) as printOnBill
                        from cso1_transaction_detail as td
                        where td.presence = 1 and td.void = 0 and td.transactionId = '$id' and td.isFreeItem = 1
                        group by td.itemId, td.price, td.isPrintOnBill
                    ) as t1
                    JOIN cso1_item as i on i.id = t1.itemId
                    ORDER BY i.description
                "),
                "freeItemWaitingScanFail" => model("Core")->sql(" SELECT t1.*, i.description, i.shortDesc, i.id as 'itemId'
                    from (
                        select count(td.itemId) as qty, td.itemId, sum(td.isPrintOnBill) as printOnBill
                        from cso1_transaction_detail as td
                        where td.presence = 2 and td.transactionId = '$id' and td.isFreeItem = 1
                        group by td.itemId, td.price, td.isPrintOnBill
                    ) as t1
                    JOIN cso1_item as i on i.id = t1.itemId
                    ORDER BY i.description
                "),
                "summary" => array(
                    "nonBkp" => (int) model("Core")->select("nonBkp", "cso1_transaction", "id='$id'"),
                    "bkp" => (int) model("Core")->select("bkp", "cso1_transaction", "id='$id'"),
                    "discount" => (int) model("Core")->select("discount", "cso1_transaction", "id='$id'"),
                    "dpp" => (int) model("Core")->select("dpp", "cso1_transaction", "id='$id'"),
                    "discountMember" => (int) model("Core")->select("discountMember", "cso1_transaction", "id='$id'"),
                    "ppn" => (int) model("Core")->select("ppn", "cso1_transaction", "id='$id'"),
                    "total" => (int) model("Core")->select("total", "cso1_transaction", "id='$id'"),
                    "voucher" => (int) model("Core")->select("voucher", "cso1_transaction", "id='$id'"),
                    "final" => (int) model("Core")->select("finalPrice", "cso1_transaction", "id='$id'"),
                ),
                "paymentMethod" => model("Core")->sql("SELECT tp.id, tp.amount,  p.label, tp.input_date
                FROM cso1_transaction_payment AS tp 
                LEFT JOIN cso1_payment_type AS p ON p.id = tp.paymentTypeId
                WHERE tp.transactionId = '$id' AND tp.presence = 1"),

                "balance" => model("Core")->sql("SELECT SUM(cashIn) AS 'caseIn', SUM(cashOut)*-1 AS 'caseOut'
                    FROM cso2_balance 
                    WHERE transactionId = '$id'
                    GROUP BY transactionId 
                "),

                "template" => array(
                    "companyName" => model("Core")->select("value", "cso1_account", "name='companyName'"),
                    "companyAddress" => model("Core")->select("value", "cso1_account", "name='companyAddress'"),
                    "companyPhone" => 'Telp : ' . model("Core")->select("value", "cso1_account", "name='companyPhone'"),
                    "footer" => model("Core")->select("value", "cso1_account", "id='1007'"),
                ),
                "copy" => (int) model("Core")->sql(" select count(id) as 'copy' from cso1_transaction_printlog where transactionId ='$id'")[0]['copy'],

            );


        }
        return $this->response->setJSON($data);
    }

    function copyPrinting()
    {
        $data = [];
        $id = str_replace(["'", '"', "-"], "", $this->request->getVar()['id']);
        if ($id) {
            $isId = model("Core")->select("endDate", "cso1_transaction", "id='" . $id . "'");
            if ($isId) {
                $this->db->table("cso1_transaction_printlog")->insert([
                    "transactionId" => $id,
                    "inputDate" => time(),
                    "input_date" => date("Y-m-d H:i:s"),
                ]);
            }
            $data = array(
                "copy" => (int) model("Core")->sql(" select count(id) as 'copy' from cso1_transaction_printlog where transactionId ='$id'")[0]['copy'],
            );
        }

        return $this->response->setJSON($data);
    }
}