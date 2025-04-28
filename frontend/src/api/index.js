import axios from 'axios';

const baseUrl = "http://localhost:5000";

export function startOperation({userName, searchParam, waitTimeout, pageTimeout, doLogin}) {
    axios.get(`${baseUrl}/start?user_name=${userName}&searchParam=${searchParam}&waitTimeout=${waitTimeout}
        &pageTimeout=${pageTimeout}&doLogin=${doLogin}`)
    .then((data) => {
        console.log(data)
    })
}


export function cancelOperation() {
    return new Promise((resolve, reject) => {
        axios.get(`${baseUrl}/cancel`)
        .then((data) => {
            resolve(data)
        }).catch((err)=> {
            reject(err)
        })
    })

}