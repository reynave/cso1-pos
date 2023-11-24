<?php
// https://github.com/Klemen1337/node-thermal-printer
/* Call this file 'hello-world.php' */
require __DIR__ . '/vendor/autoload.php';
use Mike42\Escpos\Printer;

use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;
use Mike42\Escpos\CapabilityProfile;

$profile = CapabilityProfile::load("simple");
$connector = new WindowsPrintConnector("wintec");
$printer = new Printer($connector, $profile);

$printer -> text("Hello World!\n\n\n\n\n");
$printer -> cut();
$printer->pulse();
$printer -> close();
echo "Sukses";