requirejs = require './r.js'
fs = require 'fs'
less = require './less'

config =
	baseUrl: "./libs"
	paths:jquery: "empty:"
	name: "F"
	exclude:["bootstrap-scrollspy"]
	out: "../assets/scripts/o.js"
cssc =
	input:"./libs/o.less"
	paths: ['./libs','./libs/F_less']
	output: "../assets/stylesheets/o.css"
parser = new less.Parser
	paths: cssc.paths
	filename:cssc.input

requirejs.optimize config
fs.readFile cssc.input, 'utf-8' , (e,data)->
	if e
		"err message"
	parser.parse data, (e,tree)->
		css = tree.toCSS compress:true
		fd = fs.openSync cssc.output, 'w'
		fs.writeSync fd,css,0,"utf-8"


fs.watch "./libs/",(event,filename) ->
	console.log "event is: #{event}"
	if filename
		console.log "filename provided: #{filename}"
		if /\.js$/.test(filename)
			console.log ".js"
			requirejs.optimize config
		if /\.less$/.test(filename)
			console.log ".less"
			fs.readFile cssc.input, 'utf-8' , (e,data)->
				if e
					"err message"
				parser.parse data, (e,tree)->
					css = tree.toCSS compress:true
					fd = fs.openSync cssc.output, 'w'
					fs.writeSync fd,css,0,"utf-8"
	else
		console.log 'filename not provided'
