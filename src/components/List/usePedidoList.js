import { ref, reactive, computed } from 'vue';

const API_URL = import.meta.env.VITE_API_URL;
export default function usePedidoList() {

    const pedidos = ref([]);
    const isLoading = ref(true);
    const error = ref(null);

    // Estado para la paginación
    const pagination = reactive({
      count: 0,
      next: null,
      previous: null,
      currentPage: 1, // Añadimos currentPage al estado de paginación
      pageSize: 10 // Debe coincidir con el backend si no se envía
    });

    // --- Estado para Filtrado y Ordenamiento ---
    const filterStatus = ref(''); // Estado del filtro por estado (string)
    const sortField = ref('id'); 
    const sortOrder = ref('asc'); 
    const filterCliente = ref(''); // Estado del filtro por cliente

    // Opciones para el filtro de estado (deben coincidir con los códigos de tu modelo Django)
    const estadoOptions = [
        { value: '', text: 'Todos' },
        { value: 'PEN', text: 'Pendiente' },
        { value: 'PRO', text: 'En Proceso' },
        { value: 'COM', text: 'Completado' },
        { value: 'CAN', text: 'Cancelado' }
    ];

    // --- Funciones de Filtrado y Ordenamiento ---

    // Construye la URL de la API con parámetros de paginación, filtro y ordenamiento
    const buildApiUrl = (pageUrl = `${API_URL}/pedidos/`) => {
        const url = new URL(pageUrl);

         // Si la URL no es una URL next/previous completa, añadir parámetros base y de filtro/orden
         if (!pageUrl.includes('?page=') && !pageUrl.includes('&page=') && !pageUrl.startsWith(API_URL)) {
             // Asumimos que pageUrl es una URL base o un número de página
             const baseUrl = `${API_URL}/pedidos/`;
             url.search = ''; // Limpia todos los parámetros existentes si es la URL base
              url.searchParams.set('page_size', pagination.pageSize);
              if (typeof pageUrl === 'number') {
                   url.searchParams.set('page', pageUrl);
              } else if (pageUrl !== `${API_URL}/pedidos/`) {
                   // Si se pasa algo diferente a la base, podría ser una URL parcial, logear para depurar
                   console.warn("buildApiUrl recibió URL inesperada para base:", pageUrl);
                   // Reset a base URL si es inesperado
                    return buildApiUrl(`${API_URL}/pedidos/`);
              }

         } else {
             // Si es una URL next/previous o ya tiene parámetros, solo nos aseguramos de page_size
             if (!url.searchParams.has('page_size')) {
                  url.searchParams.set('page_size', pagination.pageSize);
             }
         }


        // Añadir parámetro de filtro por estado si filterStatus no está vacío
        if (filterStatus.value) {
            url.searchParams.set('estado', filterStatus.value);
        } else {
             url.searchParams.delete('estado');
        }

        // Añadir parámetro de filtro por cliente si filterCliente no está vacío
        if (filterCliente.value) {
            url.searchParams.set('cliente_nombre', filterCliente.value);
        } else {
            url.searchParams.delete('cliente_nombre'); 
        }

        // Añadir parámetro de ordenamiento
        if (sortField.value) {
            const orderingPrefix = sortOrder.value === 'desc' ? '-' : '';
            url.searchParams.set('ordering', `${orderingPrefix}${sortField.value}`);
        } else {
             url.searchParams.delete('ordering');
        }

        console.log("API URL construida:", url.toString());
        return url.toString();
    };

    // Función para obtener la lista de pedidos del backend con la URL construida
    const fetchPedidos = async (pageUrl) => {
      isLoading.value = true;
      error.value = null;

      const urlToFetch = buildApiUrl(pageUrl);

      try {
        const response = await fetch(urlToFetch);

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          let errorDetail = `Error: ${response.status} ${response.statusText}`;
           if (contentType && contentType.indexOf("application/json") !== -1) {
               const errorBody = await response.json();
               errorDetail += ` - ${JSON.stringify(errorBody)}`;
           }
           throw new Error(errorDetail);
        }

        const data = await response.json();

        if (data && Array.isArray(data.results)) {
          pedidos.value = data.results;
          // Actualiza el estado de paginación
          pagination.count = data.count;
          pagination.next = data.next;
          pagination.previous = data.previous;

            // Actualizar currentPage basado en la URL que se acaba de cargar
            const urlObj = new URL(urlToFetch);
             const pageParam = urlObj.searchParams.get('page');
             pagination.currentPage = pageParam ? parseInt(pageParam, 10) : 1;


        } else {
          throw new Error(`Formato de respuesta inesperado de la API: ${JSON.stringify(data)}`);
        }

      } catch (err) {
        console.error("Error fetching pedidos:", err);
        error.value = err.message || "Ocurrió un error al cargar la lista de pedidos.";
         pedidos.value = [];
          pagination.count = 0;
          pagination.next = null;
          pagination.previous = null;
          pagination.currentPage = 1;
      } finally {
        isLoading.value = false;
      }
    };

    // Lógica para cambiar el orden
    const sortBy = (field) => {
        if (sortField.value === field) {
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
        } else {
            sortField.value = field;
            sortOrder.value = 'asc';
        }
        // Al cambiar filtro u orden, volvemos a la primera página
        fetchPedidos(`${API_URL}/pedidos/`); 
    };

    const applyFilters = () => {
        fetchPedidos(`${API_URL}/pedidos/`); 
    };


    // Función para eliminar un pedido
    const deletePedido = async (pedidoId) => {
        const isConfirmed = confirm(`¿Estás seguro de que quieres eliminar el pedido #${pedidoId}? Esta acción es irreversible.`);
        if (!isConfirmed) {
            return;
        }

        isLoading.value = true;
        error.value = null; // Limpiar errores anteriores

        try {
            const response = await fetch(`${API_URL}/pedidos/${pedidoId}/`, {
                method: 'DELETE',
                // Headers de autenticación
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                let errorDetail = `Error al eliminar pedido ${pedidoId}: ${response.status} ${response.statusText}`;
                 if (contentType && contentType.indexOf("application/json") !== -1) {
                     const errorBody = await response.json();
                     errorDetail += ` - ${JSON.stringify(errorBody)}`;
                 }
                 throw new Error(errorDetail);
            }

            console.log(`Pedido ${pedidoId} eliminado con éxito.`);

             await fetchPedidos(`${API_URL}/pedidos/`);


        } catch (err) {
            console.error("Error deleting pedido:", err);
             error.value = err.message || `Ocurrió un error al eliminar el pedido ${pedidoId}.`;
        } finally {
            isLoading.value = false;
        }
    };

    // Función para generar PDF
    const generatePdf = (pedidoId) => {
        const pdfUrl = `${API_URL}/pedidos/${pedidoId}/generate_pdf/`;
        console.log("Generando PDF desde:", pdfUrl);
        window.open(pdfUrl, '_blank');
    };

    // Funciones para navegación de paginación
    const goToNextPage = () => {
        if (pagination.next) {
            fetchPedidos(pagination.next); 
        }
    };

    const goToPreviousPage = () => {
        if (pagination.previous) {
            fetchPedidos(pagination.previous); 
        }
    };

    // Propiedades computadas para deshabilitar botones de paginación
    const hasNextPage = computed(() => pagination.next !== null);
    const hasPreviousPage = computed(() => pagination.previous !== null);

    return {
        pedidos,
        isLoading,
        error,
        pagination,
        filterStatus,
        sortField,
        sortOrder,
        filterCliente,
        estadoOptions,
        fetchPedidos, // Aunque onMounted lo llama, podrías querer llamarlo manualmente
        sortBy,
        applyFilters, // Exponer la función para llamar desde el template
        deletePedido,
        generatePdf,
        goToNextPage,
        goToPreviousPage,
        hasNextPage,
        hasPreviousPage,
    };
}