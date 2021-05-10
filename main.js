const { app, BrowserWindow } = require('electron')
const path = require('path')

// former node_express
//const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
//const app = express();
const server = http.createServer(app);
const io = socketio(server);
const router = express.Router();

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.webContents.openDevTools()

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})












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



// Final settings
//app.use('/', router);

const PORT = 3000 || process.env.PORT;

//server.listen(PORT, () => console.log(`listening on port ${PORT}!`));