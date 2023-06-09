<template>

    <div>

        <h1 class="font-medium text-4xl my-5">Set new password</h1>

        <p class="mb-3">Set a new password for your account. Just don't forget it this time.</p>

        <div v-if="error" class="flex p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800" role="alert">
            <svg aria-hidden="true" class="flex-shrink-0 inline w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
            <span class="sr-only">Info</span>
            <p>{{ error }}</p>
        </div>

        <div v-if="success" class="flex p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
            <svg aria-hidden="true" class="flex-shrink-0 inline w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
            <span class="sr-only">Info</span>
            <p>Your password has been changed. Now you can log in.</p>
        </div>

        <form @submit.prevent="submitNewPasswordForm" class="mt-5">

            <div class="mb-4">
                <label for="password" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">New password</label>
                <input 
                    v-model="newPasswordFormData.password"
                    @change="v$.password.$touch"  
                    type="password" 
                    name="password"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    :class="{
                        'border-red-500 focus:border-red-500': v$.password.$error,
                        'border-[#42d392] ': !v$.password.$invalid
                    }"  
                >
                <password-meter :password="newPasswordFormData.password" />
                <span class="text-xs text-red-500" v-if="v$.password.$error">{{ v$.password.$errors[0].$message }}</span>
            </div>

            <div class="mb-4">
                <label for="repeat_password" class="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Repeat new password</label>
                <input 
                    v-model="newPasswordFormData.repeatPassword"
                    @change="v$.repeatPassword.$touch"  
                    type="password" 
                    name="repeat_password"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    :class="{
                        'border-red-500 focus:border-red-500': v$.repeatPassword.$error,
                        'border-[#42d392] ': !v$.repeatPassword.$invalid
                    }"  
                >
                <span class="text-xs text-red-500" v-if="v$.repeatPassword.$error">{{ v$.repeatPassword.$errors[0].$message }}</span>
            </div>

            <button type="submit" class="float-right my-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Change password</button>

        </form>

    </div>

</template>


<script setup>

import { ref, reactive } from "vue";
import PasswordMeter from "vue-simple-password-meter";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, minLength, maxLength, sameAs } from "@vuelidate/validators";

const route = useRoute();

const newPasswordFormData = reactive({
    password: "",
    repeatPassword: ""
});

const rules = computed(() => {
    return {
        password: {
            required: helpers.withMessage("The password field is required", required),
            minLength: minLength(8),
            maxLength: maxLength(72)
        },
        repeatPassword: {
            required: helpers.withMessage("The repeat password field is required", required),
            sameAs: helpers.withMessage("Passwords don't match", sameAs(newPasswordFormData.password))
        }
    }
});

const v$ = useVuelidate(rules, newPasswordFormData);

const error = ref("");
const success = ref(0);

const submitNewPasswordForm = async () => {

    if(!route.query.token) return;

    v$.value.$validate();
    if(v$.value.$error) return;

    error.value = "";

    try {

        const res = await fetch("/api/user/recover/set-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                password: newPasswordFormData.password,
                token: route.query.token
            })
        })

        if(!res.ok) throw new Error("Failed to connect with API server");
        const body = await res.json();

        if(!body.success) throw new Error(body.error);

        return success.value = true;

    } catch(err) {
        console.error(err);
        error.value = err.message;
    }

}

</script>