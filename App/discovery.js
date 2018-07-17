'use strict'

let DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
const fs = require('fs');
const util = require('util')

// conexion watson Discovery
let discovery = new DiscoveryV1({
    version: '2018-03-05',
    username: process.env.DISCOVERY_USERNAME || '<username>',
    password: process.env.DISCOVERY_PASSWORD || '<password>',
    url: process.env.DISCOVERY_URL || '<url>'
});

/* let discovery = new DiscoveryV1({
    version: '2018-03-05',
    username: '6411ab18-43b7-4f5d-a86d-285743cc07b6',
    password: 'z5o2lCyLNBKs',
    url: 'https://gateway.watsonplatform.net/discovery/api'
}); */

//agregar documento 
let add = (req, res) => {
    let file = fs.readFileSync('/home/jerson-aos/Documents/Proyectos/myChatBot/App/db/lorem-ipsum.pdf')
    discovery.addDocument({ environment_id: '44fcc1e6-2e59-4a95-9b25-516f9dcddf3f', collection_id: '2663467a-4b7e-4cd2-85a9-6fc957bf5a02', file: file },
        function (error, data) {
            console.log(JSON.stringify(data, null, 2));
        }
    )
}

//consultar
let search = async (req, res) => {
    let query = req.params.query
    let params = {
        environment_id: '44fcc1e6-2e59-4a95-9b25-516f9dcddf3f',
        collection_id: '2663467a-4b7e-4cd2-85a9-6fc957bf5a02',
        natural_language_query: query,
        passages: true
    }  
    
    let dis = util.promisify(discovery.query.bind(discovery))
    let result = await dis.call(discovery, params)
    console.log(result.passages);
    res.send(result.passages)


}

// Eliminar Documento
let remove = (req, res) => {
    discovery.deleteDocument({
        environment_id: '44fcc1e6-2e59-4a95-9b25-516f9dcddf3f', collection_id: '2663467a-4b7e-4cd2-85a9-6fc957bf5a02',
        document_id: 'd6ca613a81ce13ec78cd1820a9c1feb6', function(error, data) {
            console.log(JSON.stringify(data, null, 2));
        }
    })
}


//************************************************************************************** */
// Crea un Entorno
/* discovery.createEnvironment({
    name: 'entorno-de-prueba',
    description: 'My environment'
  },
    function (err, response) {
      if (err)
        console.log('error:', err);
      else
        console.log(JSON.stringify(response, null, 2));
  }); */

//************************************************************************************** */
// Verifica los entornos creados
/* discovery.listEnvironments({}, function(error, data) {
  console.log(JSON.stringify(data, null, 2));
}); */

module.exports = {
    add,
    search,
    remove
}