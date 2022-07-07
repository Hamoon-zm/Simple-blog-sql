const express = require("express");
const { query } = require("../data/database");
const router = express.Router();
const db = require("../data/database");

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  let order = req.query.order;
  let nextOrder ='asc'
  if (order !== "asc" && order !== "desc") {
    order = "desc";
  }
  if (order === 'desc'){
      nextOrder = 'asc'
  }
  if(order === 'asc'){
      nextOrder = 'desc'
  }
  
  const query = `SELECT posts.*, authors.name AS author_name, authors.email AS author_email 
    FROM posts INNER JOIN authors ON posts.author_id = authors.id`;
  const [posts] = await db.query(query);

  posts.sort(function (postA, postB) {
    if (
      (order === "asc" && postA.id > postB.id) ||
      (order === "desc" && postB.id > postA.id)
    ) {
      return 1;
    }
    return -1;
  });
  res.render("posts-list", { posts: posts , nextOrder: nextOrder});
});

router.get("/new-post", async function (req, res) {
  const [authors] = await db.query("SELECT * FROM authors");
  res.render("create-post", { authors: authors });
});

router.post("/posts", async function (req, res) {
  //storing the posts in DB
  const data = [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body.author,
  ];
 
  await db.query(
    "INSERT INTO posts (title, summary, body, author_id) VALUES(?)",
    [data]
  );
  res.redirect("/posts");
});
router.get("/author",function(req, res){
  res.render('author')
})
router.post('/author',async function(req,res){
  const data = [
    req.body.newauthor,
    req.body.email,
  ]
  await db.query(
    "INSERT INTO authors (name,email) VALUES(?)",
    [data]
  );
  res.redirect("/new-post")
})
router.get("/posts/:id", async function (req, res) {
  const query = `SELECT posts.*, authors.name AS author_name, authors.email AS author_name 
      FROM posts INNER JOIN authors ON posts.author_id = authors.id
      WHERE posts.id=?`;
  const [posts] = await db.query(query, [req.params.id]);
  if (!posts || posts.length === 0) {
    return res.status(404).render("404");
  }
  const postDate = {
    ...posts[0],
    date: posts[0].date.toISOString(),
    humandReadableDate: posts[0].date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
  res.render("post-detail", { post: postDate });
});
router.get("/posts/:id/edit", async function (req, res) {
  const query = `SELECT * FROM posts WHERE id=?`;
  const [posts] = await db.query(query, [req.params.id]);
  if (!posts || posts.length === 0) {
    res.status(404).render("404");
  }
  res.render("update-post", { post: posts[0] });
});
router.post("/posts/:id/edit", async function (req, res) {
  const query = ` UPDATE posts SET title= ?, summary= ?, body= ? WHERE id=?`;
  await db.query(query, [
    req.body.title,
    req.body.summary,
    req.body.content,
    req.params.id,
  ]);
  res.redirect("/posts");
});
router.post("/posts/:id/delete", async function (req, res) {
  await db.query("DELETE FROM posts WHERE id=?", [req.params.id]);
  res.redirect("/posts");
});
module.exports = router;
