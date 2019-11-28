# RSS2FB
### Automatically extracts your rss feed and post it on your facebook page.

Managing Facebook page takes effort in populating it with contents. Often times we just share articles from our favorite sites.
I personally struggle to think of creative words to describe what I wanted to share to capture people's attention and quite often, the first paragraph of the content snippet is enough to be the message of your post. So I decided to create an app that will constantly check for my RSS feeds and automatically post it on my facebook page that I manage.
With the help of rss-parser and utilizing the Facebook's graph API it made my job easier.

There are 3 configurations you need to set to get this code working:

1. Facebook page ID - It is located under your page settings on the about section.
2. Page access token - Steps are explained below
3. The RSS feed URL in http - I encountered error using https:// on the url so to be safe change it to http:// and make sure its working by visiting it with your browser.

To create a facebook app go to https://developers.facebook.com/apps and fill out all the required fields.

You can follow these steps in creating a facebook app from this website. https://www.codexworld.com/create-facebook-app-id-app-secret/

Once you're finished follow these steps:

1. Grab your APPID, APPSECRET, USERTOKEN
2. Go here: https://graph.facebook.com/v2.9/oauth/access_token?grant_type=fb_exchange_token&client_id=APPID&client_secret=APPSECRET&fb_exchange_token=USERTOKEN
3. Grab the access token generated on step3 and replace it here: https://graph.facebook.com/PAGEID?fields=access_token&access_token=ACCESSTOKEN

Now that you have all these create a file named .env and paste its corresponding value.

```
PAGE_ID = <YOUR_PAGE_ID_NUMBER>
PAGE_ACCESS_TOKEN = <YOUR_LONG_LIVED_PAGE_ACCESS_TOKEN>
RSS_FEEDS = http://feeds.feedburner.com/TheHackersNews, http://feeds.feedburner.com/eset/blog
```

You can add more RSS Feeds seperated by comma.

now type npm install then npm start