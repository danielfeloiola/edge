const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const router = express.Router();




// testar sem o express.Router ?


// make a dir to serve static files
app.use('/public', express.static('public'));

router.get('/', function(req,res){


    const Graph = require('graphology');

    const graph = new Graph();

    // FS e parser para ler o conteúdo do arquivo
    const fs = require('fs')
    const csv = require('csv-parser');

    // caminho dos arquivos com os nos e arestas
    const nodes_filepath = "./public/nodes.csv"
    const edges_filepath = "./public/edges.csv"

    // le o arquivo com os nos
    fs.createReadStream(nodes_filepath)
        .on('error', () => {
            // handle error
            //console.log("some error")
        })

        .pipe(csv())
        .on('data', (row) => {
            //console.log(row.video_name);
            //console.log(row);


            //console.log(row.video_id);
            graph.addNode(row.video_name);
        })

        .on('end', () => {
            // handle end of CSV
    })


    // le o arquivo com os edges
    fs.createReadStream(edges_filepath)
        .on('error', () => {
            // handle error
        })

        .pipe(csv())
        .on('data', (row) => {
            //console.log(row.video_name);
            //console.log(row);
            //console.log(row.source_name);
            //console.log(row.target_name);


            //console.log(`EDGE: ${row.source_name} to ${row.target_name}`);

            graph.addEdge(row.source_name, row.target_name);
            //graph.addNode(row.video_name);
        })

        .on('end', () => {
            // handle end of CSV
    })

    console.log(graph.order);
    console.log(graph.size);

    console.log('Number of nodes', graph.order);
    console.log('Number of edges', graph.size);

    graph.forEachNode(node => {
        graph.forEachNeighbor(node, neighbor => console.log(node, neighbor));
    });


    // mostra a pagina

    //res.sendFile(path.join(__dirname+'/index.html'));
    //res.sendFile('./index.html', { root: __dirname });
    res.sendFile('./index.html', { root: "./views" });

})


// ROTA PARA A PAGINA ABOUT
router.get('/about', function(req,res){
    //res.sendFile(path.join(__dirname+'/about.html'));
    res.sendFile('./about.html', { root: "./views" });
})




//var http = require('http');
//var https = require('https');
//var httpServer = http.createServer(app);


/*
const io = require('socket.io')(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
*/

//io.on('connection', function(client) {
//    console.log('Client connected...');

//    client.on('join', function(data) {
//        console.log(data);
//    });

//});
io.on('connection', socket => {
    console.log("Connected to client")

    socket.emit('message', "Hello from server");
    // either with send()
    //socket.send('Hello!');

    // or with emit() and custom event names
    // socket.emit('greetings', 'Hey!', { 'ms': 'jane' }, Buffer.from([4, 3, 3, 1]));

    // handle the event sent with socket.send()
    socket.on('message', (data) => {
        console.log(data);
    });


    // handle the event sent with socket.emit()
    socket.on('get_nodes', () => {

        console.log("received get_nodes")

        var nodes = new Array();

        // FS e parser para ler o conteúdo do arquivo
        const fs = require('fs')
        const csv = require('csv-parser');

        // caminho dos arquivos com os nos e arestas
        const nodes_filepath = "./public/nodes.csv"

        // le o arquivo com os nos
        fs.createReadStream(nodes_filepath)
        .on('error', () => {
            // handle error
            console.log(error);
        })

        .pipe(csv())
        .on('data', (row) => {
            console.log(row.video_name);
            //nodes.push(row.video_id, row.video_name, "1");
            nodes.push(row.video_id);
            //nodes.push(row.video_id)

            //console.log(row);
            //console.log(row.video_id);
            //console.log(row.video_name);
            //graph.addNode(row.video_name);
        })

        .on('end', () => {
            // handle end of CSV
            console.log(nodes);
            // envia os nodes pelo socketio
            socket.emit('get_nodes', nodes);
        })

    });


    // handle the event sent with socket.emit()
    socket.on('get_edges', () => {

        console.log("received get_edges")

        var edges = new Array();

        // FS e parser para ler o conteúdo do arquivo
        const fs = require('fs')
        const csv = require('csv-parser');

        // caminho dos arquivos com os nos e arestas
        const edges_filepath = "./public/edges.csv"

        // le o arquivo com os edges
        fs.createReadStream(edges_filepath)
        .on('error', () => {
            // handle error
            console.log(error);
        })

        .pipe(csv())
        .on('data', (row) => {
            //console.log(row.video_name);
            //console.log(row);
            //console.log(row.source_name);
            //console.log(row.target_name);


            //console.log(`EDGE: ${row.source_name} to ${row.target_name}`);

            //graph.addEdge(row.source_name, row.target_name);
            //edges.push([row.source_name, row.target_name])
            edges.push([row.source, row.target])
            //graph.addNode(row.video_name);
        })
        .on('end', () => {
            // handle end of CSV
            console.log(edges)
            // envia os nodes pelo socketio
            socket.emit('get_edges', edges);
        })

    });




});






app.use('/', router);
//app.listen(process.env.port || 3000)

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`listening on port ${PORT}!`));

//console.log(`Server running at http://${hostname}:${port}/`);
