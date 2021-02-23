const express = require("express");
const router = express.Router();
const mysql = require("mysql");

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
 * Should retrieve all questions from table questions
 */
router.get("/question", function (req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    const sql = `SELECT text FROM questions WHERE 1`;
    connection.query(sql, function (err, results) {
      if (err) throw err;
      connection.release();
      res.json(results);
    });
  });
});

/**
* Return random X questions from table questions
*/

router.get("/random", function (req, res, next) {
  let param = undefined;
  for (const key in req.query) {
    param = req.query[key];
  }
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    const sql = `SELECT id, text, option_a, option_b, option_c, image_path FROM questions ORDER BY RAND() LIMIT ${param}`;
    connection.query(sql, [param], function (err, results) {
      if (err) throw err;
      connection.release();
      res.json(results);
    });
  });
});

/**
 * Should retrieve 200 OK and the user data, if the user is in db
 */
router.post("/authenticate", function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  pool.getConnection(function (err, connection) {
    if (err) throw err;
    const sql = `SELECT * FROM users WHERE email=? AND password=?`;
    connection.query(sql, [email, password], function (err, results) {
      if (err) throw err;
      if (results.length > 0) {
        connection.release();
        res.cookie("test", email, { withCredentials: true, credentials: 'include' });
        res.json(results);
      } else {
        res.status(401);
        res.json({
          "errorCode": "LGN401",
          "message": "Invalid credentials."
        });
      }

    });
  });
});

/**
 * Should retrieve all the requested answers like: 
    {
       "id": "1",
        "option": "1",
        "correct": "1",
        "isCorrect": false
    }
 */
router.post("/validate", function (req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    const sql = `SELECT id, answer FROM questions WHERE id IN (${Array(req.body.length).fill('?').join(', ')})`;
    connection.query(sql, req.body.map(answer => answer.id), function (err, results) {
      if (err) throw err
      results = JSON.parse(JSON.stringify(results))

      const finalResp = [];
      for (const answer of req.body) {
        const correctedAnswer = { ...answer };
        const dbAnswer = results.find(r => r.id == answer.id);
        correctedAnswer.correct = dbAnswer.answer.toString();
        correctedAnswer.isCorrect = dbAnswer.answer == answer.option
        finalResp.push(correctedAnswer);
      }
      connection.release();
      res.json(finalResp);
    });
  });
});

/**
 * Should return a userId if the user is in db
 */
router.get("/:id", function (req, res, next) {
  const id = req.params.id;
  pool.getConnection(function (err, connection) {
    if (err) throw err;
    const sql = `SELECT * FROM users WHERE id=?`;
    connection.query(sql, [id], function (err, results) {
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



module.exports = router;