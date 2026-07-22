const test = require("node:test");
const assert = require("node:assert/strict");

const {
  activityUrlFromRow,
  normalizeActivityRows,
  scrapeActivityPage,
} = require("../../lib/helpers/scrape-activity");
const posts = require("../../lib/linkedin/linkedin.posts");
const reactions = require("../../lib/linkedin/linkedin.reactions");
const comments = require("../../lib/linkedin/linkedin.comments");
const postsWithComments = require("../../lib/linkedin/linkedin.posts.with.comments");

const fixtureRows = [
  {
    urn: "urn:li:activity:123",
    actorName: "Ada Lovelace",
    headerText: "Sai Adarsh Sivakumar likes this",
    date: "14h • 14 hours ago",
    text: "A deterministic post",
    comments: [
      {
        name: "Sai Adarsh Sivakumar",
        text: "Good luck!",
        date: "11h",
        link: "/in/sai-adarsh/",
      },
    ],
  },
  {
    urn: "urn:li:activity:123",
    actorName: "Duplicate",
    headerText: "",
    date: "",
    text: "Duplicate card",
    comments: [],
  },
  {
    urn: "urn:li:activity:456",
    actorName: "Grace Hopper",
    headerText: "Sai Adarsh Sivakumar celebrates this",
    date: "1d",
    text: "Second post",
    comments: [],
  },
];

function activityPage(rows = fixtureRows) {
  const cardSelector = ".feed-shared-update-v2[data-urn]";

  return {
    visited: null,
    clicked: false,
    frames: () => [],
    async goto(url) {
      this.visited = url;
    },
    async $(selector) {
      return selector === cardSelector ? {} : null;
    },
    async $$eval(selector) {
      assert.equal(selector, cardSelector);
      return rows;
    },
    async click() {
      this.clicked = true;
      throw new Error("read-only scraper must not click");
    },
  };
}

test("activity normalization deduplicates URNs and bounds results", () => {
  assert.deepEqual(normalizeActivityRows(fixtureRows, 1), [
    {
      ...fixtureRows[0],
      url: "https://www.linkedin.com/feed/update/urn:li:activity:123/",
    },
  ]);
});

test("activity page extraction does not click controls", async () => {
  const page = activityPage();
  const rows = await scrapeActivityPage(page, {
    url: "https://www.linkedin.com/in/example/recent-activity/all/",
    count: 2,
    timeout: 0,
  });

  assert.equal(page.clicked, false);
  assert.deepEqual(rows, [
    {
      ...fixtureRows[0],
      url: "https://www.linkedin.com/feed/update/urn:li:activity:123/",
    },
    {
      ...fixtureRows[2],
      url: "https://www.linkedin.com/feed/update/urn:li:activity:456/",
    },
  ]);
});

test("activity normalization returns no rows for a zero count", () => {
  assert.deepEqual(normalizeActivityRows(fixtureRows, 0), []);
});

test("activity URLs are derived without opening share menus", () => {
  assert.equal(
    activityUrlFromRow({ urn: "urn:li:activity:123" }),
    "https://www.linkedin.com/feed/update/urn:li:activity:123/"
  );
  assert.equal(
    activityUrlFromRow({ url: "https://www.linkedin.com/posts/example/" }),
    "https://www.linkedin.com/posts/example/"
  );
  assert.equal(activityUrlFromRow({ urn: "javascript:alert(1)" }), "");
});

test("posts project shared activity rows without clicking", async () => {
  const page = activityPage();
  const result = await posts(page, null, {
    user: "https://www.linkedin.com/in/example/",
    count: 1,
  });

  assert.equal(page.clicked, false);
  assert.deepEqual(result, [
    {
      type: "post",
      post: "A deterministic post",
      link: "https://www.linkedin.com/feed/update/urn:li:activity:123/",
      comments: [
        {
          name: "Sai Adarsh Sivakumar",
          comment: "Good luck!",
          date: "11h",
          link: "https://www.linkedin.com/in/sai-adarsh/",
        },
      ],
      date: "14h • 14 hours ago",
    },
  ]);
});

test("reaction and comment services preserve their public result envelopes", async () => {
  const reactionPage = activityPage();
  const reactionResult = await reactions(reactionPage, null, {
    user: "https://www.linkedin.com/in/example/",
    count: 1,
  });
  assert.deepEqual(reactionResult, {
    name: "Sai Adarsh Sivakumar",
    link: "https://www.linkedin.com/in/example/recent-activity/reactions/",
    values: [
      {
        url: "https://www.linkedin.com/feed/update/urn:li:activity:123/",
        reaction: "Like",
        date: "14h • 14 hours ago",
      },
    ],
  });

  const commentPage = activityPage();
  const commentResult = await comments(commentPage, null, {
    user: "https://www.linkedin.com/in/example/",
    count: 1,
  });
  assert.deepEqual(commentResult, {
    name: "Sai Adarsh Sivakumar",
    link: "https://www.linkedin.com/in/example/recent-activity/comments/",
    values: [
      {
        url: "https://www.linkedin.com/feed/update/urn:li:activity:123/",
        comments: [
          {
            name: "Sai Adarsh Sivakumar",
            comment: "Good luck!",
            date: "11h",
            link: "https://www.linkedin.com/in/sai-adarsh/",
          },
        ],
      },
    ],
  });
});

test("postsWithComments reads a direct activity URL without clicking", async () => {
  const page = activityPage([fixtureRows[0]]);
  const result = await postsWithComments(page, null, {
    url: "https://www.linkedin.com/feed/update/urn:li:activity:123/",
    date: "14h",
  });

  assert.equal(page.clicked, false);
  assert.equal(result.link, "https://www.linkedin.com/feed/update/urn:li:activity:123/");
  assert.equal(result.date, "14h");
  assert.equal(result.comments[0].comment, "Good luck!");
});
