<template>
    <div id="app">
        <div v-if="isReady">
            <div class="wrapper" v-for="[date, devices] of Object.entries(this.data)" :key="date">
                <div class="date">{{ date }}</div>
                <Report :devices="devices"></Report>
            </div>
        </div>
    </div>
</template>

<script>
import Report from './views/Report'
export default {
    name: 'App',
    components: {
        Report
    },
    data() {
        return {
            isReady: false
        }
    },
    async mounted() {
        this.data = {};
        const url = 'http://127.0.0.1:8000';

        this.data = await this.getData(url);
        this.isReady = true;
    },
    methods: {
        async getData(url) {
            return fetch(url, {
                method: 'get',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(resp => resp.json()).then(data => data);
        }
    }
}
</script>
