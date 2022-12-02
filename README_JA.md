# Twitter ActivityPub Bridge
TwitterのユーザーやツイートをActivityPub形式に変換するソフトウェア

[English](https://github.com/hideki0403/twitter-activitypub-bridge/blob/master/README.md) | Japanese (日本語)

## 機能
### Fediverse(*)からTwitterユーザーをフォロー
まだTwitterからMastodonなどのFediverseに移行してきていないユーザーをフォローすることができます。  
フォローすることで、Twitter側でのつぶやきをToot(Note)としてMastodonなどから閲覧することができます。
  
(*) Fediverse (ActivityPub対応ソフトウェア): Mastodon, Misskey, Pixelfedなど  

## 注意
このソフトウェアはあくまでFediverseに移行してきていない(or移行出来なさそうな)ユーザーを**一時的に**フォローするためのものです。  
具体的な利用方法としては、ソシャゲやアニメ等の(企業系)公式アカウントをフォローすることを想定しています。  
FediverseとTwitterでは文化が全く異なりますし、このソフトウェアでFediverseをTwitterのようなものにする意図はありません。  
(わざわざFediverseに来てまでTwitterの一般ユーザーばかりフォローするのであれば、FediverseではなくTwitterを利用すべきです。)  

## 使い方
1. 任意のインスタンスからフォローしたいユーザーを次の形式で検索します: `@<UserID>@<Domain>`    
   たとえば `twttr.yukineko.me` がホストしているTwitter ActivityPub Bridgeのインスタンスから Twitterの公式アカウント (@twitter) をフォローしたい場合は `@twitter@twttr.yukineko.me` になります。
2. すると対象のユーザーのプロフィールが表示されるので、フォローボタンを押して承認されればフォロー完了です。  

## セットアップ
> **Note**  
> Twitter ActivityPub Bridgeでは、以下のソフトウェアがインストール及び設定されている必要があります。  
> - Node.js (v18.12.1以降)
> - yarn (v1.x.x)
> - Redis
> - MongoDB

1. このリポジトリをクローンし、ライブラリをインストールします。
    ```bash
    $ git clone https://github.com/hideki0403/twitter-activitypub-bridge.git
    $ cd twitter-activitypub-bridge
    $ yarn install
    ```  
2. リポジトリのルートディレクトリにある `config.example.yml` を `config.yml` としてコピーし、編集します。
3. ビルドします。
    ```bash
    $ yarn build
    ```
4. ビルドが終われば完了です。以下のコマンドで起動できます。
    ```bash
    $ yarn start
    ```
5. 任意のインスタンスから `@twitter@<domain>` で検索し、[Twitterの公式アカウント](https://twitter.com/twitter)が表示できれば問題なくセットアップ出来ています。