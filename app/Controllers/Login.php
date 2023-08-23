<?php

namespace App\Controllers;

use CodeIgniter\Model;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Login extends BaseController
{
    public function auth()
    {
        $json = file_get_contents('php://input');
        $post = json_decode($json, true);
        $data = [
            "error" => true,
            "post" => $post,
        ];
        $id = model("Core")->select("id","cso1_user","id = '".$post['id']."' ");
        if ($post &&  $id) {   
            $key = $_ENV['SECRETKEY'];
            $payload = [
                'iss' => 'http://localhost',
                'aud' => 'http://localhost',
                'iat' => time(),
                'nbf' => time(),
                'exp' => strtotime('+8 hours'),
                "account" => array(
                    "id" =>  $id,
                    'name' => model("Core")->select("name","cso1_user","id = '$id' "),
                ),
            ];
            $jwt = JWT::encode($payload, $key, 'HS256');


            $data = array(
                "error" => false,
                "id" => $id,
                "jwtToken" => $jwt,
            );
        }else{
            $data = [
                "error" => true,
                "post" => $post,
                "note" => "ID not found!",
            ];
        }
        return $this->response->setJSON($data);
    }
}