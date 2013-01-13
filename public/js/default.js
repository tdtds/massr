/*
 * default.js : common javascript file of massr
 *
 * Copyright (C) 2012 by The wasam@s production
 *
 * Distributed under GPL
 */

$(function(){
	var me = $('#me').text();

	/*
	 * setup pnotify plugin
	 */
	$.pnotify.defaults.history = false;

	/*
	 * setup against CSRF
	 */
	jQuery.ajaxSetup({
		beforeSend: function(xhr) {
			var token = jQuery('meta[name="_csrf"]').attr('content');
			xhr.setRequestHeader('X_CSRF_TOKEN', token);
		}
	});

	/*
	 * setup auto reloading
	 *   reloading each 30sec without focused in TEXTAREA
	 */
	var reload_interval = setInterval(function(){reloadDiff();}, 30000);

	/*
	 * utilities
	 */
	// get ID from style "aaa-999999999"
	function getID(label){
		return label.split('-', 2)[1];
	};

	var message = new Object();

	// popup notification message
	message.success = function(text){
		$.pnotify({
			text: text,
			type: 'success'
		});
	};

	message.info = function(text){
		$.pnotify({
			text: text,
			type: 'info'
		});
	};

	message.error = function(text){
		$.pnotify({
			text: text,
			type: 'error'
		});
	};

	// replace CR/LF to single space
	function shrinkText(text){
		return text.replace(/[\r\n]+/g, ' ');
	};

	// template of a statement
	function buildStatement(s){ // s is json object of a statement
		return $('<div>').addClass('statement').attr('id', 'st-'+s.id).append(
			$('<div>').addClass('statement-icon').append(
				$('<a>').attr('href', '/user/'+s.user.massr_id).append(
					$('<img>').addClass('massr-icon').attr('src', s.user.twitter_icon_url)
				)
			)
		).append(
			$('<div>').addClass('statement-body').each(function(){
				if(s.user.massr_id == me){
					$(this).addClass('statement-body-me');
				}
				if(s.res != null){
					$(this).append(
						$('<div>').addClass('statement-res-icon').append(
							$('<a>').attr('href', '/user/'+s.res.user.massr_id).append(
								$('<img>').addClass('massr-icon-mini').
									attr('src', s.res.user.twitter_icon_url).
									attr('alt', s.res.user.name).
									attr('title', s.res.user.name)
							)
						)
					).append(
						$('<div>').addClass('statement-res').append(
							$('<a>').attr('href', '/statement/'+s.res.id).
								text('< '+shrinkText(s.res.body)))
					)
				}
			}).append(
				$('<div>').addClass('statement-message').text(shrinkText(s.body)).autoLink()
			).append(
				$('<div>').addClass('statement-photos').each(function(){
					var $parent = $(this);
					$.each(s.photos, function(){
						$parent.append($('<a>').attr('href', this).
							attr('rel', 'lightbox').
							on('click', function(){showLightbox(this); return false;}).
							append($('<img>').addClass('statement-photo').attr('src', this)));
					});
				})
			).append(
				$('<div>').addClass('statement-info').
					append('by ').
					append($('<a>').attr('href', '/user/'+s.user.massr_id).append(s.user.name)).
					append(' at ' ).
					append($('<a>').attr('href', '/statement/'+s.id).append(s.created_at))
			).append(
				$('<div>').addClass('statement-action').each(function(){
					if(s.user.massr_id == me){
						$(this).append(
							$('<a>').addClass('trash').attr('href', '#').
								append($('<i>').addClass('icon-trash').attr('title', '削除'))
						)
					}
				}).append(
					$('<a>').addClass('res').attr('href', '#').append(
						$('<i>').addClass('icon-comment').attr('title', 'レス')
					)
				).append(
					$('<a>').attr('href', '#').addClass('like-button').attr('id', 'like-'+s.id).
						each(function(){
							var classLike = 'like';
							$.each(s.likes, function(){
								if(this.user.massr_id == me){
									classLike = 'unlike';
									return false;
								}
								return true;
							});
							$(this).addClass(classLike);
						}).
						append($('<img>').addClass('unlike').attr('src', '/img/wakaruwa.png').attr('alt', 'わからないわ').attr('title', 'わからないわ')).
						append($('<img>').addClass('like').attr('src', '/img/wakaranaiwa.png').attr('alt', 'わかるわ').attr('title', 'わかるわ'))
				)
			).append(
				$('<div>').addClass('response').attr('id', 'res-'+s.id).append(
					$('<form>').attr('method', 'POST').attr('action', '/statement').append(
						$('<div>').append(
							$('<textarea>').
								attr('name', 'body').
								attr('type', 'text')
						).append(
							$('<input>').
								attr('name', 'res_id').
								attr('type', 'hidden').
								attr('value', s.id)
						).append(
							$('<input>').
								attr('name', '_csrf').
								attr('type', 'hidden').
								attr('value', $('meta[name="_csrf"]').attr('content'))
						).append(
							$('<input>').
								addClass('btn').
								attr('type', 'submit').
								attr('value', 'レスるわ')
						)
					)
				)
			)
		);
	};

	// template of a photo
	function buildPhoto(s){ // s is json object of a photo
		return $('<div>').addClass('item').attr('id', 'st-'+s.id).append(
			$('<div>').addClass('item-body').each(function(){}).append(
				$('<div>').addClass('item-photos').each(function(){
					var $parent = $(this);
					$.each(s.photos, function(){
						$parent.append($('<a>').attr('href', this).
							attr('rel', 'lightbox').
							on('click', function(){showLightbox(this); return false;}).
							append($('<img>').addClass('item-photo').attr('src', this)));
					});
				})
			).append(
				$('<div>').addClass('item-info').
					append(' at ' ).
					append($('<a>').attr('href', '/statement/'+s.id).append(s.created_at))
			)
		);
	};

	function getNewestTime(){
		return $($('#statements .statement .statement-info a').get(1)).text().replace(/^\s*(.*?)\s*$/, "$1");
	}

	// reload diff of recent statements
	function reloadDiff(){
		if(location.pathname == '/' && location.search == ''){
			$.ajax({
				url: '/index.json',
				type: 'GET',
				dataType: 'json',
				cache: false}).
			done(function(json) {
					var newest = getNewestTime()
					$('#statements').each(function(){
						var $div = $(this);
						$.each(json.reverse(), function(){
							if(this.created_at > newest){
								var $statement = buildStatement(this).hide();
								$div.prepend($statement);
								$statement.slideDown('slow');
							}
							refreshLike(this);
						});
					});
					if (newest != getNewestTime()){
						newResCheck();
					}
				}).
			fail(function(XMLHttpRequest, textStatus, errorThrown) {
					if($('textarea:focus').length == 0){
						location.reload();
					}
			});
		}
	};

	function updateResCount(count){
		$('.new-res-count').text(count);
		if(count == 0){
			$('#new-res-size-main').hide();
		}else{
			$('#new-res-size-main').show();
		}
	};

	function newResCheck(){
		$.ajax({
			url: '/ressize.json',
			type: 'GET',
			dataType: 'json',
			cache: false}
		).done(function(json) {
			updateResCount(json.size);
		}).fail(function(XMLHttpRequest, textStatus, errorThrown) {
			if($('textarea:focus').length == 0){
				location.reload();
			}
		});
	};

	// automatic link plugin
	$.fn.autoLink = function(config){
		this.each(function(){
			var re = /((https?|ftp):\/\/[\(\)%#!\/0-9a-zA-Z_$@.&+-,'"*=;?:~-]+|#\S+)/g;
			$(this).html(
				$(this).html().replace(re, function(u){
					try {
						if (u.match(/^#/)) {
							return '<a href="/search?q='+encodeURIComponent(u)+'">'+u+'</a>';
						} else {
							var url = $.url(u);
							return '[<a href="'+u+'" target="_brank">'+url.attr('host')+'</a>]';
						}
					}catch(e){
						return u;
					}
				})
			);
		});
		return this;
	};

	/*
	 * post by Ctrl+Enter key
	 */
	$(document).on('keydown', 'textarea', function(e){
		if(e.keyCode == 13 && e.ctrlKey){
		  e.preventDefault();
		  $(this).parent().parent().submit();
		  return;
		}
	});

	/*
	 * empty post changes to reload
	 */
	$('#form-new').on('submit', function(e){
		if($('textarea', this).val().length == 0){
			location.reload();
			return false;
		}else{
			return true;
		}
	});

	/*
	 * photo upload
	 */
	$('#photo-shadow').on('change', function(){
		var fileName = $(this).attr('value').replace(/\\/g, '/').replace(/.*\//, '');
		$('#photo-name').empty().text(fileName);
		$(this).hide();
		return true;
	});

	$('#photo-button').on('click', function(){
		$('#photo-shadow').show();
		$('#photo-shadow').trigger('click');
		return false;
	});

	/*
	 * action like / unlike
	 */
	function toggleLikeButton(statement_id){
		$('#st-' + statement_id + ' a.like-button').
			toggleClass('like').
			toggleClass('unlike');
	};

	function refreshLike(statement){
		var likeClasses = ['unlike', 'like'];

		$('#st-' + statement.id + ' .statement-like').remove();
		if(statement.likes.length > 0){
			$('#st-' + statement.id + ' .statement-action').
				after('<div class="statement-like">').
				next().
				append('わかるわ:');

			$.each(statement.likes, function(){
				$('#st-' + statement.id + ' .statement-like').
					append("&nbsp;").
					append( $('<a>').
						attr('href', '/user/' + this.user.massr_id).
						append( $('<img>').
							addClass('massr-icon-mini').
							attr('src', this.user.twitter_icon_url).
							attr('alt', this.user.name).
							attr('title', this.user.name)
						)
					);
				if(this.user.massr_id == me){
					likeClasses = ['like', 'unlike'];
				}
			});
		}
		$('#like-' + statement.id).removeClass(likeClasses[0]).addClass(likeClasses[1]);
	};

	$(document).on('click', '.statement-action a.like-button', function(){
		var statement_id = getID($(this).attr('id'));
		var method = $(this).hasClass('like') ? 'POST' : 'DELETE';

		toggleLikeButton(statement_id);
		$.ajax('/statement/' + statement_id + '/like', {
			type: method,
			dataType: 'json'}).
		done(function(statement) {
				refreshLike(statement);
			}).
		fail(function(XMLHttpRequest, textStatus, errorThrown) {
				toggleLikeButton(statement_id);
				message.error('イイネに失敗しました(' + textStatus + ')');
			});
		return false;
	});

	/*
	 * res form
	 */
	$(document).on('click', '.statement-action a.res', function(){
		var statement = getID($(this).parent().parent().parent().attr('id'));
		$("#res-" + statement).toggle().each(function(){
			if($(this).css('display') == 'block'){
				$('textarea', this).focus();
			}
		});
		return false;
	});

	/*
	 * delete statement
	 */
	$(document).on('click', '.statement-action a.trash', function(){
		var statement = getID($(this).parent().parent().parent().attr('id'));
		var owner = $('#st-' + statement + ' .statement-icon a').attr('href').match(/[^/]+$/);
		if(owner != me){
			message.error('削除は発言者本人にしかできません');
			return false;
		}
		if(window.confirm('本当に削除してよろしいいですか?')){
			$.ajax({
				url: '/statement/'+statement,
				type: 'DELETE'}).
			done(function(result) {
					location.href = "/";
				});
		}
	});

	/*
	 * show response-count when over zero, and wrap span.new-res-count
	 */
	$('#new-res-notice-text').each(function(){
		var notice = $(this);
		var notice_count = notice.text().match(/\d+/);
		notice.html(notice.html().replace(notice_count, '<span class="new-res-count">'+notice_count+'</span>'));
		if(notice_count != '0'){
			$('#new-res-size-main').show();
		}
	});

	/*
	 * delete new response-count
	 */
	$(document).on('click', '#new-res-notice-delete-button a.clearres', function(){
		$.ajax({
			url: '/newres',
			type: 'DELETE'}).
		done(function(result) {
			updateResCount(0);
		});
	});

	// Subjoin the next page
	$('#subjoinpage').on('click', function(str){
		$(this).hide();
		$('#subjoinpage-loading').show();
		var oldest = (/.*photos$/.test(location.pathname))?
			$($('#items .item .item-info a').get(-1)).text().replace(/^\s*(.*?)\s*$/, "$1").replace(/[-: ]/g, ''):
			$($('#statements .statement .statement-info a').get(-1)).text().replace(/^\s*(.*?)\s*$/, "$1").replace(/[-: ]/g, '');
		var link=$(this).attr('path') + "?date=" + oldest
		var $button = $(this)

		if ($(this).attr('query')!=""){
			link = link + "&q=" + $(this).attr('query')
		}
		$.ajax({
			url: link,
			type: 'GET',
			dataType: 'json',
			cache: false}).
		done(function(json) {
				var idname = (/.*photos$/.test(location.pathname))? '#items':'#statements'
				$(idname).each(function(){
					var $div = $(this);
					$.each(json, function(){
						var $statement = (/.*photos$/.test(location.pathname))? buildPhoto(this).hide():buildStatement(this).hide();
						if (/.*photos$/.test(location.pathname)){
							$div.append( $statement )
							$div.imagesLoaded(function(){
								 $container.masonry( 'appended', $statement );
								 $container.masonry( 'reload' );
							});
						}
						else {
							$div.append($statement);
						}
						$statement.slideDown('slow');
						refreshLike(this);
					});
				});
				$('#subjoinpage-loading').hide();
				$('#subjoinpage').show();
			}).
		fail(function(XMLHttpRequest, textStatus, errorThrown) {
				if($('textarea:focus').length == 0){
					location.reload();
				}
			});
	});

	/*
	 * admin
	 */
	var ADMIN        = 0;
	var AUTHORIZED   = 1;
	var UNAUTHORIZED = 9;

	function toggleStatus(massr_id, stat, on, off){
		if($('#' + massr_id).hasClass('admin') && on == 'unauthorized'){
			message.info('管理者の認可は取り消せません')
			return false;
		}
		if($('#' + massr_id).hasClass('unauthorized') && on == 'admin'){
			message.info('未認可メンバは管理者指名できません')
			return false;
		}
		$.ajax({
			url: '/user/' + massr_id,
			type: 'PUT',
			data: "status=" + stat}).
		done(function(result){
				message.success(massr_id + 'のステータスを変更しました');
				$('#' + massr_id).toggleClass(on).toggleClass(off);
			}).
		fail(function(XMLHttpRequest, textStatus, errorThrown){
				message.error('ステータス変更に失敗しました(' + textStatus + ')');
			});
		return true;
	};

	$('ul.admin li').
		on('click', 'a.admin', function(){ // Admin権限剥奪
			toggleStatus($(this).parent().attr('id'), AUTHORIZED, 'normal', 'admin');
			return false;}).
		on('click', 'a.normal', function(){ // Admin権限付与
			toggleStatus($(this).parent().attr('id'), ADMIN, 'admin', 'normal');
			return false;}).
		on('click', 'a.authorized', function(){ // 認可取り消し
			toggleStatus($(this).parent().attr('id'), UNAUTHORIZED, 'unauthorized', 'authorized');
			return false;}).
		on('click', 'a.unauthorized', function(){ // 認可
			toggleStatus($(this).parent().attr('id'), AUTHORIZED, 'authorized', 'unauthorized');
			return false;});

	/*
	 * automatic link
	 */
	$('.statement-message').autoLink();
	var $container = $('#items');
	$container.imagesLoaded(function(){
		$container.masonry({
			itemSelector : '.item',
			columnWidth : 110
		});
	});



});

