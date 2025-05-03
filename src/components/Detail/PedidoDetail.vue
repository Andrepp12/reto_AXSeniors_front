<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL;

// Recibe el ID del pedido como prop de la ruta
const props = defineProps({
  id: {
    type: [Number, String],
    required: true
  }
});

// Estado para los datos del pedido
const pedido = ref(null);
const isLoading = ref(true);
const error = ref(null);

onMounted(async () => {
    isLoading.value = true;
    error.value = null;
    try {
        const url = `${API_URL}/pedidos/${props.id}/`;
        console.log("Fetching pedido from URL:", url);

        const response = await fetch(url); // Usa la URL corregida
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Pedido no encontrado.");
            }
             const errorBody = await response.json();
             throw new Error(`Error ${response.status}: ${response.statusText} - ${JSON.stringify(errorBody)}`);
        }
        const data = await response.json(); 
        pedido.value = data;
    } catch (err) {
        console.error("Error fetching pedido:", err);
        error.value = err.message || "Ocurrió un error al cargar el pedido.";
    } finally {
        isLoading.value = false;
    }
});

// --- Exponer variables al template ---
</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <div v-if="isLoading">Cargando pedido...</div>
        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{{ error }}</div>
        <div v-else-if="pedido">
            <h1 class="text-2xl font-bold mb-4 text-gray-100">Detalle del Pedido #{{ pedido.numero_pedido }}</h1>

            <div class="mb-6 p-4 border rounded-md bg-gray-100">
                <!-- <h2 class="text-lg font-semibold mb-2">Cabecera</h2> -->
                <p class="text-sm text-gray-700">
                    <strong class="font-medium">Cliente:</strong> {{ pedido.cliente_details ? pedido.cliente_details.nombre : 'N/A' }}
                </p>
                <p class="text-sm text-gray-700">
                    <strong class="font-medium">Fecha del Pedido:</strong> {{ new Date(pedido.fecha_pedido).toLocaleString() }}
                </p>
                 <p v-if="pedido.fecha_entrega" class="text-sm text-gray-700">
                     <strong class="font-medium">Fecha de Entrega:</strong> {{ new Date(pedido.fecha_entrega).toLocaleDateString() }}
                 </p>
                 <p class="text-sm text-gray-700">
                      <strong class="font-medium">Estado:</strong> {{ pedido.estado }}
                 </p>
                <p v-if="pedido.notas" class="text-sm text-gray-700"><strong class="font-medium">Notas:</strong> {{ pedido.notas }}</p>
            </div>

            <h2 class="text-lg font-semibold mb-3 text-gray-200">Líneas del Pedido</h2>
             <ul v-if="pedido.lineapedido_set && pedido.lineapedido_set.length > 0" class="space-y-3 mb-6">
                  <li v-for="linea in pedido.lineapedido_set" :key="linea.id" class="border border-gray-300 p-3 rounded-md bg-white">
                      <p class="text-sm text-gray-700">
                           <strong class="font-medium">Artículo:</strong> {{ linea.articulo_details ? `${linea.articulo_details.nombre} (${linea.articulo_details.codigo})` : `ID: ${linea.articulo}` }}
                       </p>
                       <p class="text-sm text-gray-700">
                          <strong class="font-medium">Cantidad:</strong> {{ linea.cantidad}}
                       </p>
                        <p class="text-sm text-gray-700">
                            <strong class="font-medium">Precio Unitario:</strong> {{ linea.precio_unitario }}
                        </p>
                       <p v-if="parseFloat(linea.porcentaje_descuento) > 0" class="text-sm text-gray-700">
                            <strong class="font-medium">Descuento:</strong> {{ linea.porcentaje_descuento }}%
                       </p>
                        <p class="text-sm font-semibold text-gray-900 mt-2">
                            Importe de Línea: {{ linea.importe_linea }}
                        </p>
                   </li>
               </ul>
             <p v-else class="text-gray-700">Este pedido no tiene líneas.</p>


            <p v-if="pedido.total_pedido" class="text-lg font-bold text-right mt-4 text-gray-100">
                 Total del Pedido: {{ pedido.total_pedido }}
             </p>

            <div class="mt-6">
                <router-link :to="{ name: 'editar-pedido', params: { id: pedido.id } }" class="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-4">
                    Editar Pedido
                </router-link>
                <router-link :to="{ name: 'nuevo-pedido' }" class="inline-block px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Crear Nuevo Pedido
                </router-link>
                </div>
        </div>
    </div>
</template>

<style scoped>
/* Estilos específicos del detalle si los necesitas */
</style>