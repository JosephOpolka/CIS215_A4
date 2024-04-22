const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// parses json requests
app.use(bodyParser.json());

app.use(cors());

// connection to car-trips.db
const db = new sqlite3.Database('purchase_system.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to purchase_system.db successfully!');
    }
});

// VSCode - node server_backend.js in terminal window to start backend

// DISPLAYING TABLES
app.get('/api/users', (req, res) => {
    const query = 'SELECT * FROM Users';

    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/catalog', (req, res) => {
    const query = 'SELECT * FROM Catalog';

    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/purchases', (req, res) => {
    const query = 'SELECT * FROM Purchases';

    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});


// ADDING ENTRIES
app.post('/api/add-users', (req, res) => {
    const data = req.body;
    console.log("Console logging");
    console.log(data);

    const query = 'INSERT INTO Users (name, dob, email, phone) VALUES (?, ?, ?, ?)';
    const { name, dob, email, phone } = data;

    db.run(query, [name, dob, email, phone], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const user_id = this.lastID; // Get the last inserted user_id
        res.json({ message: 'User added successfully', user_id: user_id });
    });
});

app.post('/api/add-purchases', (req, res) => {
    const { user_id, item_id, unit_price, quantity, total_price } = req.body;

    // Increment Purchase per User
    const getPurchaseNumberQuery = `
        SELECT COALESCE(MAX(user_purchase), 0) + 1 AS next_purchase_number 
        FROM Purchases 
        WHERE user_id = ?
    `;

    db.get(getPurchaseNumberQuery, [user_id], (err, row) => {
        if (err) {
            console.error("Error calculating next purchase number:", err.message);
            return res.status(500).json({ error: err.message });
        }

        const user_purchase = row.next_purchase_number;

        const insertQuery = `
            INSERT INTO Purchases 
            (user_id, item_id, unit_price, quantity, total_price, user_purchase) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(insertQuery, [user_id, item_id, unit_price, quantity, total_price, user_purchase], function(err) {
            if (err) {
                console.error("Error inserting new purchase:", err.message);
                return res.status(500).json({ error: err.message });
            }
            
            res.json({ message: 'Purchase added successfully', purchase_id: this.lastID, user_purchase });
        });
    });
});

app.post('/api/update-debt', (req, res) => {
    const { user_id, amount } = req.body;
    console.log(`Updating debt for user_id: ${user_id} with amount: ${amount}`); // Logging for debugging
    const query = 'UPDATE Users SET debt = debt + ? WHERE user_id = ?';

    db.run(query, [amount, user_id], function(err) {
        if (err) {
            console.error('Error updating debt:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Debt updated successfully', user_id: user_id, new_debt: this.changes });
    });
});


// DELETING ENTRIES
app.delete('/api/delete-users/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM Users WHERE user_id = ?';

    db.run(query, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'User deleted successfully' });
    });
});

app.delete('/api/delete-purchases/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM Purchases WHERE purchase_id = ?';

    db.run(query, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Purchase deleted successfully' });
    });
});


// Querying
app.post('/api/query', (req, res) => {
    const { table, id, column, contain } = req.body;
    const singularTableName = table.slice(0, -1);

    let query = `SELECT ${column} FROM ${table}`;

    let whereClause = '';

    if (id) {
        const idColumnName = `${singularTableName}_id`;
        whereClause += ` ${idColumnName} = ${id}`;
    }
    if (contain && !id) {
        whereClause += ` ${column} LIKE '%${contain}%'`;
    } else if (contain && id) {
        whereClause += ` AND ${column} LIKE '%${contain}%'`;
    }

    if (whereClause) {
        query += ` WHERE${whereClause}`;
    }

    db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});


// For displaying Purchase Reciepts
app.get('/api/purchase-receipt/:userId/:userPurchase', (req, res) => {
    const userId = req.params.userId;
    const userPurchase = req.params.userPurchase;

    const query = `
        SELECT 
            U.name AS customer_name,
            P.purchase_date,
            P.quantity,
            C.item_name,
            C.item_id,
            P.unit_price,
            (P.quantity * P.unit_price) AS item_total,
            P.total_price
        FROM Purchases P
        JOIN Users U ON P.user_id = U.user_id
        JOIN Catalog C ON P.item_id = C.item_id
        WHERE P.user_id = ? AND P.user_purchase = ?;
    `;

    db.get(query, [userId, userPurchase], (err, row) => {
        if (err) {
            console.error("Error retrieving purchase details:", err.message);
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'No data found' });
        }
    });
});



const PORT = 3000;
// starts server
app.listen(PORT, () => {
    console.log('Server is running on http://localhost:3000');
});