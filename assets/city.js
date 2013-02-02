// JavaScript Document

function bind_city_widget(province_sel, city_sel, district_sel, can_empty) {
	$(province_sel).bind("change",function(e, city_idx, district_idx){
		$.ajax({
			url:"/json/c",
			data:{pid: $(this).attr("value")},
			success:function(data,textStatus,jqXHR){
				var options;
				console.log(data);

				for(d in data){
					console.log(_.template("<option value='<%= value %>'><%= name %></option>")({value:d,name:data[d]}))
				options += _.template("<option value='<%= value %>'><%= name %></option>")({value:d,name:data[d]})
				}
				$(city_sel).html(options)
					$(city_sel+' option').each(function(index){
						if($(this).attr('value') == city_idx) {
							$(this).attr('selected', 'selected');
							$(this).trigger('change', district_idx)
						}
					});
				$(city_sel).trigger('change');
			}
		})
	})
	$(city_sel).bind("change",function(e, district_idx){
		console.log($(this).attr('value'));
		$.ajax({
			url:"/json/d",
			data:{cid: $(this).attr("value")},
			success:function(data,textStatus,jqXHR){
				console.log(data);
				var options;
				if(can_empty) {
					options += '<option value=0>- 区 -</option>';
				}
				for(d in data){
					options += _.template("<option value='<%= value %>'><%= name %></option>")({value:d,name:data[d]})
				}
				$(district_sel).html(options)
			$(district_sel+' option').each(function(index){
				if($(this).attr('value') == district_idx) {
					$(this).attr('selected', 'selected');
				}
			});
			}
		})
	})
}

function set_location(province_sel, province_val, 
		city_sel, city_val,
		district_sel, district_val) {
	console.log(province_val);
	console.log(city_val);
	console.log(district_val);

	$(province_sel+' option').each(function(index){
		if($(this).attr('value') == province_val) {
			$(this).attr('selected', 'selected');
			$(this).trigger('change', [city_val, district_val])
		}
	});
}
