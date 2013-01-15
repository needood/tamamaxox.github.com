if $.cookie('oauth-token')
	$('#backend').addClass('show')
navbar = $(".F-main-navbar-")
navbar.css("height",navbar.height())
navbar.children(".F-main-navbar").affix offset:top:navbar.offset().top
scrollspybar = $("#book_bar")
if scrollspybar.length > 0
	sshtml = '''
			<div class="nav">
				<div class="f-block">
					<ul>
		'''
	$("article [id]").each (i,item)->
		sshtml += """
				<li>
					<a href='#{$(item).attr("id")}'>#{$(item).text()}</a>
				</li>
			"""
	sshtml += '''
				</ul>
			</div>
		</div>
		'''
	scrollspybar.html(sshtml)
	scrollspybar.children(".nav").css("padding-top",navbar.height());
	scrollspybar.css("margin-top","-#{navbar.height()}");
	window.ssheight = scrollspybar.height()+10
	scrollspybar.css("height",ssheight)
	scrollspybar.find("li > a").click (event)->
		event.preventDefault()
		$('body').scrollTop $("##{$(this).attr('href').replace(/^#/,'')}").offset().top - ssheight
	scrollspybar.children(".nav").affix offset:top:scrollspybar.offset().top

