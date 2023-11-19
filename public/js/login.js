import { showAlert } from "./alerts";
export const login= async(email, password)=>{
    try {
        const response = await fetch('http://localhost:8000/api/users/login',
        { method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({email, password})
         }
         )
         const data = await response.json()
         
         if(data.status === "success"){
            console.log(data)
             showAlert('success', 'you logged in succesfuly')
             window.setTimeout(()=>{
                location.assign('/')
             }, 1500)
         }
         else{
            throw new Error( data.message)
         }

    } catch (error) {
        showAlert('error', error.message)
    }
}


export const logout = async ()=>{
   try {
    const response = await fetch('http://localhost:8000/api/users/logout')
    const data = await response.json()
    if(data.status === 'success') location.assign('/')
    else throw new Error()
   } catch (error) {
        showAlert('error', "couldn't logout")
   }
}

