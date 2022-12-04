# Twitter ActivityPub Bridge
Convert twitter users and tweets to ActivityPub format.  

English | [Japanese (日本語)](https://github.com/hideki0403/twitter-activitypub-bridge/blob/master/README_JA.md)

## Features
### Follow twitter user from Fediverse(*)
You can follow users who have not moved from Twitter to the Fediverse, such as Mastodon.  
By following a user, tweets on the Twitter side can be viewed as toots (notes) from Fediverse instances such as Mastodon.  
  
(*) Fediverse (ActivityPub compatible software): Mastodon, Misskey, Pixelfed, etc.  

## Notice
This software is only for **temporarily** following users who have not moved (or seem unable to move) to Fediverse.  
Specific usage is intended to follow official accounts for games, anime, etc.  
Fediverse and Twitter have very different cultures, and there is no intention to make Fediverse more like Twitter with this software.  
(If you would rather come to Fediverse and follow only general (not official) users on Twitter, you should use Twitter instead of Fediverse.)  

## How to use
1. Search for the Twitter user you want to follow from any instance in the following format: `@<UserID>@<Domain>`  
   For example, if you want to follow the official Twitter account (@twitter) from the instance of Twitter ActivityPub Bridge hosted by `twttr.yukineko.me`, you can search for: `@twitter@twttr.yukineko.me`  
2. Then press the Follow button, and once the follow is approved, you are done.

## Setup
> **Note**  
> Twitter ActivityPub Bridge requires the following software will be installed and configured.  
> - Node.js (v18.12.1 or later)
> - yarn (v1.x.x)
> - Redis
> - MongoDB

### 1. Clone the repository
```bash
$ git clone https://github.com/hideki0403/twitter-activitypub-bridge.git
$ cd twitter-activitypub-bridge
```

### 2. Install the library
```bash
$ yarn install
```

### 3. Edit configuration file
Copy `config.example.yml` from the root of the directory and rename it to `config.yml`.  
Then edit the file according to the comments in the file.

### 4. Build
```bash
$ yarn build
```

### 5. Launch
After the build is complete, you can launch it with the following command
```bash
$ yarn start
```
If you search for `@twitter@<domain>` from Mastodon, etc. and can see the [official Twitter account](https://twitter.com/twitter), you are set up with no problem.