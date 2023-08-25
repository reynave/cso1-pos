<?php
$uploadDir = './output/'; // Ganti dengan path folder tujuan di server

foreach ($_FILES as $file) {
    $res = "";
    if ($file['error'] === UPLOAD_ERR_OK) {
        $tmp_name = $file['tmp_name'];
        $name = basename($file['name']);
        $target_path = $uploadDir . $name;

        if (move_uploaded_file($tmp_name, $target_path)) {
            $res .= "File berhasil diunggah ke: " . $target_path . "<br>";
        } else {
            $res .=  "Gagal mengunggah file: " . $name . "<br>";
        }
    } else {
        $res .=  "Error uploading file: " . $file['name'] . ". Error code: " . $file['error'] . "<br>";
    }

    
}
return $res;