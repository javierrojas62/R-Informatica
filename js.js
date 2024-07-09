const form = document.getElementById('contactForm');
const statusMessage = document.getElementById('statusMessage');

form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevenir el envío síncrono del formulario

    const formData = new FormData(form);

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        });

        if (response.ok) {
            statusMessage.innerHTML = `<div class="alert alert-success">Mensaje enviado correctamente.</div>`;
            form.reset(); // Reiniciar los campos del formulario
            setTimeout(() => {
                window.location.reload(); // Recargar la página después de 2 segundos
            }, 2000);
        } else {
            const data = await response.json();
            statusMessage.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
        }
    } catch (error) {
        console.error('Error al enviar el formulario:', error);
        statusMessage.innerHTML = `<div class="alert alert-danger">Hubo un error al enviar el formulario.</div>`;
    }
});