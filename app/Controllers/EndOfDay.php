<?php

namespace App\Controllers;

use CodeIgniter\Model;
use CURLFile;

class EndOfDay extends BaseController
{
  
    function index()
    { 
        $json = file_get_contents('php://input');
        $post = json_decode($json, true);
        $data = [
            "error" => true,
            "post" => $post,
        ];
        if ($post) {
            $this->db->query("TRUNCATE TABLE cso1_kiosk_cart");
            $this->db->query("TRUNCATE TABLE cso1_kiosk_cart_free_item");
            $this->db->query("TRUNCATE TABLE cso1_kiosk_paid_pos");
            $this->db->query("TRUNCATE TABLE cso1_kiosk_cart");
            $this->db->query("TRUNCATE TABLE cso1_kiosk_uuid");

            $data = [
                "error" => false,
            //    "uploadToServer" => self::uploadToServer(date("Y-m-d")),
                "post" => $post,
            ];
        }
        return $this->response->setJSON($data);
    }

    private function uploadToServer( $folderSpec= "")
    {

      //  $folderSpec = '2023-08-25';   
        $serverUrl = $_ENV['SERVER']; // Ganti dengan URL penerima di server  
        $folderPath = FCPATH . "./../output/$folderSpec/"; 
        $files = scandir($folderPath);
        $fileList = [];  
       
        foreach ($files as $file) {
            if ($file != "." && $file != "..") {
                $fileList[] =  new CURLFile( $folderPath.$file);
            }
        } 
       
        $ch = curl_init();  
        curl_setopt($ch, CURLOPT_URL, $serverUrl);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fileList);

        $response = curl_exec($ch);

        if ($response === false) {
            $res = 'Error: ' . curl_error($ch);
        } else {
            $res  = 'File berhasil diunggah.';
        }

        curl_close($ch);
        return  $res ;
    }

    function readFolder()  {
       
  
        $serverUrl = 'http://localhost/app/pos2/server7/index.php'; // Ganti dengan URL penerima di server
   
        $folderSpec = '2023-08-25'; 
        $folderPath = FCPATH . "./../output/$folderSpec/";
        // $uploadFilePath = FCPATH . './../output/2023-08-25/cso1_transaction.T02SET000016.csv';
        $files = scandir($folderPath);
        $fileList = [];

        foreach ($files as $file) {
            if ($file != "." && $file != "..") {
                $fileList[] = FCPATH . './../output/2023-08-25/'.$file;
            }
        }
       
        print_r($fileList);
    }
}