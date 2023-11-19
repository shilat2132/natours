
import { login, logout } from "./login";
import { updateSettings } from "./updateSettings";


//DOM elements
const loginForm = document.querySelector(".loginForm")
const logoutBtn = document.querySelector('.nav__el--logout')
const updateSettingForm = document.querySelector('.form-user-data')
const updatePasswordForm = document.querySelector('.form-user-password')


if(updatePasswordForm){
    updatePasswordForm.addEventListener('submit', event=>{
        event.preventDefault()
        const currentPassword = document.getElementById('password-current').value
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('password-confirm').value
        updateSettings({currentPassword, password, passwordConfirm}, 'password')
        

    })
}

if(updateSettingForm){
    updateSettingForm.addEventListener('submit',  event=>{
        event.preventDefault()
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        console.log(form);

        updateSettings(form, 'data');

    })
}

if(loginForm){
    loginForm.addEventListener('submit', e=>{
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        console.log(email, password)
        login(email, password)
    })
}

if(logoutBtn){logoutBtn.addEventListener('click', logout)}
