require('dotenv').config();
const Parser = require('rss-parser');
const axios = require("axios");
const md5 = require("md5");
const mongoose = require("mongoose");
const rss_feeds = process.env.RSS_FEEDS.split(",");
const parser = new Parser();

let uristring = process.env.MONGODB_URI || "mongodb://localhost/rss2fb";

const fbpostSchema = new mongoose.Schema({
  postedTitles: String,
});

const linkedinpostSchema = new mongoose.Schema({
  postedTitles: String,
});

const fbTitles = mongoose.model("FBTitles", fbpostSchema);
const linkedinTitles = mongoose.model("LinkedinTitles", linkedinpostSchema);

const saveFBTitles = async (title) => {
  const md5title = new FBTitles({
    postedTitles: title
  });
    const result = await md5title.save();
    console.log(result);  
}

const saveLinkedinTitles = async (title) => {
  const md5title = new LinkedinTitles({
    postedTitles: title
  });
    const result = await md5title.save();
    console.log(result);  
};

const post2fb = async (feed) => {
  let processedContent = feed.contentSnippet.substring(0, feed.contentSnippet.indexOf('.') + '.'.length);
  if (processedContent === "") processedContent = feed.contentSnippet;  
  await saveFBTitles(md5(feed.title));
  // await axios({
  //   method: "post",
  //   url: 'https://graph.facebook.com/' + process.env.FB_PAGE_ID + '/feed',
  //   data: {
  //     message: processedContent,
  //     link: item.link,
  //     access_token: process.env.FB_PAGE_ACCESS_TOKEN
  //   }
  // })
  //   .then(async _ => {
  //     await saveFBTitles(md5(item.title));
  //     console.log(
  //       item.title +
  //       " has been posted\n" +
  //       "Content : " +
  //       JSON.stringify(processedContent)
  //     );
  //   })
  //   .catch(error => console.log(error));
}

const post2linkedin = async (feed) => {
  let processedContent = feed.contentSnippet.substring(0, feed.contentSnippet.indexOf('.') + '.'.length);
  if (processedContent === "") processedContent = feed.contentSnippet;
  await saveLinkedinTitles(md5(feed.title));
  // await axios({
  //   method: "post",
  //   url: 'https://api.linkedin.com/v2/ugcPosts',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'X-Restli-Protocol-Version': '2.0.0',
  //     'Authorization': 'Bearer ' + process.env.LINKEDIN_ACCESS_TOKEN
  //   },
  //   data: {
  //     "author": "urn:li:person:" + process.env.LINKEDIN_PERSON_URN,
  //     "lifecycleState": "PUBLISHED",
  //     "specificContent": {
  //       "com.linkedin.ugc.ShareContent": {
  //         "shareCommentary": {
  //           "text": processedContent
  //         },
  //         "shareMediaCategory": "ARTICLE",
  //         "media": [
  //           {
  //             "status": "READY",
  //             "description": {
  //               "text": processedContent
  //             },
  //             "originalUrl": feed.link,
  //             "title": {
  //               "text": feed.title
  //             }
  //           }
  //         ]
  //       }
  //     },
  //     "visibility": {
  //       "com.linkedin.ugc.MemberNetworkVisibility": "CONNECTIONS"
  //     }
  //   }
  // })
  //   .then(async _ => {
  //     await saveLinkedinTitles(md5(feed.title));
  //     console.log(
  //       feed.title +
  //       " has been posted\n" +
  //       "Content : " +
  //       JSON.stringify(processedContent)
  //     );
  //   })
  //   .catch(error => console.log(error));
}

const rss2fb = async (rssURL) => {
    let feed = await parser.parseURL(rssURL);
    for (let index = 0; index < feed.items.length; index++) {
      const item = feed.items[index];
      //let title = await fbTitles.find({ postedTitles: { $eq: md5(item.title) } })
      //if (!title) {
        console.log('Posting on Facebook');
        await post2fb(item);
        await new Promise(resolve => setTimeout(resolve, 60000));
    //}
  }
}

const rss2linkedin = async (rssURL) => {
  let feed = await parser.parseURL(rssURL);
  for (let index = 0; index < feed.items.length; index++) {
    const item = feed.items[index];
    //let title = await linkedinTitles.find({postedTitles: { $eq: md5(item.title) }});
    //if (!title) {
      console.log('Posting on Linkedin');
      await post2linkedin(item);
      await new Promise(resolve => setTimeout(resolve, 60000));
    //}
  }
}

const run = async _ => {
  await mongoose
    .connect(uristring, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Now connected to mLab!"))
    .catch(err => console.error("Something went wrong", err));

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

run().catch(err => console.error("Something went wrong", err));
