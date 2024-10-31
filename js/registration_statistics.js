function RegistrationStatistics(options) {

	this.loading_graphic = null;

	var self = this;
	
	this.init = function() {
		google.load('visualization', '1', {packages:['corechart', 'table']});
		
		jQuery(document).ready(function(){
			self.init_ui();
		});
	}
	
	this.create_chart = function(chart_key, counts_array) {
		
		var data = new google.visualization.DataTable();
		data.addColumn('date', 'Date');
		data.addColumn('number', 'Registrations');
		data.addRows(counts_array.length);
		
		var counter = 0;
		for(var i in counts_array) {
			var item = counts_array[i];
			var date_split = item['date'].split('-');
			var date_object = new Date(
				parseInt(date_split[0], 10),
				parseInt(date_split[1], 10) - 1,
				parseInt(date_split[2], 10)
			);
			data.setValue(counter, 0, date_object);
			data.setValue(counter, 1, parseInt(item['count'], 10));
			counter++;
		}
		
		var chart = new google.visualization.LineChart(document.getElementById('registration_statistics_'+chart_key+'_line_chart'));
		chart.draw(data, {width: 700, height: 300, legend: 'none'});
		
		var table = new google.visualization.Table(document.getElementById('registration_statistics_'+chart_key+'_table'));
		table.draw(data, {width: 300, sortColumn: 0, page: 'enable', pageSize: 10});
		
		self.add_select_listener(chart, data);
		self.add_select_listener(table, data);
		
	}
	
	this.add_select_listener = function(element, data) {
		google.visualization.events.addListener(element, 'select', function(){
			selection = element.getSelection();
			element.setSelection(selection);
			var date = data.getValue(selection[0].row, 0);
			var dialog_container = self.dialog.parents('.ui-dialog:first');
			if (dialog_container.is(':visible')) {
				dialog_container.slideUp(function() {
					self.set_up_dialog_for_date(date);
					dialog_container.slideDown()}
				);
			} else {
				self.set_up_dialog_for_date(date);
				self.dialog.dialog('open');
			}
			return true;
		});
	}
	
	this.set_up_dialog_for_date = function(date) {
		var year = date.getFullYear();
		var month = date.getMonth()+1;
		var day = date.getDate();
		if (month < 10) {
			month = '0'+month.toString();
		}
		if (day < 10) {
			day = '0'+day.toString();
		}
		
		var month_url = '/wp-admin/edit.php?post_type=post&post_status=publish&mode=list&m='+year+month;
		var day_url = month_url+day;
		
		var month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var month_display = month_names[date.getMonth()];
		var day_display = date.getDate();
		var dialog_title = 'Show Corresponding Posts ('+month_display+' '+day_display+', '+year+')';
		self.dialog.find('#registration_statistics_day_posts_link').attr('href', day_url);
		self.dialog.find('#registration_statistics_month_posts_link').attr('href', month_url);
		self.dialog.dialog('option', 'title', dialog_title);
	}

	this.create_charts = function(stats) {
		self.create_chart('date', stats['date_counts_array']);
		self.create_chart('cumulative', stats['cumulative_counts_array']);
	}
	
	this.init_ui = function() {

		var $j = jQuery.noConflict();
		
		$j(function() {
			$j('#registration_statistics_form #date_input').val('').daterangepicker({
				presetRanges: [
					{text: 'Last 7 Days', dateStart: 'Today-7', dateEnd: 'Today' },
					{text: 'Last 30 Days', dateStart: 'Today-30', dateEnd: 'Today' },
					{text: 'Last 90 Days', dateStart: 'Today-90', dateEnd: 'Today' },
					{text: 'Last 395 Days', dateStart: function(){ var x = Date.parse('today'); x.setFullYear(x.getFullYear() - 1); return x;  }, dateEnd: 'today' },
					{text: 'Month To Date', dateStart: function(){ return Date.parse('today').moveToFirstDayOfMonth();  }, dateEnd: 'today' },
					{text: 'Year To Date', dateStart: function(){ var x= Date.parse('today'); x.setMonth(0); x.setDate(1); return x; }, dateEnd: 'today' }
				],
				presets: {
					dateRange: 'Date Range'
				},
				onClose: function(){
					jQuery('#registration_statistics_form').submit();
				}
			});
		
		jQuery('body').append(
			'<div id="registration_statistics_dialog" title="Show Corresponding Posts">'+
				'<p><a href="#" title="Posts From This Day" target="_blank" id="registration_statistics_day_posts_link" class="ui-corner-all ui-button">Posts From This Day</a></p>'+
				'<p><a href="#" title="Posts From This Month" target="_blank" id="registration_statistics_month_posts_link" class="ui-corner-all ui-button">Posts From This Month</a></p>'+
			'</div>');
			self.dialog = $j('#registration_statistics_dialog').dialog({autoOpen: false, resizeable: false, width: 340});
		});
		
		self.loading_graphic = jQuery('#registration_statistics_loading_graphic');
	
		jQuery('#registration_statistics_form').submit(function(){
			self.loading_graphic.show();
			var date = jQuery('#registration_statistics_form #date_input').val();
			if(date){
				self.get_registration_statistics(date);
			}else{
				self.loading_graphic.hide();
			}
			return false;
		});
		
		jQuery('#registration_statistics_show_date_table').click(function(){
			var table = jQuery('#registration_statistics_date_table');
			if(jQuery(this).hasClass('active')){
				table.slideUp('slow');
				jQuery(this).html('&#9660; Show Table').removeClass('active');
			}else{
				table.slideDown('slow');
				jQuery(this).html('&#9650; Hide Table').addClass('active');
			}
			return false;
		});
		
		jQuery('#registration_statistics_show_cumulative_table').click(function(){
			var table = jQuery('#registration_statistics_cumulative_table');
			if(jQuery(this).hasClass('active')){
				table.slideUp('slow');
				jQuery(this).html('&#9660; Show Table').removeClass('active');
			}else{
				table.slideDown('slow');
				jQuery(this).html('&#9650; Hide Table').addClass('active');
			}
			return false;
		});
		
	}

	this.get_registration_statistics = function(date){
		
		var data = {
			action: 'get_registration_statistics',
			date: date
		};
		
		var error_message = 'Sorry, there was an error with parsing this response.\n\nPlease check that no PHP errors are being shown, as those will interfere with this service.';
		
		jQuery.ajax({
			type: 'POST',
			url: ajaxurl,
			data: data,
			success: function(response){
				response = response.replace(/0$/, '');
				try{
					response = jQuery.parseJSON(response);
				}catch(e){
					self.loading_graphic.hide();
					alert(error_message);
					return false;
				}
				jQuery('#registration_statistics_charts > div').html('');
				jQuery('#registration_statistics_charts').show();
				self.create_charts(response['data']);
				jQuery('#registration_statistics_stats_html').html(response['html']);
				self.loading_graphic.hide();
			},
			error: function(obj, error_message){
				self.loading_graphic.hide();
				alert(error_message);
				return false;
			}
		});
		
	}
	
	self.init();

}