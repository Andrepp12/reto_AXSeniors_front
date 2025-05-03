import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';

const API_URL = import.meta.env.VITE_API_URL;

export default function usePedidoForm(pedidoId) {
  const router = useRouter();

  // --- Estado del formulario ---
  const pedido = reactive({
    id: undefined, // Añadimos ID aquí para edición
    cliente: null,
    fecha_pedido: new Date().toISOString().slice(0, 16),
    fecha_entrega: null,
    estado: 'PEN',
    notas: '',
    lineapedido_set: [] // Array de líneas (estructura frontend)
  });

  // --- Estado para datos de selección y otros estados ---
  const clientes = ref([]);
  const articulos = ref([]);
  const isLoading = ref(true);
  const errors = ref(null);

  // --- Efecto para cargar datos iniciales y/o del pedido existente ---
  onMounted(async () => {
    isLoading.value = true;
    errors.value = null;

    try {
      // Cargar Clientes
      const clientesRes = await fetch(`${API_URL}/clientes/`);
      if (!clientesRes.ok) {
        const errorBody = await clientesRes.json();
        throw new Error(`Error al cargar clientes: ${clientesRes.status} ${clientesRes.statusText} - ${JSON.stringify(errorBody)}`);
      }
      const clientesData = await clientesRes.json();
      if (clientesData && Array.isArray(clientesData.results)) {
        clientes.value = clientesData.results;
      } else {
        throw new Error(`Formato de paginación inesperado para clientes: ${JSON.stringify(clientesData)}`);
      }

      // Cargar Artículos
      const articulosRes = await fetch(`${API_URL}/articulos/`);
      if (!articulosRes.ok) {
        const errorBody = await articulosRes.json();
        throw new Error(`Error al cargar artículos: ${articulosRes.status} ${articulosRes.statusText} - ${JSON.stringify(errorBody)}`);
      }
      const articulosData = await articulosRes.json();
      if (articulosData && Array.isArray(articulosData.results)) {
        articulos.value = articulosData.results;
      } else {
        throw new Error(`Formato de paginación inesperado para artículos: ${JSON.stringify(articulosData)}`);
      }

      // Si es edición (pedidoId existe), cargar datos del Pedido existente
      if (pedidoId) {
        console.log('Modo edición: Cargando pedido existente...');
        const pedidoRes = await fetch(`${API_URL}/pedidos/${pedidoId}/`);
        if (!pedidoRes.ok) {
          const errorBody = await pedidoRes.json();
          throw new Error(`Error al cargar el pedido ${pedidoId}: ${pedidoRes.status} ${pedidoRes.statusText} - ${JSON.stringify(errorBody)}`);
        }
        const pedidoData = await pedidoRes.json();

        const adaptedPedido = {
          id: pedidoData.id,
          cliente: (typeof pedidoData.cliente === 'number' || pedidoData.cliente === null) ? pedidoData.cliente : null,
          fecha_pedido: (typeof pedidoData.fecha_pedido === 'string' && pedidoData.fecha_pedido) ? new Date(pedidoData.fecha_pedido).toISOString().slice(0, 16) : '',
          fecha_entrega: (typeof pedidoData.fecha_entrega === 'string' && pedidoData.fecha_entrega) ? new Date(pedidoData.fecha_entrega).toISOString().split('T')[0] : '',
          estado: (typeof pedidoData.estado === 'string' && pedidoData.estado) ? pedidoData.estado : 'PEN',
          notas: (typeof pedidoData.notas === 'string') ? pedidoData.notas : '',

          lineapedido_set: Array.isArray(pedidoData.lineapedido_set)
            ? pedidoData.lineapedido_set
                .filter(line => line && typeof line === 'object')
                .map(line => ({
                  id: line.id || undefined,
                  cantidad: (typeof line.cantidad === 'number' && parseInt(line.cantidad)) ? parseInt(line.cantidad) : 0,
                  precio_unitario: (typeof line.precio_unitario === 'string' && parseFloat(line.precio_unitario)) ? parseFloat(line.precio_unitario) : 0,
                  porcentaje_descuento: (typeof line.porcentaje_descuento === 'string' && parseFloat(line.porcentaje_descuento)) ? parseFloat(line.porcentaje_descuento) : 0,
                  articulo: (typeof line.articulo === 'number' && line.articulo) ? line.articulo : null,
                  _tempId: (line.id && String(line.id)) ? String(line.id) : uuidv4(),
                  _isDeleted: false,
                  importe_linea: (typeof line.importe_linea === 'number') ? line.importe_linea : undefined,
                  articulo_details: (line.articulo_details && typeof line.articulo_details === 'object') ? line.articulo_details : undefined,
                }))
            : [],
        };
        Object.assign(pedido, adaptedPedido);
        console.log('Modo edición: Datos del pedido cargados y adaptados.');

      } else {
        // Si es nuevo pedido, inicializar con una línea vacía
        console.log('Modo nuevo: Inicializando formulario...');
        pedido.lineapedido_set.length = 0;
        const initialLine = {
          _tempId: uuidv4(),
          articulo: null,
          cantidad: 1,
          precio_unitario: 0,
          porcentaje_descuento: 0,
          _isDeleted: false,
        };
        pedido.lineapedido_set.push(initialLine);
        console.log('Array lineapedido_set después de push en else:', pedido.lineapedido_set);
      }

      console.log('Estado del pedido justo antes de finally:', pedido);

    } catch (err) {
      console.error("Error durante la carga inicial de datos:", err);
      errors.value = { detail: err.message || "Ocurrió un error al cargar los datos iniciales." };
    } finally {
      isLoading.value = false;
      console.log('onMounted finalizado. Estado final del pedido:', pedido);
    }
  });

  // --- Manejadores de cambios ---
  const handleHeaderChange = (name, value) => {
    const updatedValue = name === 'cliente' ? parseInt(value, 10) || null : value;
    pedido[name] = updatedValue;
  };

  const handleLineChange = (tempId, name, value) => {
    const lineIndex = pedido.lineapedido_set.findIndex(line => line._tempId === tempId);
    if (lineIndex === -1) return;

    const lineToUpdate = pedido.lineapedido_set[lineIndex];

    if (name === 'articulo') {
      const newArticuloId = parseInt(value, 10) || null;
      lineToUpdate.articulo = newArticuloId;
      if (newArticuloId !== null) {
        const selectedArticulo = articulos.value.find(art => art.id === newArticuloId);
        if (selectedArticulo) {
          lineToUpdate.precio_unitario = parseFloat(selectedArticulo.precio_unitario) || 0;
        } else {
          lineToUpdate.precio_unitario = 0;
        }
      } else {
        lineToUpdate.precio_unitario = 0;
      }
    } else if (name === 'cantidad' || name === 'precio_unitario' || name === 'porcentaje_descuento') {
      lineToUpdate[name] = parseFloat(value) || 0;
    }
  };

  // --- Lógica para añadir/eliminar líneas ---
  const addLine = () => {
    pedido.lineapedido_set.push({
      _tempId: uuidv4(),
      articulo: null,
      cantidad: 1,
      precio_unitario: 0,
      porcentaje_descuento: 0,
      _isDeleted: false,
    });
  };

  const handleLineDeleteToggle = (tempId, isChecked) => {
    const lineIndex = pedido.lineapedido_set.findIndex(line => line._tempId === tempId);
    if (lineIndex === -1) return;

    const lineToUpdate = pedido.lineapedido_set[lineIndex];

    if (!lineToUpdate.id) {
      pedido.lineapedido_set.splice(lineIndex, 1);
    } else {
      lineToUpdate._isDeleted = isChecked;
    }
  };

  // --- Cálculos ---
  const calculateLineTotal = (line) => {
    const cantidad = line.cantidad || 0;
    const precio = line.precio_unitario || 0;
    const descuento = line.porcentaje_descuento || 0;

    if (typeof cantidad === 'number' && typeof precio === 'number' && typeof descuento === 'number' && cantidad >= 0 && precio >= 0 && descuento >= 0 && descuento <= 100) {
      return (cantidad * precio) * (1 - descuento / 100);
    }
    return 0;
  };

  const calculateOrderTotal = computed(() => {
    return pedido.lineapedido_set
      .filter(line => !line._isDeleted)
      .reduce((sum, line) => {
        if (line && typeof line === 'object') {
          return sum + calculateLineTotal(line);
        }
        return sum;
      }, 0);
  });

  // --- Lógica de envío ---
  const handleSubmit = async () => {
    errors.value = null;
    isLoading.value = true;

    // Validación Frontend
    const formErrors = {};
    if (!pedido.cliente) formErrors.cliente = ["Cliente es obligatorio."];
    if (!pedido.fecha_pedido) formErrors.fecha_pedido = ["Fecha del pedido es obligatoria."];

    const activeLines = pedido.lineapedido_set.filter(line => !line._isDeleted);
    if (activeLines.length === 0) {
      formErrors.lineapedido_set = ["El pedido debe tener al menos una línea."];
    } else {
      const lineErrors = {};
      activeLines.forEach((line, index) => {
        if (!line || typeof line !== 'object') {
          lineErrors[line?._tempId || `idx-${index}`] = ["Entrada de línea inválida detectada."];
          return;
        }
        const lineSpecificErrors = {};
        if (line.articulo === null || line.articulo === undefined) lineSpecificErrors.articulo = ["Artículo es obligatorio."];
        if (typeof line.cantidad !== 'number' || line.cantidad <= 0) lineSpecificErrors.cantidad = ["Cantidad debe ser un número mayor a 0."];
        if (typeof line.precio_unitario !== 'number' || line.precio_unitario <= 0) lineSpecificErrors.precio_unitario = ["Precio unitario debe ser un número mayor a 0."];
        if (typeof line.porcentaje_descuento !== 'number' || line.porcentaje_descuento < 0 || line.porcentaje_descuento > 100) lineSpecificErrors.porcentaje_descuento = ["Descuento debe estar entre 0 y 100."];
        if (Object.keys(lineSpecificErrors).length > 0) {
          lineErrors[line._tempId] = lineSpecificErrors;
        }
      });
      if (Object.keys(lineErrors).length > 0) formErrors.lineas = lineErrors;
    }

    if (Object.keys(formErrors).length > 0) {
      errors.value = formErrors;
      isLoading.value = false;
      window.scrollTo(0, 0);
      return;
    }

    // Preparar datos para enviar
    const dataToSend = {
      ...(pedido.id ? { id: pedido.id } : {}),
      cliente: pedido.cliente,
      fecha_pedido: pedido.fecha_pedido ? new Date(pedido.fecha_pedido).toISOString() : new Date().toISOString(),
      fecha_entrega: pedido.fecha_entrega ? new Date(pedido.fecha_entrega).toISOString().split('T')[0] : null,
      estado: pedido.estado,
      notas: pedido.notas,
      lineapedido_set: activeLines.map(line => ({
        id: line.id,
        articulo: line.articulo,
        cantidad: String(line.cantidad),
        precio_unitario: String(line.precio_unitario),
        porcentaje_descuento: String(line.porcentaje_descuento),
      })),
    };

    const method = pedido.id ? 'PUT' : 'POST';
    const url = pedido.id ? `${API_URL}/pedidos/${pedido.id}/` : `${API_URL}/pedidos/`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("Pedido guardado con éxito:", responseData);
        router.push({ name: 'ver-pedido', params: { id: responseData.id } });
      } else {
        console.error("Error al guardar pedido:", responseData);
        errors.value = responseData;
      }

    } catch (err) {
      console.error("Error de red o al procesar respuesta:", err);
      errors.value = { detail: err.message || "Ocurrió un error al procesar la solicitud." };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    pedido,
    clientes,
    articulos,
    isLoading,
    errors,
    handleHeaderChange,
    handleLineChange,
    addLine,
    handleLineDeleteToggle,
    calculateLineTotal,
    calculateOrderTotal,
    handleSubmit,
    router,
  };
}