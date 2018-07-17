const mongoose = require('mongoose')

let url = 'mongodb://system:Root123@ds163680.mlab.com:63680/watson-assistant'

let moon = mongoose.connect(url, (err)=>{
    if (err) {
        console.log(`\'Hubo un error Conectando a mongo\' \n ${errr}`)        
    } else {
        console.log(`\'Conexion con mongo exitosa\'`)        
    }
})

exports = moon