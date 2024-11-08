const express = require("express");
const { neon } = require("@neondatabase/serverless");
const app = express();
app.use(express.json());
const port = 3000;

const sql = neon(
  "postgresql://bazar_owner:nfoQIw6qP3zi@ep-steep-wind-a53i566e.us-east-2.aws.neon.tech/bazar?sslmode=require"
);

app.get("/", () => {
  res.send("API Funcionando");
});

app.get("/api/items/", async (req, res) => {
  const { q } = req.query;

  let productos;
  if (q) {
    productos = await sql`
        SELECT * FROM productos
        WHERE title LIKE ${"%" + q + "%"} OR description LIKE ${"%" + q + "%"}
      `;
  } else {
    productos = await sql`
        SELECT * FROM productos
      `;
  }

  res.json(productos);
});

app.get("/api/items/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [item] = await sql`
        SELECT * FROM productos
        WHERE id = ${id}
      `;

    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: "Item not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/addSale", async (req, res) => {
  const { idProducto } = req.body;

  if (!idProducto) {
    return res.status(400).json({ error: "idProducto is required" });
  }

  try {
    const [newSale] = await sql`
        INSERT INTO ventas (idProducto)
        VALUES (${idProducto})
        RETURNING *
      `;

    res.status(201).json({ventaCreada: true});
  } catch (error) {
    res.status(500).json({ventaCreada: false});
  }
});

app.get("/api/sales/", async (req, res) => {
  const sales = await sql`
      SELECT ventas.*, productos.*
      FROM ventas
      INNER JOIN productos ON ventas.idProducto = productos.id
    `;
  res.json(sales);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
