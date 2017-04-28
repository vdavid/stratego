<?php
header('Access-Control-Allow-Origin: *');
if ($_REQUEST['move'] && strlen($_REQUEST['move']) < 95) {
	file_put_contents('lastmove.txt', $_REQUEST['move']);
} else {
	echo file_get_contents('lastmove.txt');
}