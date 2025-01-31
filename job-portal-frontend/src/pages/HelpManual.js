document.addEventListener('DOMContentLoaded', () => {
    // Selecciona todas las pestañas (elementos con la clase 'tab')
    const tabs = document.querySelectorAll('.tab');

    // Selecciona todos los contenidos (elementos con la clase 'content')
    const contents = document.querySelectorAll('.content');

    // Asegurarse de que haya pestañas y contenidos disponibles
    if (tabs.length && contents.length) {

        // Itera sobre todas las pestañas para agregarles el evento 'click'
        tabs.forEach(tab => {
            tab.addEventListener('click', (event) => {

                // Obtiene el valor del atributo 'data-target' de la pestaña seleccionada
                let target = event.target.getAttribute('data-target');

                if (target) {
                    // Elimina la clase 'active' de todos los contenidos (esconde todos los contenidos)
                    contents.forEach(content => content.classList.remove('active'));

                    // Elimina la clase 'active' de todas las pestañas
                    tabs.forEach(tab => tab.classList.remove('active'));

                    // Muestra el contenido correspondiente a la pestaña seleccionada añadiendo la clase 'active'
                    const targetContent = document.getElementById(target);
                    if (targetContent) {
                        targetContent.classList.add('active');
                    }

                    // Marca la pestaña seleccionada como activa añadiendo la clase 'active'
                    event.target.classList.add('active');
                }
            });
        });
    } else {
        console.error('No se encontraron pestañas o contenidos.');
    }
});
