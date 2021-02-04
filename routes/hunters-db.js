var express = require("express");
var router = express.Router();
var mysql = require("mysql");

/**
 * IMPORTANT: add content type headers to be able to use req.body.*
  headers: {"Content-Type": "application/json"},
 */

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "hunters"
});

/**
 * run this before first USAGE to create hunters TABLE
 */
router.get("/install", function (req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    const sql = `
    CREATE TABLE IF NOT EXISTS users (id INT NOT NULL AUTO_INCREMENT, email TEXT NOT NULL, password TEXT NOT NULL, birthdate TEXT NOT NULL, PRIMARY KEY (id)) ENGINE = InnoDB;
    `;
    connection.query(sql, function (err, results) {
      if (err) throw err;
      connection.release();
      res.redirect("/");
    });
  });
});

/**
 * Should return all users (id, email, password, birthdate) from table 'users'
 */
router.get("/", function (req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    const sql = `SELECT id, email, password, birthdate FROM users`;
    connection.query(sql, function (err, results) {
      if (err) throw err;
      connection.release();
      res.json(results);
    });
  });
});

/**
 * Should create a new entry in table 'users' and returns the created resource ID
 */
router.post("/create", function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  const birthdate = req.body.birthdate;

  pool.getConnection(function (err, connection) {
    if (err) throw err;
    const sql = `INSERT INTO users (id, email, password, birthdate) VALUES (NULL, ?, ?, ?);`;
    connection.query(sql, [email, password, birthdate], function (err, results) {
      if (err) throw err;
      const id = results.insertId;
      connection.release();
      res.json({
        success: true,
        id
      });
    });
  });
});

/**
 * Should delete a user passing a user id in request body
 */
router.delete("/delete", function (req, res, next) {
  const id = req.body.id;

  pool.getConnection(function (err, connection) {
    if (err) throw err;
    const sql = `DELETE FROM users WHERE id=?`;
    connection.query(sql, [id], function (err, results) {
      if (err) throw err;
      connection.release();
      res.json({ success: true });
    });
  });
});

/**
 *
 */
router.put("/update", function (req, res, next) {
  const id = req.body.id;
  const email = req.body.firstName;
  const password = req.body.password;
  const birthdate = req.body.birthdate;

  pool.getConnection(function (err, connection) {
    if (err) throw err;
    const sql = `UPDATE users SET email=?, password=?, gitHbirthdateub=? WHERE id=?`;
    connection.query(sql, [email, password, birthdate, id], function (err, results) {
      if (err) throw err;
      connection.release();
      res.json({ success: true });
    });
  });
});

/**
 * Should return a userId if the user is in db
 */
router.get("/:id", function (req, res, next) {
  var id = req.params.id;
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    const sql = `SELECT * FROM users WHERE id=${id}`;
    connection.query(sql, function (err, results) {
      if (err) throw err;
      if (results.length == 0) {
        connection.release();
        res.status(401);
        res.json({
          "errorCode": "LGN112",
          "message": "You are not authorized to acceess this resource"
        });

      } else {
        connection.release();
        res.json({
          success: true, id, results
        });
      }
    });
  });
});

/**
 * Should retrieve all questions from table questions
 */
router.get("/question", function (req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    const sql = `SELECT name FROM questions WHERE 1`;
    connection.query(sql, function (err, results) {
      if (err) throw err;
      connection.release();
      res.json(results);
    });
  });
});

module.exports = router;