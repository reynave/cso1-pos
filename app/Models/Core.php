<?php

namespace App\Models;

use CodeIgniter\Model;
use CodeIgniter\CodeIgniter;

class Core extends Model
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
    function header()
    {
        if (service('request')->getHeaderLine('Token')) {
            $jwtObj = explode('.', service('request')->getHeaderLine('Token'));
            $user = base64_decode($jwtObj[1]);
            $data = json_decode($user, true);
        } else {
            $data = false;
        }

        return $data;
    }
    function accountId()
    {
        return self::header() != false ? self::header()['account']['id'] : "";
    }


    function number($name = "")
    {
        if ($name) {
            $number = self::select('runningNumber', 'auto_number', "name = '" . $name . "'") + 1;
            $prefix = self::select('prefix', 'auto_number', "name = '" . $name . "'");
            if ($prefix == '$year') {
                $prefix = date("Y");
            }

            $this->db->table("auto_number")->update([
                "runningNumber" => $number,
                "updateDate" => time(),
            ], "name = '" . $name . "' ");

            $new_number = str_pad($number, self::select('digit', 'auto_number', "name = '" . $name . "'"), "0", STR_PAD_LEFT);

            return $prefix . $new_number;
        }
    }

    function buildTree($arr, $parentId = 0)
    {
        $tree = [];

        foreach ($arr as $item) {
            if ($item['parent_id'] == $parentId) {
                $item['children'] = self::buildTree($arr, $item['id']);
                $tree[] = $item;
            }
        }

        return $tree;
    }

    function deleteNode($parentId)
    {

        // Mengupdate nilai presence menjadi 0 pada parent yang dihapus
        $this->db->table('pages')->where('id', $parentId)->update(['presence' => 0]);

        // Mengambil semua child yang terkait dengan parent yang dihapus
        $children = $this->db->table('pages')->where('parent_id', $parentId)->get()->getResultArray();

        // Menghapus atau mengupdate presence pada setiap child secara rekursif
        foreach ($children as $child) {
            self::deleteNode($child['id']);
        }
    }

    function put($data = [], $table = "", $where = "")
    {
        $res = false;
        if ($where != "") {
            $id = self::select("id", $table, $where);
            if (!$id) {
                $res = $this->db->table($table)->insert([
                    "presence" => 1,
                    "update_date" => date("Y-m-d H:i:s"),
                    "update_by" => model("Core")->accountId(),
                    "input_date" => date("Y-m-d H:i:s"),
                    "input_by" => model("Core")->accountId(),
                ]);
                $id = self::select("id", $table, " input_by = '" . model("Core")->accountId() . "' order by input_by DESC ");
            }

            foreach ($data as $key => $value) {

                $this->db->table($table)->update([
                    $key => $value,
                    "update_date" => date("Y-m-d H:i:s"),
                    "update_by" => model("Core")->accountId(),
                ], "id = $id ");
            }
        }
        return $res;
    }

}