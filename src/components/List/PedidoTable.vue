<script setup>
const props = defineProps({
    pedidos: { 
        type: Array,
        required: true
    },
    isLoading: { 
        type: Boolean,
        required: true
    },
    error: { 
        type: String,
        default: null
    },
    sortField: { // Campo actual por el que se ordena
        type: String,
        required: true
    },
    sortOrder: { // Orden actual
        type: String,
        required: true
    },
    onSortBy: { // Función para cambiar el orden (llamada desde encabezados)
        type: Function,
        required: true
    },
    onGoToDetail: { 
        type: Function,
        required: true
    },
    onGoToEdit: { 
        type: Function,
        required: true
    },
    onGeneratePdf: { 
        type: Function,
        required: true
    },
    onDeletePedido: { 
        type: Function,
        required: true
    }
});

</script>

<template>
    <div v-if="isLoading" class="text-center text-gray-600 py-8">Cargando pedidos...</div>
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      Error: {{ error }}
    </div>
    <div v-else-if="pedidos.length === 0" class="text-gray-700 py-8 text-center">No hay pedidos registrados que coincidan con los criterios.</div>

    <div v-else class="overflow-x-auto shadow-lg rounded-lg">
        <table class="min-w-full bg-white rounded-md">
            <thead>
                <tr class="bg-gray-200">
                    <th @click="onSortBy('numero_pedido')" class="py-3 px-4 border-b border-gray-300 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-300 rounded-tl-lg">
                        Número Pedido
                        <span v-if="sortField === 'numero_pedido'">{{ sortOrder === 'asc' ? ' ▲' : ' ▼' }}</span>
                    </th>
                     <th @click="onSortBy('cliente__nombre')" class="py-3 px-4 border-b border-gray-300 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-300">
                        Cliente
                         <span v-if="sortField === 'cliente__nombre'">{{ sortOrder === 'asc' ? ' ▲' : ' ▼' }}</span>
                    </th>
                    <th @click="onSortBy('fecha_pedido')" class="py-3 px-4 border-b border-gray-300 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-300">
                        Fecha Pedido
                         <span v-if="sortField === 'fecha_pedido'">{{ sortOrder === 'asc' ? ' ▲' : ' ▼' }}</span>
                    </th>
                     <th @click="onSortBy('estado')" class="py-3 px-4 border-b border-gray-300 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-300">
                        Estado
                         <span v-if="sortField === 'estado'">{{ sortOrder === 'asc' ? ' ▲' : ' ▼' }}</span>
                    </th>
                     <th @click="onSortBy('total_pedido')" class="py-3 px-4 border-b border-gray-300 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-300">
                        Total
                         <span v-if="sortField === 'total_pedido'">{{ sortOrder === 'asc' ? ' ▲' : ' ▼' }}</span>
                    </th>
                     <th class="py-3 px-4 border-b border-gray-300 bg-gray-200 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">
                        Acciones
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="pedido in pedidos" :key="pedido.id" class="hover:bg-gray-100 border-b border-gray-200 last:border-b-0">
                    <td class="py-3 px-4 text-sm text-gray-900">
                        {{ pedido.numero_pedido }}
                    </td>
                     <td class="py-3 px-4 text-sm text-gray-900">
                        {{ pedido.cliente_details ? pedido.cliente_details.nombre : 'N/A' }}
                    </td>
                     <td class="py-3 px-4 text-sm text-gray-900">
                        {{ new Date(pedido.fecha_pedido).toLocaleDateString() }}
                     </td>
                     <td class="py-3 px-4 text-sm text-gray-900">
                        {{ pedido.estado }}
                     </td>
                     <td class="py-3 px-4 text-sm text-gray-900 text-right">
                        {{ pedido.total_pedido ? parseFloat(pedido.total_pedido).toFixed(2) : '0.00' }}
                     </td>
                     <td class="py-3 px-4 text-sm text-gray-900 text-right whitespace-nowrap">
                         <button @click="onGoToDetail(pedido.id)" class="text-blue-600 hover:text-blue-900 text-xs font-medium mr-2">
                              Ver
                         </button>
                         <button @click="onGoToEdit(pedido.id)" class="text-indigo-600 hover:text-indigo-900 text-xs font-medium mr-2"> 
                              Editar
                         </button>
                          <button @click="onGeneratePdf(pedido.id)" class="text-green-600 hover:text-green-900 text-xs font-medium mr-2">
                              PDF
                          </button>
                         <button @click="onDeletePedido(pedido.id)" class="text-red-600 hover:text-red-900 text-xs font-medium">
                              Eliminar
                         </button>
                     </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>

</style>