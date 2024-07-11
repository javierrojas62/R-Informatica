document.addEventListener('DOMContentLoaded', function () {
    const productosContainer = document.getElementById('productosRow');
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const categoryMenu = document.getElementById('categoryMenu');
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const productModalBody = document.getElementById('productModalBody');

    let conversionRate = 1500; // Valor del USD en ARS
    let markup = 0.50; // Porcentaje de ganancia

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "user_id": 27864,
        "token": "wm4wpf38sx"
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    // Función para obtener productos y mostrarlos
    function fetchProducts(query = '', category = '') {
        let url = "https://clientes.elit.com.ar/v1/api/productos?limit=100";
        if (query) {
            url += `&nombre=${query}`;
        }
        if (category && category !== 'Todas') {
            url += `&categoria=${category}`;
        }

        fetch(url, requestOptions)
            .then(response => response.json())
            .then(data => {
                const productsInStock = data.resultado.filter(product => product.stock_total > 0);
                displayProducts(productsInStock);
                displayCategories(data.resultado);
            })
            .catch(error => console.log('error', error));
    }

    // Función para mostrar productos
    function displayProducts(products) {
        productosContainer.innerHTML = '';

        products.forEach(product => {
            const priceARS = (product.pvp_usd * conversionRate * (1 + markup)).toFixed(2);
            const stockCD = product.stock_deposito_cd;
            let stockButtonColor = '';

            if (stockCD > 10) {
                stockButtonColor = 'btn-success';
            } else if (stockCD > 0 && stockCD <= 10) {
                stockButtonColor = 'btn-warning';
            } else {
                stockButtonColor = 'btn-danger';
            }

            const productCard = document.createElement('div');
            productCard.className = 'col-md-4 mb-4';
            productCard.innerHTML = `
                <div class="card">
                    <img src="${product.imagenes[0]}" class="card-img-top" alt="${product.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${product.nombre}</h5>
                        <p class="card-text">Precio: $${priceARS}</p>
                        <button class="btn btn-primary ver-mas" data-product='${JSON.stringify(product)}'>Ver más</button>
                        <button class="btn ${stockButtonColor} mt-2">Stock</button>
                    </div>
                </div>
            `;
            productosContainer.appendChild(productCard);
        });

        document.querySelectorAll('.ver-mas').forEach(button => {
            button.addEventListener('click', function () {
                const product = JSON.parse(this.getAttribute('data-product'));
                showProductModal(product);
            });
        });
    }

    // Función para mostrar el modal con detalles del producto
    function showProductModal(product) {
        const priceARS = (product.pvp_usd * conversionRate * (1 + markup)).toFixed(2);
        const imagesHTML = product.imagenes.map(image => `<img src="${image}" class="img-thumbnail" alt="${product.nombre}">`).join('');
        productModalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div>${imagesHTML}</div>
                </div>
                <div class="col-md-6">
                    <h5>${product.nombre}</h5>
                    <p>Precio: $${priceARS}</p>
                    <p>Categoría: ${product.categoria}</p>
                    <p>Subcategoría: ${product.sub_categoria}</p>
                    <p>Marca: ${product.marca}</p>
                    <p>Garantía: ${product.garantia} meses</p>
                    <p>Stock Total: ${product.stock_total}</p>
                    <p>Stock en Depósito del Cliente: ${product.stock_deposito_cliente}</p>
                    <p>Stock en Centro de Distribución: ${product.stock_deposito_cd}</p>
                    <p>${product.descripcion}</p>
                </div>
            </div>
        `;
        productModal.show();
    }

    // Función para mostrar categorías
    function displayCategories(products) {
        const categories = new Set(products.map(product => product.categoria));
        categoryMenu.innerHTML = '<li><a class="dropdown-item" href="#" data-category="Todas">Todas</a></li>';

        categories.forEach(category => {
            categoryMenu.innerHTML += `<li><a class="dropdown-item" href="#" data-category="${category}">${category}</a></li>`;
        });

        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function (event) {
                event.preventDefault();
                const category = event.target.getAttribute('data-category');
                fetchProducts('', category);
            });
        });
    }

    // Event listener para el formulario de búsqueda
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const query = searchInput.value.trim();
        fetchProducts(query);
    });

    // Inicializar la página cargando todos los productos
    fetchProducts();
});
