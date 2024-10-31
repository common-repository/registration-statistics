<?php

class RegistrationStatistics {

	private $plugin_file_path = '';
	private $plugin_url = '';
	
	public function admin_init() {
		$this->plugin_file_path = preg_replace('/lib\/?$/', '', dirname(__FILE__));
		$this->plugin_url = site_url('/').str_replace(ABSPATH, '', $this->plugin_file_path);
	}

	public function add_registration_statistics_page() {
		$page = add_submenu_page('tools.php', 'Registration Statistics', 'Registration Statistics', 'manage_options', 'registration_statistics.php', array($this, 'registration_statistics_page'));
		add_action('admin_print_styles-'.$page, array($this, 'print_styles'));
	}
	
	public function print_styles() {
		wp_enqueue_style('jquery-ui-redmond', $this->plugin_url.'css/redmond/jquery-ui-1.7.3.custom.css');
		wp_enqueue_style('daterangepicker', $this->plugin_url.'css/ui.daterangepicker.css');
		wp_enqueue_style('registration-statistics', $this->plugin_url.'css/registration_statistics.css');
		
		wp_enqueue_script('jquery-ui-datepicker', $this->plugin_url.'js/jquery-ui-1.7.3.datepicker.min.js', array('jquery-ui-core'));
		wp_enqueue_script('daterangepicker', $this->plugin_url.'js/daterangepicker.jQuery.js', array('jquery-ui-datepicker'));
		wp_enqueue_script('registration-statistics', $this->plugin_url.'js/registration_statistics.js', array('daterangepicker', 'jquery-ui-dialog'));
		wp_enqueue_script('google-js-api', 'https://www.google.com/jsapi');
		
	}
	 	
	public function registration_statistics_page() {
		require_once $this->plugin_file_path.'admin/registration_statistics.php';
	}
		
	public function get_registration_statistics() {
	
		if (!(is_user_logged_in() && current_user_can('manage_options'))) {
			die('Authentication failed!');
		}
		
		$date = empty($_REQUEST['date']) ? null : $_REQUEST['date'];
		$date_split = explode(' - ', $date);
		$from = strtotime($date_split[0]);
		$to = empty($date_split[1]) ? $from : strtotime($date_split[1]);
		
		if (!$from || !$to) {
			$response = array(
				'html' => 'Please select a date range!',
				'data' => null
			);
			echo json_encode($response);
			die();
		}
		
		$data = $this->get_data($from, $to);
		
		extract($data);
		
		$date_counts_array = array();
		foreach($date_counts as $date => $count) {
			$date_time = strtotime($date);
			$date_counts_array[] = array(
				'date' => date('Y-m-d', $date_time),
				'count' => $count
			);
		}
		
		$cumulative_counts_array = array();
		foreach($cumulative_counts as $date => $count) {
			$date_time = strtotime($date);
			$cumulative_counts_array[] = array(
				'date' => date('Y-m-d', $date_time),
				'count' => $count
			);
		}
		
		$html = '
			<h3>'.date('M j, Y', $from).' - '.date('M j, Y', $to).'</h3>
			<div>
				Registrations during this period: '.$total_count.'
			</div>
			';
			
		$data['date_counts_array'] = $date_counts_array;
		$data['cumulative_counts_array'] = $cumulative_counts_array;
		
		$response = compact('html', 'data');
		
		echo json_encode($response);
		die();
		
	}
	
	private function get_data($from, $to) {
		
		global $wpdb;
		
		$users_table = $wpdb->prefix.'users';
		
		$sql = '
			SELECT
				COUNT(ID) AS count
			FROM
				'.$users_table.'
			WHERE
				DATE(user_registered) < "'.date('Y-m-d', $from).'"';
		
		$cumulative_total_count = $wpdb->get_var($sql);
		
		$sql = '
			SELECT
				COUNT(ID) AS count,
				DATE(user_registered) AS date
			FROM
				'.$users_table.'
			WHERE
				DATE(user_registered) >= "'.date('Y-m-d', $from).'"
			AND
				DATE(user_registered) <= "'.date('Y-m-d', $to).'"
			GROUP BY
				date
			ORDER BY
				date';
		$results = $wpdb->get_results($sql);
		
		$date_counts = array();
		$cumulative_counts = array();
		$total_count = 0;
		
		foreach($results as $result) {
			$date_counts[$result->date] = $result->count;
		}
		
		$date_iterator = $from;
		while($date_iterator <= $to) {
			$date_iterator_ymd = date('Y-m-d', $date_iterator);
			if (!isset($date_counts[$date_iterator_ymd])) {
				$date_counts[$date_iterator_ymd] = 0;
			}
			$date_iterator += 86400;
		}
		ksort($date_counts);
		
		foreach($date_counts as $date => $count) {
			$date_counts[$date] = $count;
			$cumulative_counts[$date] = $count + $cumulative_total_count;
			$total_count += $count;
			$cumulative_total_count += $count;
		}
		
		$stats = compact('date_counts', 'cumulative_counts', 'total_count');
		
		return $stats;
		
	}

}

?>