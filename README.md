Massr - Mini Wassr
=====

## Massrについて

日本のTwitterクローン型SNSである「Wassr」が2012年9月いっぱいで閉鎖になることが発表され、Wassrのヘビーユーザーであった我々はひどく狼狽し、そして悲しくなりました。Wassrで行われていた会話を、これからどこですればいいのかと。

いくつかの選択肢を試した結果、既存のサービスでは我々の要求を満たせないことがわかりました。

ないなら作ればいい。

……というわけで作られたのがこのMassrです。Wassrの全機能を実装するわけではないので、名前もMiniですが、さらに用途も限定されているため「あなたが求めている」Wassrですらないかも知れません。Massrが目指しているのは以下のようなものです:

* シンプルな掲示板である (スレッドや話題別のコミュはいらない)
* 会員限定 (Wassrの鍵付きユーザ同士のソーシャルネットワークを想定)
* イイネがある! (最重要)

当面はHerokuの無料プランで動作することを目指しています。利用にはTwitterアカウントが必要です。

## 実行方法

### 前準備
* Twitter用開発者登録
『https://dev.twitter.com/apps/ 』でアプリ登録

call back用のURLは『http://127.0.0.1:9393/auth/twitter/callback 』(開発用)、または、『http://XXXXXXXXX/auth/twitter/callback 』(heroku用)とする。

* MongoDBをインストールしておく

```sh
$ brew insatall mongodb
```

起動は手動で。（常時稼働するサービスではないので）

```sh
$ mongod run --config /usr/local/etc/mongod.conf
```


### 開発環境(development)で実行方法
```sh
$ export EDITOR=vim
$ export RACK_ENV=development
```

```sh 
$ git clone git://github.com/tdtds/massr.git
$ cd massr
$ mkdir vendor
$ bundle install --path vendor/bundle
$ bundle exec rackup --port 9393
```

http://127.0.0.1:9393 へ接続し、動作確認

### Heroku環境(production)での実行方法
```sh 
$ git clone git://github.com/tdtds/massr.git
$ cd massr
$ mkdir vendor
$ bundle install --path vendor/bundle

# heroku コマンドのインストール（未実施のみ）
$ gem install heroku       # rvmとかrbenvな環境の人用
# or
$ sudo gem install heroku  # 上記以外
# ここまでheroku未実施のみ

# アプリ初回作成時
$ heroku apps:create massr-XXX #アプリ作成
$ heroku addons:add mongohq:free # MongoHQの有効化
## ※ MongoHQ を有効にするには Herokuにてクレジットカード登録が必要です
$ heroku config:add \
  RACK_ENV=production \
  TWITTER_CONSUMER_ID=XXXXXXXXXXXXXXX \
  TWITTER_CONSUMER_SECRET=XXXXXXXXXXXXXXX \
  TZ=Asia/Tokyo

# アプリケーションデプロイ
$ git push heroku master
$ heroku ps:scale web=1

# ログみてちゃんと動いているか確認してください
$ heroku ps
$ heroku logs -t
```

## ライセンス
Massrの著作権は「The wasam@s production」が保有しており、GPLのもとで改変・再配布が可能です。ただし、同梱する下記のプロダクトはその限りではありません。

* Twitter Bootstrap (public/cs/bootstrap*, public/js/bootstrap*)
* public/js/jquery.autolink.js
