'use strict'

const { informationModel, userModel } = require('./db/model')

const ID_UNKNOWN = `Esta cedula no se encuentra registrada en nuestra base de datos.`

const getUser = (id) => {
    let projection = '-_id -__v'
    let modelMethod = userModel.find({ pid: parseInt(id) }, projection, (err) => {
        if (err) console.log(`Ha ocurrido un error en la consulta del usuario: \n${err}`)
    })
    return projection ? modelMethod.select(projection).exec() : modelMethod.exec()
}

const getName = async (id) => {
    let user = await getUser(id)
    if (user.length > 0) {
        return user[0].name
    } else {
        return 0
    }
}

const calculateAge = (birthday) => {
    let birthday_arr = birthday.split("-");
    let birthday_date = new Date(birthday_arr[2], birthday_arr[1] - 1, birthday_arr[0]);
    let ageDifMs = Date.now() - birthday_date.getTime();
    let ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

module.exports.validate = async (data) => {
    let percentage = data.ingresos * 0.2
    let diff = data.ingresos - data.egresos

    if (data.fuente_ingreso === "pensionado"){
        let name = await getName(data.cedula)
        if (name != 0) {
            return `Señor(a) ${name} por favor ingrese su edad`
        } else {
            return ID_UNKNOWN
        }
    }

    if (percentage <= diff && data.antiguedad >= 10 && data.tipo_contrato === 'indefinido') {

        let name = await getName(data.cedula)
        if (name != 0) {
            return `Señor(a) ${name} le puede prestar ${percentage * 36} a un plazo fijo de 36 meses. con una tasa anual del 14.08%`
        } else {
            return ID_UNKNOWN
        }
    } else {
        let name = await getName(data.cedula)
        if (name != 0) {
            return `Ohh :( Señor(a) ${name} segun lo resultados del estudio de factibilidad no cumples con los requisitos para accerder a un prestamo.`
        } else {
            return ID_UNKNOWN
        }
    }
}

module.exports.greet = async (data)=>{
    let name = await getName(data.context.cedula)
    if (name != 0) {
        return `Hola señor(a) ${name} ${data.output.text}`
    } else {
        return ID_UNKNOWN
    }
}