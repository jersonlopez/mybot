/***************** Schema for a loan **********************************/

let informationSchema = {
    name: {
        type: String,
        required: true
    },
    pid: {
        type: String,
        required: true
    },
    income: {
        type: String,
        required: true
    },
    expenses: {
        type: String,
        required: true
    },
    type_contract: {
        type: String,
        required: true
    },
    antique: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    }
}


/***************** Schema for a user **********************************/

let userSchema = {
    name: {
        type: String,
        required: true
    },
    pid: {
        type: String,
        required: true
    }
}

module.exports = { informationSchema, userSchema }