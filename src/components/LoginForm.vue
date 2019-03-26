<template lang="pug">
md-card.login-card
    form(v-on:submit.prevent="getToken")
        md-card-header
            div.md-title Log in
            div.md-subhead.error(v-show="error") {{error}}

        md-card-content
            md-field
                label Username
                md-input(v-model="username")
            md-field(v-bind:class=" { 'md-input-invalid': error } ")
                label Password
                md-input(v-model="password", type="password")
                span.md-error {{error}}

        md-card-actions
            md-button(type="submit", v-bind:disabled="loading") Log In

</template>

<script>
import $http from "../http";
import state from '../state'

export default {
    name: 'LoginForm',
    data () {
        return {
            username: null,
            password: null,
            error: null,
            loading: false,
            shared: state
        }
    },
    methods: {
        getToken: async function() {
            let data = {
                user: this.username,
                pass: this.password
            };

            this.loading = true;
            let resp;

            try {
                resp = await $http.auth(data);
            } catch (ex) {
                this.error = ex;
                return;
            } finally {
                this.loading = false;
            }

            console.log(resp);
            sessionStorage.setItem('token', resp.data.token)
            this.shared.token = resp.data.token;

            this.$emit("loggedIn")
        }
    }
}
</script>

<style lang="sass">

.login-card
    width: 25em

.error
    color: #ff1744!important

</style>

