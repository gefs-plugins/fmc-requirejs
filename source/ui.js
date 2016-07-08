"use strict";

define(['lib', 'log', 'toggle', 'waypoints'], function (lib, log, toggle, waypoints) {
	
	// FMC button
	var button = $('<button>')
		.addClass('btn btn-success gefs-stopPropagation')
		.attr('type', 'button')
		.attr('data-toggle', 'modal')
		.attr('data-target', '#fmcModal')
		.css('margin-left','1px')
		.text('FMC ')
		.append(
			$('<i>').addClass('icon-list-alt')
		);
		
	// External distance indicator
	var externalDist = $('<div>')
		.addClass('setup-section')
		.css('padding-bottom','0px')
		.append( $('<div>')
			.addClass('input-prepend input-append')
			.css('margin-bottom','4px')
			.append(
			$('<span>')
				.addClass('add-on')
				.text('Dest'),
			$('<span>')
				.addClass('add-on')
				.css('background-color', 'white')
				.css('width', '53px')
				.append(
				$('<div>')
					.attr('id', 'externaldist')
				)
			)
		);
	
	// FMC user interface
	var modal = $('<div>')
		.addClass('modal hide gefs-stopPropagation')
		.attr('data-backdrop', 'static')
		.attr('id', 'fmcModal')
		.attr('tabindex', '-1')
		.attr('role', 'dialog')
		.attr('aria-labelledby', 'fmcDialogBoxLabel')
		.attr('aria-hidden', 'true')
		.css('width', '590px')
		.append(

		// Dialog
		$('<div>')
			.addClass('modal-dialog')
			.append(

			// Content
			$('<div>')
				.addClass('modal-content')
				.append(

				// Header
				$('<div>')
					.addClass('modal-header')
					.append(
					$('<button>')
						.addClass('close')
						.attr('type', 'button')
						.attr('data-dismiss', 'modal')
						.attr('aria-hidden', 'true')
						.text('\xD7') // &times;
				,	$('<h3>')
						.addClass('modal-title')
						.attr('id', 'myModalLabel')
						.css('text-align', 'center')
						.text('Flight Management Computer')
					)

				// Body
			,	$('<div>')
					.addClass('modal-body')
					.append(

					// Navigation tabs
					$('<ul>')
						.addClass('nav nav-tabs')
						.append(
							$('<li>')
								.addClass('active')
								.append('<a href="#rte" data-toggle="tab">RTE</a>')
						,	$('<li>')
								.append('<a href="#arr" data-toggle="tab">DEP/ARR</a>')
						/*,	$('<li>')
								.append('<a href="#perf" data-toggle="tab">PERF</a>')*/
						,	$('<li>')
								.append('<a href="#vnav" data-toggle="tab">VNAV</a>')
						,	$('<li>')
								.append('<a href="#prog" data-toggle="tab">PROG</a>')
						,	$('<li>')
								.append('<a href="#load" data-toggle="tab">LOAD</a>')
						/*,	$('<li>')
								.append('<a href-"#save" data-toggle="tab">SAVE</a>')*/
						,	$('<li>')
								.append('<a href="#log" data-toggle="tab">LOG</a>')
						)

					// Tab Content
				,	$('<div>')
						.addClass('tab-content')
						.css('padding', '5px')
						.append(

						// ROUTE TAB
						$('<div>')
							.addClass('tab-pane active')
							.attr('id', 'rte')
							.append(
							$('<table>')
								.append(
								$('<tr>')
									.append(
									$('<table>')
										.append(
										$('<tr>')
											.append(
			
											// Departure Airport input
											$('<td>')
												.css('padding', '5px')
												.append(
												$('<div>')
													.addClass('input-prepend input-append')
													.append(
													$('<span>')
														.addClass('add-on')
														.text('Departure')
												,	$('<input>')
														.addClass('input-mini')
														.attr('id','departureInput')
														.attr('type', 'text')
														.attr('placeholder', 'ICAO')
													)
												)
		
											// Arrival Airport input
										,	$('<td>')
												.css('padding', '5px')
												.append(
												$('<div>')
													.addClass('input-prepend input-append')
													.append(
													$('<span>')
														.addClass('add-on')
														.text('Arrival')
												,	$('<input>')
														.addClass('input-mini')
														.attr('type', 'text')
														.attr('id','arrivalInput')
														.attr('placeholder', 'ICAO')
														.change(function() {
															var wpt = $(this).val();
															var coords = waypoints.getCoords(wpt);
															if (!coords) {
																alert('Invalid Airport code');
																$(this).val('');
															}
															else lib.arrival = [wpt, coords[0], coords[1]];
														})
													)
												)
			
											// Flight # input
										,	$('<td>')
												.css('padding', '5px')
												.append(
												$('<div>')
													.addClass('input-prepend input-append')
													.append(
													$('<span>')
														.addClass('add-on')
														.text('Flight #'), $('<input>')
														.addClass('input-mini')
														.attr('id', 'flightNumInput')
														.css('width', '80px')
														.attr('type', 'text')
													)
												)
											)
										)
									)
							
								// Waypoints list labels
							,	$('<tr>')
									.append(
									$('<table>')
										.attr('id','waypoints')
										.append( 
										$('<tr>')
											.append(
											$('<td>').append('<th>Waypoints</th>')
										,	$('<td>').append('<th>Position</th>')
										,	$('<td>').append('<th>Altitude</th>')
										,	$('<td>').append('<th>Actions</th>')
											)
										)
									)
								
								// Add Waypoint
							,	$('<tr>')
									.append(
									$('<div>')
										.attr('id','waypointsAddDel')
										.append(
										$('<table>')
											.append(
											$('<tr>')
												.append(
												$('<td>')
													.append(
													$('<button>')
														.addClass('btn btn-primary')
														.attr('type', 'button')
														.text('Add Waypoint ')
														.append( $('<i>').addClass('icon-plus'))
														.click(function() {
															waypoints.addWaypoint();
														})
														.css('margin-right', '3px')
													)
												)
											)
										)
									)
								
								// Save Route	
							,	$('<tr>')
									.append(
									$('<div>')
										.attr('id','saveRoute')
										.append(
										$('<table>')
											.append(
											$('<tr>')
												.append(
												$('<td>')
													.append(
													$('<button>')
														.addClass('btn btn-info')
														.attr('type', 'button')
														.text('Save Route ')
														.append( $('<i>').addClass('icon-file icon-white'))
														.click(waypoints.saveData)
														.css('margin-right', '3px')
												,	$('<button>')
														.addClass('btn btn-info')
														.attr('type', 'button')
														.text('Retrieve Route ')
														.append( $('<i>').addClass('icon-refresh icon-white'))
														.click(waypoints.loadFromSave)
													)
												)
											)
										)
									)
								)
							)
						
						// ARRIVAL TAB
					,	$('<div>')
							.addClass('tab-pane')
							.attr('id', 'arr')
							.append(
							$('<table>')
								.append(
								$('<tr>')
									.append(
									$('<td>')
										.append(
										$('<div>')
											.addClass('input-prepend input-append')
											.append(
											$('<span>')
												.addClass('add-on')
												.text('TOD Dist.')
										,	$('<input>')
												.attr('id', 'todInput')
												.attr('type', 'number')
												.attr('min', '0')
												.attr('placeholder', 'nm')
												.css('width', '38px')
												.change(function() {
													lib.tod = $(this).val();
												})
											)
										)
								,	$('<td>')
										.append(
										$('<div>')
											.addClass('input-prepend input-append')
											.append(
											$('<span>')
												.addClass('add-on')
												.text('Automatically calculate TOD')
										,	$('<button>')
												.addClass('btn btn-standard')
												.attr('type', 'button')
												.text('OFF')
												.click(function() {
													if (!lib.todCalc) {
														$(this).removeClass('btn btn-standard').addClass('btn btn-warning').text('ON');
														lib.todCalc = true;
													} else {
														$(this).removeClass('btn btn-warning').addClass('btn btn-standard').text('OFF');
														lib.todCalc = false;
													}
												})
											)
										)
									)
							,	$('<tr>')
									.append(
									$('<td>')
										.append(
										$('<div>')
											.addClass('input-prepend input-append')
											.append(
											$('<span>')
												.addClass('add-on')
												.text('Arrival Field Elev.')
										,	$('<input>')
												.attr('type','number')
												.attr('placeholder','ft.')
												.css('width','55px')
												.change(function() {
													lib.fieldElev = Number($(this).val());
												})
											)
										)
									)
								)
							)

						// VNAV tab
					,	$('<div>')
							.addClass('tab-pane')
							.attr('id','vnav')
							.append(
							
							// AUTO-CLIMB/DESCENT, CRUISE ALT ROW, PHASE, TOGGLE
							$('<table>')
								.append(
								$('<tr>')
									.append(
									$('<td>')
										.append(
										$('<div>')
										.addClass('input-prepend input-append')
										.append(
											$('<button>')
												.addClass('btn')
												.attr('id', 'vnavButton')
												.text('VNAV ')
												.append($('<i>').addClass('icon icon-resize-vertical'))
												.click(toggle.toggleVNAV)
										, 	$('<span>')
												.addClass('add-on')
												.text('Cruise Alt.')
										, 	$('<input>')
												.attr('type', 'number')
												.attr('step', '100')
												.attr('min', '0')
												.attr('max', '100000')
												.attr('placeholder', 'ft')
												.css('width', '80px')
												.change(function () {
													lib.cruise = Number( $(this).val());
													console.log("Cruise Alt set to " + lib.cruise + " ft.");
												})
											)
										)
									)	
							,	$('<tr>')
									.append(
								
									// Flight Phase
									$('<td>')
										.append(
										$('<div>')
											.addClass('input-prepend input-append')
											.append(
											$('<span>')
												.addClass('add-on')
												.text('Phase')
										,	$('<button>')
												.addClass('btn btn-info')
												.attr('id', 'phaseBtn')
												.text('Climb')
												.css('height', '30px')
												.css('width', '77px')
												.click(function() {
													var phase = lib.phase;
													if ( $('#phaseLock').hasClass('btn-default')) {
														if (phase == "climb") {
															$(this).text("Cruise");
															phase = "cruise";
														} else if (phase == "cruise") {
															$(this).text("Descent");
															phase = "descent";
														} else {
															$(this).text("Climb");
															phase = "climb";
														}
														console.log("Phase set to " + phase);
													}
												})
										,	$('<button>')
												.addClass('btn btn-default')
												.attr('id', 'phaseLock')
												.append($('<i class="icon-lock"></i>'))
												.click(function() {
													if ($(this).hasClass('btn-default')) {
														$(this).removeClass('btn-default').addClass('btn-danger');
														console.log('Flight phase locked');
													} else {
														$(this).removeClass('btn-danger').addClass('btn-default');
														console.log('Flight phase unlocked');
													}
												})
											)	
										)
								
									// SPD Toggle Button
								,	$('<td>')
										.append(
										$('<div>')
											.addClass('input-prepend input-append')
											.append(
													$('<span>')
														.addClass('add-on')
														.text('SPD Control')
												,	$('<button>')
														.addClass('btn btn-warning')
														.attr('id', 'tSpd')
														.text('ON')
														.css('width', '60px')
														.click(toggle.toggleSpeed)
												)
										)
									)
								)		
							)
					
						// Progress tab
					,	$('<div>')
							.addClass('tab-pane')
							.attr('id','prog')
							.append(
							$('<table>')
								.append(
								$('<tr>')
									.append(
									$('<td>')
										.append(
										$('<div>')
											.addClass('input-prepend input-append')
											.append(
											$('<span>')
												.addClass('add-on')
												.text('Dest')
										,	$('<span>')
												.addClass('add-on')
												.css('background-color', 'white')
												.css('width', '53px')
												.append( $('<div>').attr('id', 'flightdist'))
										,	$('<span>')
												.addClass('add-on')
												.css('background-color', 'white')
												.css('width', '50px')
												.append(
												$('<table>')
													.css({'position': 'relative', 'top': '-6px'})
													.append(
													$('<tr>')
														.append(
														$('<td>')
															.append(
															$('<div>')
																.attr('id', 'flightete')
																.css('font-size', '70%')
																.css('height', '10px')
															)
														)
												,	$('<tr>')
														.append(
														$('<td>')
															.append(
															$('<div>')
																.attr('id', 'flighteta')
																.css('font-size', '70%')
																.css('height', '10px')
															)
														)
													)
												)
											)
										)
								,	$('<td>')
										.append(
										$('<div>')
											.addClass('input-prepend input-append')
											.append(
											$('<span>')
												.addClass('add-on')
												.text('TOD')
										,	$('<span>')
												.addClass('add-on')
												.css('background-color', 'white')
												.css('width', '53px')
												.append( $('<div>').attr('id', 'toddist'))
										,	$('<span>')
												.addClass('add-on')
												.css('background-color', 'white')
												.css('width', '50px')
												.append(
												$('<table>')
													.css({'position': 'relative', 'top': '-6px'})
													.append(
													$('<tr>')
														.append( 
														$('<td>')
															.append( $
															('<div>')
																.attr('id', 'todete')
																.css('font-size', '70%')
																.css('height', '10px')
															)
														)
												,	$('<tr>')
														.append(
														$('<td>')
															.append(
															$('<div>')
																.attr('id', 'todeta')
																.css('font-size', '70%')
																.css('height', '10px')
															)
														)
													)
												)
											)
										)
									)
							,	$('<tr>')
									.append(
									$('<td>')
										.append(
										$('<div>')
											.addClass('input-prepend input-append')
											.append( 
											$('<span>')
												.addClass('add-on')
												.text('Next Waypoint ')
												.append( $('<i>').addClass('icon-map-marker'))
										,	$('<span>')
												.addClass('add-on')
												.css('background-color', 'white')
												.css('width', '53px')
												.append( $('<div>').attr('id', 'nextDist'))
										,	$('<span>')
												.addClass('add-on')
												.css('background-color', 'white')
												.css('width', '53px')
												.append( $('<div>').attr('id', 'nextETE'))
											)
										)
									)
								)
							)
				
						// LOAD TAB
					,	$('<div>')
							.addClass('tab-pane')
							.attr('id', 'load')
							.append(
							$('<th>Enter waypoints seperated by spaces or a generated route</th>'),
							$('<form>')
								.attr('action','javascript:waypoints.toRoute(waypoints.input);')
								.addClass('form-horizontal')
								.append(
								$('<fieldset>')
									.append(
									$('<div>')
										.addClass('input-prepend input-append')
										.append(
										$('<span>')
											.addClass('add-on')
											.text('Waypoints ')
											.append( $('<i>').addClass('icon-pencil'))
									,	$('<input>')
											.attr('type', 'text')
											.addClass('input-xlarge gefs-stopPropagation')
											.change(function() {
												waypoints.input = $(this).val();
											})
										)
								,	$('<label class = "checkbox"><input type="checkbox" id="wptDeparture" value="true" checked> First waypoint is departure airport</label>')
								,	$('<label class = "checkbox"><input type="checkbox" id="wptArrival" value="true" checked> Last waypoint is arrival airport</label>')
								,	$('<button>')
										.attr('type', 'submit')
										.addClass('btn btn-primary')
										.text('Load Route ')
										.append( $('<i>').addClass('icon-play'))
									)
								
								// Share route / generate route	
							,	$('<fieldset>')
									.css('margin-top', '10px')
									.append(
										$('<button>')
										.addClass('btn btn-warning')
										.attr('type','button')
										.text('Generate')
										.click(function() {
											$('#generateRoute').val(waypoints.toRouteString()).change();
										}), 
										$('<button>')
										.addClass('btn btn-warning')
										.attr('type','button')
										.css('margin-left', '5px')
										.text('Clear')
										.click(function() {
											$('#generateRoute').val("").change();
										}),
										$('<div>').css('margin-top', '10px').append(
											$('<textarea>')
											.attr('id', 'generateRoute')
											.attr('placeholder', 'Generate route. Save it or share it')
											.css('margin', '0px 0px 10px')
											.css('width', '350px')
											.css('height', '65px')
											.css('resize', 'none')
										)
									)
								)
							)
						
						// Log tab
					,	$('<div>')
							.addClass('tab-pane')
							.attr('id','log')
							.append(
							$('<table>')
								.attr('id','logData')
								.append(
								$('<tr>')
									.append(
									$('<th>Time</th>')
										.css('padding','0px 10px 0px 10px')
								,	$('<th>Speed</th>')
										.css('padding','0px 10px 0px 10px')
								,	$('<th>Heading</th>')
										.css('padding','0px 10px 0px 10px')
								,	$('<th>Altitude</th>')
										.css('padding','0px 10px 0px 10px')
								,	$('<th>Lat.</th>')
										.css('padding','0px 10px 0px 10px')
								,	$('<th>Lon.</th>')
										.css('padding','0px 10px 0px 10px')
								,	$('<th>FPS</th>')
										.css('padding','0px 10px 0px 10px')
								,	$('<th>Other</th>')
										.css('padding','0px 10px 0px 10px')
									)
								)
						,	$('<button>')
								.addClass('btn btn-danger')
								.attr('type','button')
								.click(log.removeData)
								.text('Clear Log ')
								.append( $('<i>').addClass('icon-remove-circle'))
							)
						)
					)
			
				// Footer
			,	$('<div>')
					.addClass('modal-footer')
					.append(
					$('<button>')
						.addClass('btn btn-default')
						.attr('type', 'button')
						.attr('data-dismiss', 'modal')
						.text('Close')
				,	$('<button>')
						.addClass('btn btn-primary')
						.attr('type', 'button')
						.text('Save changes ')
						.append( $('<i>').addClass('icon-hdd'))
					)
				)
			)
		);
		
	return {
		button: button,
		externalDist: externalDist,
		modal: modal
	};
});
