import { pool } from "../db.js";

export const getEmployees = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT g.id, g.img_url, g.offer, g.price, g.stock, g.title, g.rating, g.release_date, g.short_description, c1._name AS publisher, c2._name AS developer, GROUP_CONCAT(DISTINCT ge._name) AS genres FROM games g JOIN company c1 ON g.publishers_id = c1.company_id JOIN company c2 ON g.developers_id = c2.company_id LEFT JOIN games_genres gg ON g.id = gg.games_id LEFT JOIN genres ge ON gg.genres_id = ge.genres_id GROUP BY g.id;"
    );
    res.json(rows);
  } catch (error) {
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const getEmployee = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT g.id, g.img_url, g.offer, g.price, g.stock, g.title, g.rating, g.release_date, g.short_description, c1._name AS publisher, c2._name AS developer, GROUP_CONCAT(DISTINCT ge._name) AS genres FROM games g JOIN company c1 ON g.publishers_id = c1.company_id JOIN company c2 ON g.developers_id = c2.company_id LEFT JOIN games_genres gg ON g.id = gg.games_id LEFT JOIN genres ge ON gg.genres_id = ge.genres_id WHERE g.id = ? GROUP BY g.id;",
      [req.params.id]
    );
    if (rows.length <= 0)
      return res.status(404).json({
        message: "Game not found",
      });
    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const createEmployees = async (req, res) => {
  try {
    const {
      img_url,
      offer,
      price,
      stock,
      title,
      rating,
      developer,
      publisher,
      release_date,
      short_description,
    } = req.body;

    const formattedReleaseDate = new Date(release_date);

    // Obtener la fecha formateada como "YYYY-MM-DD"
    const year = formattedReleaseDate.getFullYear();
    const month = String(formattedReleaseDate.getMonth() + 1).padStart(2, "0"); // Agrega ceros a la izquierda si es necesario
    const day = String(formattedReleaseDate.getDate()).padStart(2, "0"); // Agrega ceros a la izquierda si es necesario
    const formattedDateString = `${year}-${month}-${day}`;

    const [rows] = await pool.query(
      "INSERT INTO games (img_url, offer, price, stock, title, rating, release_date, short_description, publishers_id, developers_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        img_url,
        offer,
        price,
        stock,
        title,
        rating,
        formattedDateString,
        short_description,
        publisher,
        developer,
      ]
    );

    res.send({
      id: rows.insertId,
      img_url,
      offer,
      price,
      stock,
      title,
      rating,
      release_date: formattedDateString,
      short_description,
      publisher,
      developer,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM games, games_genres USING games LEFT JOIN games_genres ON games.id = games_genres.games_id WHERE games.id = ?",
      [req.params.id]
    );

    if (result.affectedRows <= 0)
      return res.status(404).json({
        message: "Game not found",
      });

    res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};

export const updateEmployee = async (req, res) => {
  const { id } = req.params;

  const {
    img_url,
    offer,
    price,
    stock,
    title,
    rating,
    release_date,
    short_description,
    publisher,
    developer,
    genre,
  } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE games SET img_url = IFNULL(?, img_url), offer = IFNULL(?, offer), price = IFNULL(?, price), stock = IFNULL(?, stock), title = IFNULL(?, title), rating = IFNULL(?, rating), release_date = IFNULL(?, release_date), short_description = IFNULL(?, short_description), publishers_id = IFNULL(?, publishers_id), developers_id = IFNULL(?, developers_id) WHERE id = ?",
      [
        img_url,
        offer,
        price,
        stock,
        title,
        rating,
        release_date,
        short_description,
        publisher,
        developer,
        id,
      ]
    );

    if (result.affectedRows <= 0)
      return res.status(404).json({
        message: "Game not found",
      });

    const [rows] = await pool.query(
      "SELECT g.id, g.img_url, g.offer, g.price, g.stock, g.title, g.rating, g.release_date, g.short_description, c1._name AS publisher, c2._name AS developer, GROUP_CONCAT(DISTINCT ge._name) AS genres FROM games g JOIN company c1 ON g.publishers_id = c1.company_id JOIN company c2 ON g.developers_id = c2.company_id LEFT JOIN games_genres gg ON g.id = gg.games_id LEFT JOIN genres ge ON gg.genres_id = ge.genres_id WHERE g.id = ? GROUP BY g.id;",
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({
      message: "Something goes wrong",
    });
  }
};
