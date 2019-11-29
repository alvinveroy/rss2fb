require('dotenv').config();
let Parser = require('rss-parser');
let axios = require("axios");
let Fs = require("fs-extra");
let md5 = require("md5");
let fb_postedTitles = "./fb_titles.json";
let linkedin_postedTitles = "./linkedin_titles.json";
let rss_feeds = process.env.RSS_FEEDS.split(",");
let parser = new Parser();
let title = [];

const writeToFile = async (path, data) => {
    const json = JSON.stringify(data, null, 2);
    try {
        await Fs.writeFile(path, json);
        console.log("Saved data to file.");
        } catch (error) {
        console.error(error);
    }
}

const dataFromFile = async (path) => {
  try {
    const json = await Fs.readFile(path, "utf8");
    const content = JSON.parse(json);
    return content;
  } catch (error) {
    console.log(error);
  }
}

const post2fb = async (feed) => {
  let processedContent = feed.contentSnippet.substring(0, feed.contentSnippet.indexOf('.') + '.'.length);
  if (processedContent === "") processedContent = feed.contentSnippet;  
  await axios({
    method: "post",
    url: 'https://graph.facebook.com/' + process.env.FB_PAGE_ID + '/feed',
    data: {
      message: processedContent,
      link: item.link,
      access_token: process.env.FB_PAGE_ACCESS_TOKEN
    }
  })
    .then(async _ => {
      title.push(md5(item.title));
      console.log(
        item.title +
        " has been posted\n" +
        "Content : " +
        JSON.stringify(processedContent)
      );
      await writeToFile(postedTitles, title);
    })
    .catch(error => console.log(error));
}

const post2linkedin = async (feed) => {
  let processedContent = feed.contentSnippet.substring(0, feed.contentSnippet.indexOf('.') + '.'.length);
  if (processedContent === "") processedContent = feed.contentSnippet;
  await axios({
    method: "post",
    url: 'https://api.linkedin.com/v2/ugcPosts',
    headers: {
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'Authorization': 'Bearer ' + process.env.LINKEDIN_ACCESS_TOKEN
    },
    data: {
      "author": "urn:li:person:" + process.env.LINKEDIN_PERSON_URN,
      "lifecycleState": "PUBLISHED",
      "specificContent": {
        "com.linkedin.ugc.ShareContent": {
          "shareCommentary": {
            "text": processedContent
          },
          "shareMediaCategory": "ARTICLE",
          "media": [
            {
              "status": "READY",
              "description": {
                "text": processedContent
              },
              "originalUrl": feed.link,
              "title": {
                "text": feed.title
              }
            }
          ]
        }
      },
      "visibility": {
        "com.linkedin.ugc.MemberNetworkVisibility": "CONNECTIONS"
      }
    }
  })
    .then(async _ => {
      title.push(md5(feed.title));
      console.log(
        feed.title +
        " has been posted\n" +
        "Content : " +
        JSON.stringify(processedContent)
      );
      await writeToFile(postedTitles, title);
    })
    .catch(error => console.log(error));
}

const rss2fb = async (rssURL) => {
    let feed = await parser.parseURL(rssURL);
    title = await dataFromFile(fb_postedTitles);
    for (let index = 0; index < feed.items.length; index++) {
      const item = feed.items[index];
      if (!JSON.stringify(title).includes(md5(item.title))) {
        console.log('Posting on Facebook');
        await post2fb(item);
        await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }
}

const rss2linkedin = async (rssURL) => {
  let feed = await parser.parseURL(rssURL);
  title = await dataFromFile(linkedin_postedTitles);
  for (let index = 0; index < feed.items.length; index++) {
    const item = feed.items[index];
    if (!JSON.stringify(title).includes(md5(item.title))) {
      console.log('Posting on Linkedin');
      await post2linkedin(item);
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }
}

const run = async _ => {
  let currentDate = "";
  for (let index = 0; index < rss_feeds.length; index++) {
    currentDate = '[' + new Date().toUTCString() + '] ';
    await rss2fb(rss_feeds[index])
      .then(_ => console.log(currentDate + ' Finished checking for Facebook: ' + rss_feeds[index]))
      .catch(error => console.log(error));
    await rss2linkedin(rss_feeds[index])
      .then(_ => console.log(currentDate + ' Finished checking for Linkedin: ' + rss_feeds[index]))
      .catch(error => console.log(error));    
  }
  currentDate = "[" + new Date().toUTCString() + "] ";
  console.log(currentDate + ' Executed successfully.');
}

run();
