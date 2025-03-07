var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => parseFromUrl,
  parseFromString: () => parseFromString,
  parseFromUrl: () => parseFromUrl
});
module.exports = __toCommonJS(index_exports);

// src/parse.ts
var import_fast_xml_parser = require("fast-xml-parser");
async function parseFromUrl(url, config) {
  if (!/(^http(s?):\/\/[^\s$.?#].[^\s]*)/i.test(url)) return null;
  const data = await fetch(url, config).then((r) => r.text());
  return parseFromString(data);
}
function parseFromString(data) {
  var _a, _b;
  const xml = new import_fast_xml_parser.XMLParser({
    attributeNamePrefix: "",
    textNodeName: "$text",
    ignoreAttributes: false
  });
  const result = xml.parse(data);
  let channel = result.rss && result.rss.channel ? result.rss.channel : result.feed;
  if (Array.isArray(channel)) channel = channel[0];
  const rss = {
    title: (_a = channel.title) != null ? _a : "",
    description: (_b = channel.description) != null ? _b : "",
    link: channel.link && channel.link.href ? channel.link.href : channel.link,
    image: channel.image ? channel.image.url : channel["itunes:image"] ? channel["itunes:image"].href : "",
    category: channel.category || [],
    items: []
  };
  let items = channel.item || channel.entry || [];
  if (items && !Array.isArray(items)) items = [items];
  for (let i = 0; i < items.length; i++) {
    const val = items[i];
    const media = {};
    const obj = {
      id: val.guid && val.guid.$text ? val.guid.$text : val.id,
      title: val.title && val.title.$text ? val.title.$text : val.title,
      description: val.summary && val.summary.$text ? val.summary.$text : val.description,
      link: val.link && val.link.href ? val.link.href : val.link,
      author: val.author && val.author.name ? val.author.name : val["dc:creator"],
      published: val.created ? Date.parse(val.created) : val.pubDate ? Date.parse(val.pubDate) : Date.now(),
      created: val.updated ? Date.parse(val.updated) : val.pubDate ? Date.parse(val.pubDate) : val.created ? Date.parse(val.created) : Date.now(),
      category: val.category || [],
      content: val.content && val.content.$text ? val.content.$text : val["content:encoded"],
      enclosures: val.enclosure ? Array.isArray(val.enclosure) ? val.enclosure : [val.enclosure] : []
    };
    ["content:encoded", "podcast:transcript", "itunes:summary", "itunes:author", "itunes:explicit", "itunes:duration", "itunes:season", "itunes:episode", "itunes:episodeType", "itunes:image"].forEach((s) => {
      if (val[s]) obj[s.replace(":", "_")] = val[s];
    });
    if (val["media:thumbnail"]) {
      Object.assign(media, { thumbnail: val["media:thumbnail"] });
      obj.enclosures.push(val["media:thumbnail"]);
    }
    if (val["media:content"]) {
      Object.assign(media, { thumbnail: val["media:content"] });
      obj.enclosures.push(val["media:content"]);
    }
    if (val["media:group"]) {
      if (val["media:group"]["media:title"]) obj.title = val["media:group"]["media:title"];
      if (val["media:group"]["media:description"]) obj.description = val["media:group"]["media:description"];
      if (val["media:group"]["media:thumbnail"]) obj.enclosures.push(val["media:group"]["media:thumbnail"].url);
      if (val["media:group"]["media:content"]) obj.enclosures.push(val["media:group"]["media:content"]);
    }
    Object.assign(obj, { media });
    rss.items.push(obj);
  }
  return rss;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseFromString,
  parseFromUrl
});
//# sourceMappingURL=index.js.map