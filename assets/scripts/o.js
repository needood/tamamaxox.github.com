---
---

{% include vendor/jquery-1.7.1.min.js %}
{% include vendor/jquery.cookie.js %}
{% include F/libs/bootstrap-affix.js %}
{% include F/libs/bootstrap-dropdown.js %}


$(document).ready(function(){
	{% include F/libs/F.js %}
	{% include F/libs/bootstrap-scrollspy.js %}
	$('body').scrollspy($.extend({},$('body').data(),{offset:ssheight}))
})
