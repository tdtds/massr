# -*- coding: utf-8; -*-
#
# routes/main.rb
#
# Copyright (C) 2012 by The wasam@s production
# https://github.com/tdtds/massr
#
# Distributed under GPL
#

module Massr
	class App < Sinatra::Base
		get '/' do
			page = params[:page]?params[:page]:1
			haml :index , :locals => {:page => page , :statements => Statement.get_statements(page)}
		end
	end
end

