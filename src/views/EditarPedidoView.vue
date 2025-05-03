<script setup>
import PedidoForm from '@/components/Form/PedidoForm.vue';
import { useRoute } from 'vue-router'; // Para obtener parámetros de la ruta si no usas props: true

// Si usas props: true en la definición de la ruta, recibes el ID como prop
const props = defineProps({
     id: { // Este nombre 'id' debe coincidir con el ':id' en la ruta
       type: [Number, String],
       required: true
     }
});

// O si no usas props: true, obtienes el ID así:
// const route = useRoute();
// const pedidoId = route.params.id;
</script>

<template>
    <PedidoForm :pedidoId="props.id" />
    </template>