document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del menú de categorías
    const categoryLinks = document.querySelectorAll('.category-item');
    
    // Inicialización del carrito
    let cart = {
        items: [],
        totalPrice: 0
    };
    
    // Elemento que muestra el precio total del carrito
    const cartPriceElement = document.querySelector('.cart-price');
    
    // Referencias a elementos del carrito modal
    const cartModalOverlay = document.getElementById('cartModalOverlay');
    const cartModal = document.getElementById('cartModal');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartItemCount = document.getElementById('cartItemCount');
    const cartSubtotalValue = document.querySelector('.cart-subtotal-value');
    const cartContinueBtn = document.getElementById('cartContinueBtn');
    const cartIconContainer = document.querySelector('.cart-icon-container');
    const mobileCartContainer = document.querySelector('.mobile-cart-container');
    
    // Función para manejar el clic en elementos del menú
    function handleCategoryClick(e) {
        e.preventDefault();
        
        // Eliminar la clase active de todos los elementos
        categoryLinks.forEach(link => link.classList.remove('active'));
        
        // Añadir la clase active al elemento clicado
        e.currentTarget.classList.add('active');
        
        // Obtener el ID de la sección a la que apunta
        const targetId = e.currentTarget.getAttribute('href');
        if (targetId === '#') return;
        
        // Desplazamiento suave a la sección
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 130,
                behavior: 'smooth'
            });
        }
    }
    
    // Agregar event listeners a cada enlace de categoría
    categoryLinks.forEach(link => {
        link.addEventListener('click', handleCategoryClick);
    });
    
    // Detección de sección visible al hacer scroll
    window.addEventListener('scroll', function() {
        // Obtener todas las secciones con id
        const sections = document.querySelectorAll('section[id]');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });
        
        // Actualizar la clase active según la sección visible
        if (current) {
            categoryLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                    
                    // Scroll automático del menú de categorías en móvil
                    if (window.innerWidth <= 768) {
                        scrollCategoryIntoView(link);
                    }
                }
            });
        }
    });
    
    // Función para hacer scroll al elemento activo en el menú de categorías
    function scrollCategoryIntoView(activeLink) {
        const categoriesMenu = document.querySelector('.categories-menu');
        if (!categoriesMenu) return;
        
        const menuRect = categoriesMenu.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        
        // Calcular la posición deseada para que el elemento esté centrado
        const desiredScrollLeft = linkRect.left - menuRect.left - (menuRect.width / 2) + (linkRect.width / 2);
        
        // Aplicar scroll suave
        categoriesMenu.scrollTo({
            left: categoriesMenu.scrollLeft + desiredScrollLeft,
            behavior: 'smooth'
        });
    }
    
    // Manejar clics en botones de favoritos
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('active');
            
            // Cambiar el ícono
            const icon = this.querySelector('i');
            if (this.classList.contains('active')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        });
    });
    
    // Manejar clics en botones de agregar al carrito
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Si ya está en modo de cantidad, no hacer nada
            if (this.classList.contains('quantity-control')) return;
            
            // Obtener información del producto desde el DOM
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.current-price').textContent.trim();
            
            // Capturar la URL de la imagen del producto directamente
            const productImageUrl = productCard.querySelector('.card-image-container img').src;
            
            // Extraer el valor numérico del precio (formato "S/ XX.XX")
            const priceValue = parseFloat(productPrice.replace('S/', '').trim());
            
            // Generar un ID único para este producto
            const productId = generateProductId(productName);
            
            // Añadir al carrito con cantidad 1 e incluir la URL de la imagen
            addToCart(productId, productName, priceValue, 1, productImageUrl);
            
            // Mostrar control de cantidad
            showQuantityControl(this, productId, 1);
        });
    });
    
    // Generar un ID único para un producto
    function generateProductId(name) {
        // Cambiar para que solo use el nombre, sin timestamp, 
        // así será consistente entre recargas de página
        return name.toLowerCase().replace(/\s+/g, '-');
    }
    
    // Función para añadir producto al carrito
    function addToCart(id, name, price, quantity = 1, imageUrl = null) {
        // Comprobar si el producto ya está en el carrito
        const existingItem = cart.items.find(item => item.id === id);
        
        if (existingItem) {
            // Actualizar cantidad si ya existe
            const oldQuantity = existingItem.quantity;
            existingItem.quantity = quantity;
            // Actualizar precio total
            cart.totalPrice += price * (quantity - oldQuantity);
        } else {
            // Añadir nuevo producto con su imagen
            cart.items.push({
                id: id,
                name: name,
                price: price,
                quantity: quantity,
                imageUrl: imageUrl // URL de la imagen capturada al momento de añadir
            });
            // Actualizar precio total
            cart.totalPrice += price * quantity;
        }
        
        // Asegurar que el total sea preciso antes de guardar
        cart.totalPrice = Math.max(0, parseFloat(cart.totalPrice.toFixed(2)));
        
        // Actualizar interfaz
        updateCartUI();
        
        // Guardar carrito en el almacenamiento local
        localStorage.setItem('agallasCart', JSON.stringify(cart));
        console.log("Carrito guardado:", cart); // Log para depuración
    }
    
    // Función para actualizar la interfaz del carrito
    function updateCartUI() {
        // Asegurar que el total nunca sea negativo y manejar correctamente el redondeo
        cart.totalPrice = Math.max(0, parseFloat(cart.totalPrice.toFixed(2)));
        
        // Actualizar todos los elementos de precio del carrito
        const cartPriceElements = document.querySelectorAll('.cart-price');
        cartPriceElements.forEach(element => {
            element.textContent = `S/ ${cart.totalPrice.toFixed(2)}`;
        });
        
        // Añadir clase de animación al icono del carrito en la barra de navegación
        const cartIcon = document.querySelector('.cart-circle');
        if (cartIcon) {
            cartIcon.classList.add('cart-pulse');
            setTimeout(() => {
                cartIcon.classList.remove('cart-pulse');
            }, 500);
        }
        
        // Animar el carrito móvil
        const mobileCartContainer = document.querySelector('.mobile-cart-container');
        if (mobileCartContainer) {
            mobileCartContainer.classList.add('cart-pulse');
            setTimeout(() => {
                mobileCartContainer.classList.remove('cart-pulse');
            }, 500);
        }
        
        // Actualizar elementos del modal si están disponibles
        if (cartItemCount) {
            cartItemCount.textContent = getTotalItemsCount();
        }
        
        if (cartSubtotalValue) {
            cartSubtotalValue.textContent = `S/ ${cart.totalPrice.toFixed(2)}`;
        }
    }
    
    // Función para mostrar el control de cantidad
    function showQuantityControl(button, productId, quantity) {
        // Guardar el texto original
        if (!button.hasAttribute('data-original-text')) {
            button.setAttribute('data-original-text', button.textContent);
        }
        
        // Cambiar la apariencia del botón
        button.classList.add('quantity-control');
        
        // Crear el control de cantidad
        button.innerHTML = `
            <div class="quantity-wrapper">
                <button class="quantity-btn minus" ${quantity === 1 ? 'data-trash="true"' : ''}>
                    <i class="fas ${quantity === 1 ? 'fa-trash' : 'fa-minus'}"></i>
                </button>
                <span class="quantity-value" data-product-id="${productId}">${quantity}</span>
                <button class="quantity-btn plus">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        
        // Agregar event listeners a los botones de cantidad
        const minusBtn = button.querySelector('.quantity-btn.minus');
        const plusBtn = button.querySelector('.quantity-btn.plus');
        
        minusBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevenir que el evento se propague al botón principal
            
            const quantityDisplay = button.querySelector('.quantity-value');
            let currentQuantity = parseInt(quantityDisplay.textContent);
            
            if (currentQuantity > 1) {
                // Disminuir cantidad
                currentQuantity--;
                quantityDisplay.textContent = currentQuantity;
                
                // Actualizar el estado del botón minus
                if (currentQuantity === 1) {
                    minusBtn.setAttribute('data-trash', 'true');
                    minusBtn.innerHTML = '<i class="fas fa-trash"></i>';
                }
                
                // Actualizar carrito
                updateProductQuantity(productId, currentQuantity);
                
            } else {
                // Eliminar del carrito
                removeFromCart(productId);
                
                // Restaurar el botón original
                restoreOriginalButton(button);
            }
        });
        
        plusBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevenir que el evento se propague al botón principal
            
            const quantityDisplay = button.querySelector('.quantity-value');
            let currentQuantity = parseInt(quantityDisplay.textContent);
            
            // Aumentar cantidad
            currentQuantity++;
            quantityDisplay.textContent = currentQuantity;
            
            // Si la cantidad era 1, cambiar el icono de basura a menos
            if (currentQuantity === 2) {
                minusBtn.removeAttribute('data-trash');
                minusBtn.innerHTML = '<i class="fas fa-minus"></i>';
            }
            
            // Actualizar carrito
            updateProductQuantity(productId, currentQuantity);
        });
    }
    
    // Función para restaurar el botón original
    function restoreOriginalButton(button) {
        // Restaurar el botón original usando el texto guardado
        button.innerHTML = button.getAttribute('data-original-text');
        button.classList.remove('quantity-control');
    }
    
    // Actualizar la cantidad de un producto en el carrito
    function updateProductQuantity(productId, newQuantity) {
        const productItem = cart.items.find(item => item.id === productId);
        
        if (productItem) {
            // Calcular la diferencia de precio
            const priceDifference = productItem.price * (newQuantity - productItem.quantity);
            
            // Actualizar cantidad
            productItem.quantity = newQuantity;
            
            // Actualizar precio total del carrito
            cart.totalPrice += priceDifference;
            
            // Asegurar que el total nunca sea negativo (por errores de redondeo)
            cart.totalPrice = Math.max(0, parseFloat(cart.totalPrice.toFixed(2)));
            
            // Actualizar UI y localStorage
            updateCartUI();
            
            // Actualizar controles de cantidad en las tarjetas de productos
            updateProductCardsQuantity(productId, newQuantity);
            
            // Si el modal del carrito está abierto, actualizar su contenido
            if (cartModal && cartModal.classList.contains('show')) {
                renderCartItems();
            }
            
            localStorage.setItem('agallasCart', JSON.stringify(cart));
        }
    }
    
    // Eliminar un producto del carrito
    function removeFromCart(productId) {
        const itemIndex = cart.items.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            const productName = cart.items[itemIndex].name;
            
            // Restar el precio del producto del total
            cart.totalPrice -= cart.items[itemIndex].price * cart.items[itemIndex].quantity;
            
            // Asegurar que el total nunca sea negativo (por errores de redondeo)
            cart.totalPrice = Math.max(0, parseFloat(cart.totalPrice.toFixed(2)));
            
            // Eliminar el producto del arreglo
            cart.items.splice(itemIndex, 1);
            
            // Actualizar UI y localStorage
            updateCartUI();
            
            // Restaurar botones originales en las tarjetas de productos
            restoreProductCardButton(productName);
            
            // Si el modal del carrito está abierto, actualizar su contenido
            if (cartModal && cartModal.classList.contains('show')) {
                renderCartItems();
            }
            
            localStorage.setItem('agallasCart', JSON.stringify(cart));
        }
    }
    
    // Actualizar los controles de cantidad en las tarjetas de productos
    function updateProductCardsQuantity(productId, newQuantity) {
        const item = cart.items.find(item => item.id === productId);
        if (!item) return;
        
        // Buscar todas las tarjetas con el mismo nombre de producto
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const productName = card.querySelector('h3').textContent;
            if (item.name === productName) {
                const addButton = card.querySelector('.add-to-cart-btn');
                
                if (addButton && addButton.classList.contains('quantity-control')) {
                    // Actualizar el valor mostrado
                    const quantityValue = addButton.querySelector('.quantity-value');
                    if (quantityValue) {
                        quantityValue.textContent = newQuantity;
                    }
                    
                    // Actualizar el icono del botón de disminuir según la cantidad
                    const minusBtn = addButton.querySelector('.quantity-btn.minus');
                    if (minusBtn) {
                        if (newQuantity === 1) {
                            minusBtn.setAttribute('data-trash', 'true');
                            minusBtn.innerHTML = '<i class="fas fa-trash"></i>';
                        } else {
                            minusBtn.removeAttribute('data-trash');
                            minusBtn.innerHTML = '<i class="fas fa-minus"></i>';
                        }
                    }
                }
            }
        });
    }
    
    // Restaurar botones originales en tarjetas de productos
    function restoreProductCardButton(productName) {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const cardProductName = card.querySelector('h3').textContent;
            if (cardProductName === productName) {
                const addButton = card.querySelector('.add-to-cart-btn');
                if (addButton && addButton.classList.contains('quantity-control')) {
                    // Restaurar el botón original usando la función definida
                    restoreOriginalButton(addButton);
                }
            }
        });
    }
    
    // Función para actualizar cantidad de un item en el carrito desde el modal
    function updateCartItemQuantity(productId, newQuantity) {
        const productItem = cart.items.find(item => item.id === productId);
        
        if (productItem) {
            // Calcular la diferencia de precio
            const priceDifference = productItem.price * (newQuantity - productItem.quantity);
            
            // Actualizar cantidad
            productItem.quantity = newQuantity;
            
            // Actualizar precio total del carrito
            cart.totalPrice += priceDifference;
            
            // Asegurar que el total nunca sea negativo (por errores de redondeo)
            cart.totalPrice = Math.max(0, parseFloat(cart.totalPrice.toFixed(2)));
            
            // Actualizar UI y localStorage
            updateCartUI();
            
            // Actualizar controles de cantidad en las tarjetas de productos
            updateProductCardsQuantity(productId, newQuantity);
            
            localStorage.setItem('agallasCart', JSON.stringify(cart));
        }
    }
    
    // Mostrar/ocultar modal del carrito
    function toggleCartModal() {
        cartModalOverlay.classList.toggle('show');
        cartModal.classList.toggle('show');
        
        if (cartModal.classList.contains('show')) {
            document.body.style.overflow = 'hidden'; // Evitar scroll en el body
            renderCartItems(); // Actualizar contenido del carrito
        } else {
            document.body.style.overflow = ''; // Restaurar scroll
        }
    }
    
    // Event listeners para abrir/cerrar modal
    if (cartIconContainer) {
        cartIconContainer.addEventListener('click', function(e) {
            e.preventDefault();
            toggleCartModal();
        });
    }
    
    if (mobileCartContainer) {
        mobileCartContainer.addEventListener('click', function(e) {
            e.preventDefault();
            toggleCartModal();
        });
    }
    
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', toggleCartModal);
    }
    
    if (cartModalOverlay) {
        cartModalOverlay.addEventListener('click', toggleCartModal);
    }
    
    // Agregar event listener al botón Continuar para enviar a WhatsApp
    if (cartContinueBtn) {
        cartContinueBtn.addEventListener('click', function() {
            if (cart.items.length > 0) {
                sendToWhatsApp();
            }
        });
    }
    
    /**
     * Envía los detalles del carrito a WhatsApp
     */
    function sendToWhatsApp() {
        // Número de WhatsApp (formato internacional sin el +)
        const phoneNumber = "51980927995";
        
        // Crear el mensaje con los detalles del pedido
        let message = "¡Hola! Quisiera hacer el siguiente pedido:\n\n";
        
        // Agregar cada producto
        cart.items.forEach(item => {
            message += `• ${item.quantity}x ${item.name} - S/ ${(item.price * item.quantity).toFixed(2)}\n`;
        });
        
        // Agregar el total
        message += `\nTotal: S/ ${cart.totalPrice.toFixed(2)}`;
        
        // Agregar mensaje de cierre
        message += "\n\nGracias!";
        
        // Codificar el mensaje para URL
        const encodedMessage = encodeURIComponent(message);
        
        // Crear la URL de WhatsApp
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        // Abrir WhatsApp en una nueva pestaña
        window.open(whatsappURL, '_blank');
    }
    
    // Renderizar items del carrito
    function renderCartItems() {
        if (!cartItemsList) return;
        
        // Limpiar lista
        cartItemsList.innerHTML = '';
        
        if (cart.items.length === 0) {
            cartItemsList.innerHTML = '<p class="text-center text-muted my-5">Tu carrito está vacío</p>';
            cartContinueBtn.classList.remove('active');
        } else {
            // Crear elemento para cada item
            cart.items.forEach(item => {
                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item';
                cartItemElement.innerHTML = `
                    <img src="${item.imageUrl || 'img/product-default.png'}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <div class="cart-item-price">S/ ${(item.price * item.quantity).toFixed(2)}</div>
                        <div class="cart-item-controls">
                            <div class="cart-item-quantity" data-product-id="${item.id}">
                                <button class="cart-quantity-btn minus-btn" ${item.quantity === 1 ? 'data-trash="true"' : ''}>
                                    <i class="fas ${item.quantity === 1 ? 'fa-trash' : 'fa-minus'}"></i>
                                </button>
                                <span class="cart-item-quantity-value">${item.quantity}</span>
                                <button class="cart-quantity-btn plus-btn">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <button class="cart-item-edit">Editar</button>
                        </div>
                    </div>
                `;
                cartItemsList.appendChild(cartItemElement);
                
                // Añadir event listeners a los botones de cantidad
                const minusBtn = cartItemElement.querySelector('.minus-btn');
                const plusBtn = cartItemElement.querySelector('.plus-btn');
                
                minusBtn.addEventListener('click', function() {
                    if (item.quantity > 1) {
                        updateCartItemQuantity(item.id, item.quantity - 1);
                        renderCartItems(); // Forzar actualización del modal después de cambiar la cantidad
                    } else {
                        // Al eliminar un producto, debemos restaurar el botón en la tarjeta del producto
                        const productName = item.name;
                        removeFromCart(item.id);
                        renderCartItems();
                    }
                });
                
                plusBtn.addEventListener('click', function() {
                    updateCartItemQuantity(item.id, item.quantity + 1);
                    renderCartItems();
                });
            });
            
            cartContinueBtn.classList.add('active');
        }
        
        // Actualizar contador y subtotal
        cartItemCount.textContent = getTotalItemsCount();
        cartSubtotalValue.textContent = `S/ ${cart.totalPrice.toFixed(2)}`;
    }
    
    // Obtener cantidad total de items
    function getTotalItemsCount() {
        return cart.items.reduce((total, item) => total + item.quantity, 0);
    }
    
    // Cargar carrito desde localStorage si existe
    function loadCartFromStorage() {
        try {
            const savedCart = localStorage.getItem('agallasCart');
            console.log("Datos cargados de localStorage:", savedCart);
            
            if (savedCart) {
                // Parsear el carrito guardado
                const parsedCart = JSON.parse(savedCart);
                
                // Verificar que el formato sea válido
                if (parsedCart && Array.isArray(parsedCart.items)) {
                    cart = parsedCart;
                    
                    // Asegurar que el total sea preciso después de cargar
                    cart.totalPrice = Math.max(0, parseFloat(cart.totalPrice.toFixed(2)));
                    
                    console.log("Carrito restaurado correctamente:", cart);
                    
                    // Actualizar la interfaz con los datos cargados
                    updateCartUI();
                    
                    // Restaurar los controles de cantidad en las tarjetas de productos
                    setTimeout(() => {
                        restoreQuantityControls();
                    }, 100); // Pequeño retraso para asegurar que los elementos DOM estén listos
                } else {
                    console.error("Formato de carrito inválido en localStorage");
                    cart = { items: [], totalPrice: 0 };
                }
            } else {
                console.log("No se encontró carrito en localStorage");
            }
        } catch (error) {
            console.error("Error al cargar el carrito:", error);
            cart = { items: [], totalPrice: 0 };
        }
    }
    
    // Función separada para restaurar los controles de cantidad para mejor organización
    function restoreQuantityControls() {
        console.log("Restaurando controles de cantidad para", cart.items.length, "productos");
        cart.items.forEach(item => {
            // Buscar todos los botones para este producto
            const productCards = document.querySelectorAll('.product-card');
            let found = false;
            
            productCards.forEach(card => {
                const productName = card.querySelector('h3').textContent;
                if (item.name === productName) {
                    found = true;
                    const addButton = card.querySelector('.add-to-cart-btn');
                    if (addButton && !addButton.classList.contains('quantity-control')) {
                        console.log(`Restaurando control para "${item.name}" con cantidad ${item.quantity}`);
                        showQuantityControl(addButton, item.id, item.quantity);
                    }
                }
            });
            
            if (!found) {
                console.log(`Producto "${item.name}" no encontrado en la página actual`);
            }
        });
    }
    
    // Función para sincronizar el carrito desde localStorage en cualquier momento
    function syncCartFromStorage() {
        loadCartFromStorage();
    }
    
    // Ejecutar sincronización de carrito cuando se detectan cambios en localStorage
    // (permite que los cambios en otra pestaña se reflejen en esta)
    window.addEventListener('storage', function(e) {
        if (e.key === 'agallasCart') {
            console.log("Detectado cambio en localStorage, sincronizando carrito");
            syncCartFromStorage();
        }
    });
    
    // Cargar carrito al iniciar, después de que todo esté cargado
    window.addEventListener('load', function() {
        console.log("Página completamente cargada, cargando carrito desde localStorage");
        loadCartFromStorage();
    });
    
    // También cargar el carrito cuando el DOM está listo (por si acaso)
    loadCartFromStorage();
    
    // --- LÓGICA PARA EL BOTÓN DE VOLVER ARRIBA ---
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        backToTopButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
