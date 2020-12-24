<template>
    <div>
        <div class="device-info" v-for="(device, index) of devices" :key="index">
            <div class="device-info-row" v-for="(value, index) of device" :key="index">
                <span>{{ value }}</span>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Report',
        props: {
            devices: {
                type: Array
            }
        }
    }
</script>

<style scoped>

</style>
