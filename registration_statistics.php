<?php
/*
Plugin Name: Registration Statistics
Plugin URI: http://wordpress.org/extend/plugins/registration-statistics/
Description: Displays graphs and tables showing counts of daily user registrations for a selected date range.
Author: Tom Benner
Version: 1.0
Author URI: 
*/

require_once dirname(__FILE__).'/lib/registration_statistics.php';

$rs = new RegistrationStatistics();
add_action('admin_init', array($rs, 'admin_init'));
add_action('admin_menu', array($rs, 'add_registration_statistics_page'));
add_action('wp_ajax_get_registration_statistics', array($rs, 'get_registration_statistics'));

?>