<div class="wrap">

	<h2>Registration Statistics</h2>
	
	<form method="post" action="" id="registration_statistics_form">
		<label for="date_input">Date Range:</label>
		<input type="text" id="date_input" name="date_input" />
		<span id="registration_statistics_loading_graphic"></span>
	</form>
	
	<div id="registration_statistics_charts">
	
		<div id="registration_statistics_stats_html"></div>
		
		<h4>Daily Registrations</h4>
		<div id="registration_statistics_date_line_chart" class="registration_statistics_chart"></div>
		<a href="#" id="registration_statistics_show_date_table" class="registration_statistics_table_link">&#9660; Show Table</a>
		<div id="registration_statistics_date_table" class="registration_statistics_table"></div>
		
		<h4>Cumulative Registrations</h4>
		<div id="registration_statistics_cumulative_line_chart" class="registration_statistics_chart"></div>
		<a href="#" id="registration_statistics_show_cumulative_table" class="registration_statistics_table_link">&#9660; Show Table</a>
		<div id="registration_statistics_cumulative_table" class="registration_statistics_table"></div>
		
	</div>
	
</div>

<script type="text/javascript">
	new RegistrationStatistics();
</script>