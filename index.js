require('dotenv').config();
let Parser = require('rss-parser');
let axios = require("axios");
let Fs = require("fs-extra");
let md5 = require("md5");
let postedTitles = "./titles.json";
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

const rss2fb = async (rssURL) => {
    let feed = await parser.parseURL(rssURL);
    title = await dataFromFile(postedTitles)
    for (let index = 0; index < feed.items.length; index++) {
      const item = feed.items[index];
      let processedContent = item.contentSnippet.substring(0, item.contentSnippet.indexOf('.') + '.'.length);
      if (processedContent === "") processedContent = item.contentSnippet;
      if (!JSON.stringify(title).includes(md5(item.title))) {
        await axios({
          method: "post",
          url: 'https://graph.facebook.com/'+ process.env.PAGE_ID +'/feed',
          data: {
            message: processedContent,
            link: item.link,
            access_token: process.env.PAGE_ACCESS_TOKEN
          }
        })
          .then(_ => {
            title.push(md5(item.title));
            console.log(
              item.title +
                " has been posted\n" +
                "Content : " +
                JSON.stringify(processedContent)
            );
          })
          .catch(error => console.log(error));
        await writeToFile(postedTitles, title);
        await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }
}

const run = async _ => {
  while (true) {
  for (let index = 0; index < rss_feeds.length; index++) {
    let currentDate = '[' + new Date().toUTCString() + '] ';
    await rss2fb(rss_feeds[index])
    .then(_ => console.log(currentDate + ' Finished checking: ' + rss_feeds[index]))
    .catch(error => console.log(error));
  }
  console.log('Restarting in 3 hours');
  await new Promise(resolve => setTimeout(resolve, 10800000));
  }
}

run();
