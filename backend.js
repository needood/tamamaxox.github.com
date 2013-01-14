---
---
{% include vendor/jquery-1.7.1.min.js %}
{% include vendor/jquery.cookie.js %}
if ($.cookie("oauth-token")){
	$("#backend").css("display","block");
}
