# -*- coding: utf-8; -*-
#
# massr.rb : Massr - Mini Wassr
#
# Copyright (C) 2012 by TADA Tadashi <t@tdtds.jp>
#

require 'sinatra/base'
require 'haml'
require 'json'
require 'omniauth'
require 'omniauth-twitter'

require 'mongo_mapper'
require './models'

module Massr

	class App < Sinatra::Base

		set :haml, { format: :html5, escape_html: true }

		configure :development do
			Bundler.require :development
			register Sinatra::Reloader

			@auth_twitter = Pit::get( 'auth_twitter', :require => {
					:id => 'your CUNSUMER KEY of Twitter APP.',
					:secret => 'your CUNSUMER SECRET of Twitter APP.',
				} )
		end

		configure :production do
         @auth_twitter  = {:id => ENV['TWITTER_CONSUMER_ID'], :secret => ENV['TWITTER_CONSUMER_SECRET']}
		end

		use OmniAuth::Strategies::Twitter  , @auth_twitter[:id]  , @auth_twitter[:secret]
		use Rack::Session::Cookie,:expire_after => 3600,:secret => ENV['SESSION_SECRET']

		enable :sessions

		get '/' do
			haml :index
		end

		get '/auth/:provider/callback' do
			info = request.env['omniauth.auth']
			session[:user_name] = info['info']['name']
			session[:token]     = info['credentials']['token']
			redirect '/'
		end

		get '/user' do
		end
	end
end

Massr::App::run! if __FILE__ == $0
