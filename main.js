const { app, BrowserWindow, Menu } = require('electron')
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
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.webContents.openDevTools()

  win.loadFile('index.html')
  

}



app.whenReady().then(() => {
  createWindow()

  // TESTING THE MENUBAR STUFF
  Menu.setApplicationMenu(mainMenu)

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







// THIS IS FOR THE APPLICATION MENU ON THE TOP BAR

const isMac = process.platform === "darwin";

const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: "Edge",
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      { role: 'open' },
      { role: 'save' },
      { role: 'save as' },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]



const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);








io.on('connection', socket => {


    console.log("connected")

    // Test the socket connection
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

// USING THE NODE_EXPRESS BACKEND SO ITS DISABLED
// server.listen(PORT, () => console.log(`listening on port ${PORT}!`));


