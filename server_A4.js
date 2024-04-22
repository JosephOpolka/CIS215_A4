document.addEventListener("DOMContentLoaded", function () {
    // Displaying Success Message
    function resultsDisplay(result) {
        var successMessage = document.getElementById("successMessage");
        successMessage.textContent = result;
        successMessage.style.display = "block";
        setTimeout(function () {
            successMessage.style.display = "none";
        }, 2500);
    }

    // Displaying Add Entry Forms
    function showSelectedForm() {
        var selectedOption = document.getElementById("add_drop").value;
        console.log("Selected Option = ", selectedOption);

        // Hide all form elements
        var forms = document.querySelectorAll('[id^="add_entry_"]');
        forms.forEach(function (form) {
            form.style.display = 'none';
        });
        
        // Show the selected form
        var selectedForm = document.getElementById('add_entry_' + selectedOption);
        console.log('Selected form:', selectedForm);
        if (selectedForm) {
            selectedForm.style.display = 'grid';
        }

        resultsDisplay("Add Entry: table selected");
    }

    // event listener for dropdown
    var tableDrop = document.getElementById("add_drop");
    tableDrop.addEventListener("change", showSelectedForm);

    showSelectedForm();

    
    function showSelectedQueryForm() {
        var selectedTable = document.getElementById("query_drop").value;
        console.log("Selected Table = ", selectedTable);
    
        // Hide all column dropdowns
        var columnDropdowns = document.querySelectorAll('[id^="query_column_"]');
        columnDropdowns.forEach(function (dropdown) {
            dropdown.style.display = 'none';
        });
        
        // Show the selected column dropdown
        var selectedColumnDropdown = document.getElementById('query_column_' + selectedTable);
        console.log('Selected Column Dropdown:', selectedColumnDropdown);
        if (selectedColumnDropdown) {
            selectedColumnDropdown.style.display = 'block';
        }
    }
    
    // Add event listener to the Table dropdown
    var queryTableDrop = document.getElementById("query_drop");
    queryTableDrop.addEventListener("change", showSelectedQueryForm);
    
    showSelectedQueryForm(); 


    // BEGGINING OF DATA COLLECTION

    // Dates (except for dob)
    // are automatically handled by the database

    //ADD ENTRY
    function AddUser(event, table) {
        event.preventDefault();
        const formData = {
            name: document.getElementById('user_name').value,
            dob: document.getElementById('user_dob').value,
            email: document.getElementById('user_email').value,
            phone: document.getElementById('user_phone').value,
        }
    
        // Form Validation
        if (!formData.name || !formData.dob || !formData.email || !formData.phone) {
            alert('All fields must be filled!');
            return;
        }
    
        console.log(formData);
    
        fetch(`http://localhost:3000/api/add-${table.toLowerCase()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add new user');
            }
            return response.json();
        })
        .then(result => {
            resultsDisplay("New User has been made successfully.");
    
            // Clear input fields
            document.getElementById('user_name').value = '';
            document.getElementById('user_dob').value = '';
            document.getElementById('user_email').value = '';
            document.getElementById('user_phone').value = '';
    
            // Fetch updated data
            fetchData(`http://localhost:3000/api/${table.toLowerCase()}`);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        });
    }

    function AddPurchase(event, table) {
        event.preventDefault();
        const purchaseForm = {
            user_id: document.getElementById('checkout_usr_id').value,
            item_id: document.getElementById('catalog_items').value,
            unit_price: document.querySelector('.unit_price').textContent.slice(1), // Removes the '$' prefix
            quantity: document.getElementById('quantity').value,
            total_price: document.querySelector('.total').textContent.split(' - $')[1] // Extracts the numeric part
        };
    
        console.log(purchaseForm);
    
        fetch(`http://localhost:3000/api/add-${table.toLowerCase()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(purchaseForm)
        })
        .then(response => response.json())
        .then(result => {
            resultsDisplay("Purchase added successfully.");
    
            // Clear input fields
            document.getElementById('checkout_usr_id').value = '';
            document.getElementById('catalog_items').selectedIndex = 0; // Resets to the first option
            document.getElementById('quantity').value = '';
    
            // Fetch updated data
            fetchData(`http://localhost:3000/api/${table.toLowerCase()}`);
    
            // Optionally update user debt
            updateDebt(purchaseForm.user_id, purchaseForm.total_price);
        })
        .catch(error => console.error('Error:', error));
    }
    
    function updateDebt(user_id, amount) {
        const data = {
            user_id: user_id,
            amount: parseFloat(amount)
        };
    
        fetch('http://localhost:3000/api/update-debt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update user debt');
            }
            return response.json();
        })
        .then(result => {
            console.log('Debt updated successfully:', result);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    document.getElementById('add_submit_Users').addEventListener('click', function(event) {
        console.log("Add Users has been clicked :D");
        AddUser(event, 'Users');
    });

    document.getElementById('add_submit_Purchases').addEventListener('click', function(event) {
        console.log("Add Purchase has been clicked :D");
        AddPurchase(event, 'Purchases');
    });


    // UPDATING CHECKOUT - ITEMS INFO
    const selectElement = document.getElementById("catalog_items");
    const descriptionElement = document.querySelector('.description');
    const priceElement = document.querySelector('.unit_price');
    const quantityInput = document.getElementById("quantity");
    const totalElement = document.querySelector('.total');
    let catalogItems = [];

    fetchCatalogItems();

    // Initially load and display the first item's details
    selectElement.addEventListener('change', function () {
        const itemId = this.value;
        updateItemDetails(itemId);
    });

    // Listen for changes in the quantity input to update the total cost
    quantityInput.addEventListener('input', updateTotal);

    function fetchCatalogItems() {
        fetch('http://localhost:3000/api/catalog')
            .then(response => response.json())
            .then(items => {
                catalogItems = items;
                updateItemDetails(selectElement.value); // Update initially with the first item selected
            })
            .catch(error => console.error('Failed to load catalog items:', error));
    }

    function updateItemDetails(itemId) {
        const item = catalogItems.find(item => item.item_id.toString() === itemId);
        if (item) {
            descriptionElement.textContent = item.item_description || 'Description unavailable';
            priceElement.textContent = `$${parseFloat(item.unit_price).toFixed(2)}`;
            updateTotal(); // Also update total whenever item details are updated
        } else {
            descriptionElement.textContent = 'Description unavailable';
            priceElement.textContent = 'Price unavailable';
        }
    }

    function updateTotal() {
        const unitPrice = parseFloat(priceElement.textContent.replace('$', '')) || 0;
        const quantity = parseFloat(quantityInput.value) || 1;
        const total = unitPrice * quantity;
        totalElement.textContent = `Purchase Total - $${total.toFixed(2)}`;
    }



    // REMOVE ENTRY
    function deleteEntry(event) {
        event.preventDefault();

        const table = document.getElementById("delete_drop").value;
        const id = document.getElementById("delete_id").value;

        if (!id) {
            window.alert("Please enter an ID to delete.");
            return;
        } else if (!/^\d+$/.test(id)) {
            alert('Please enter a valid numerical ID number.');
            return;
        }

        const confirmed = window.confirm(`Are you sure you want to delete entry with ID ${id} from ${table} table?`);
        if (confirmed) {
            fetch(`http://localhost:3000/api/delete-${table.toLowerCase()}/${id}`, {
                method: "DELETE"
            })
            .then(response => response.json())
            .then(result => {
                // Display success message or handle any errors
                console.log(result);
                resultsDisplay(result.message);
                document.getElementById("delete_id").value = "";
                fetchData(`http://localhost:3000/api/${table.toLowerCase()}`);
            })
            .catch(error => console.error("Error:", error));
        }
    }

    const deleteButton = document.getElementById("delete_submit");
    deleteButton.addEventListener("click", deleteEntry);

    // QUERYING DATABASE
    document.getElementById("query_submit").addEventListener("click", function (event) {
        event.preventDefault();
    
        const table = document.getElementById("query_drop").value;
        const id = document.getElementById("query_id").value;
        const column = document.getElementById(`query_column_${table}`).value;
        const contain = document.getElementById("query_contain").value;
    
        const queryData = { table, id, column, contain };
    
        fetch(`http://localhost:3000/api/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(queryData)
        })
        .then(response => response.json())
        .then(result => {
            // Process the query result
            console.log(result);
            createDriversTable(result); // Pass the result directly to the function
            resultsDisplay("Query has been made successfully.");
        })
        .catch(error => console.error('Error:', error));
    });


    document.getElementById('reciept_submit').addEventListener('click', function() {
        const userId = document.getElementById('user_id_input').value; // ID input for user
        const userPurchase = document.getElementById('purchase_id_input').value; // ID input for user's nth purchase
    
        fetch(`http://localhost:3000/api/purchase-receipt/${userId}/${userPurchase}`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch');
                return response.json();
            })
            .then(data => {
                document.querySelector('.purchase_display').innerHTML = `
                    <p>Purchase Order Receipt</p>
                    <p>Purchase made on ${data.purchase_date}</p>
                    <p>Customer: ${data.customer_name}</p>
                    <p>_______________________</p>
                    <p>${data.item_id} - ${data.item_name} (${data.quantity}) ... $${parseFloat(data.item_total).toFixed(2)}</p>
                    <p>Total - $${parseFloat(data.total_price).toFixed(2)}</p>
                `;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error: ' + error.message);
            });
    });


    // DISPLAY TABLE CONTENTS
    // For displaying tables below
    function fetchData(endpoint) {
        return fetch(endpoint) // Make an HTTP GET request to the backend API endpoint
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON data
        })
        .then(drivers => {
            console.log(drivers);
            createDriversTable(drivers);
        })
        .catch(error => {
            console.error('Error fetching data:', error); // Handle any errors that occur during the fetch
        });
    }
    
    fetchData('http://localhost:3000/api/users');

    var tablesDisplayDrop = document.getElementById("table_drop");
    tablesDisplayDrop.addEventListener('change', function() {
        const selectedTable = tablesDisplayDrop.value;
        if (selectedTable === 'Users') {
            console.log("Drivers Works");
            fetchData('http://localhost:3000/api/users');
            resultsDisplay("Tables: Members table selected");

        } else if (selectedTable === 'Catalog') {
            console.log("Vehicles Works");
            fetchData('http://localhost:3000/api/catalog');
            resultsDisplay("Tables: Accounts table selected");

        } else if (selectedTable === 'Purchases') {
            console.log("Passengers Works");
            fetchData('http://localhost:3000/api/purchases');
            resultsDisplay("Tables: Transactions table selected");

        } else {
            tableDisplay.innerHTML = '';
        }
    });

    //Create actual table data based on JSON data
    function createDriversTable(data) {
        console.log("in createDriversTable, data = ");
        console.log(data);

        const table = document.createElement('table');
        table.classList.add('driver-table');

        // create table headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = Object.keys(data[0]);
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        data.forEach(item => {
            const row = document.createElement('tr');
            Object.values(item).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        const tableDisplay = document.querySelector('.table_display');
        tableDisplay.innerHTML = '';
        tableDisplay.appendChild(table);
    }
});