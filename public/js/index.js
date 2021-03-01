// quando o conteudo da dom estiver carregado
document.addEventListener('DOMContentLoaded', () => {

    // Liga o websocket
    //var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port, {secure: true});


    //var socket = io.connect('http://localhost:3000');
    const socket = io();
    //console.log(io)

    socket.on('connect', function(data) {
        socket.send('Hello World from client');
    });


    // Ao receber os dados de um node
    socket.on('message', message =>
    {
        alert(message);

    });


    // Cria o grafo
    var graph = {
        nodes: [],
        edges: []
    };

    // Inicia o sigma
    var s = new sigma(
    {
        graph: graph,
        renderer: {
            container: document.getElementById('sigma-container'),
            type: 'canvas'
        },
        settings: {
            minEdgeSize: 2,
            maxEdgeSize: 2,
            minNodeSize: 1,
            maxNodeSize: 6,
            drawLabels: false
        }
    });


    // Pede pelos dados
    socket.emit('get_nodes');
    socket.emit('get_edges');
    console.log("asking for the data")
    //socket.send('get_nodes');
    //socket.send('get_edges');

    // Ao receber os dados de um node
    socket.on('get_nodes', data =>
    {
        console.log("RECEIVED NODES")
        console.log(data)
        for (let point of data)
        {

            //cria o node

            node = {
                id: point,
                label: "label",
                x: Math.random(),
                y: Math.random(),
                size: 1,
                color: "#000000"
            }

            //node = point;

            // adiciona ao grafo

            s.graph.addNode(node);

            //s.graph.addNode(point);
            //console.log(node)
            //console.log("testing this")
            console.log(point);
        }

    });

    // Ao receber os dados de um edge
    socket.on('get_edges', data =>
    {
        console.log("RECEIVED EDGES");
        console.log(data)
        let counter = 0;

        for (let point of data)
        {

            // cria um edge
            edge = {
                id: counter,
                source: point[0],
                target: point[1],
                color: "#000000",
                size:1,
                type:'arrow',
            }

            // adiciona ao grafo
            s.graph.addEdge(edge)
            //console.log(edge)

            counter++
        }
        // para criar um popup com dados do video

        s.bind("clickNode", function(e) {
            var node = e.data.node;

            //console.log(node);
            //socket.emit('node_data');

            //socket.on('node_data', data =>
            //{
            //node.size = 10;
            //node.color = "red";

            //<a href=""> </a>
            //var message = node.label + " - " + "<a href=https://youtu.be/" + node.id + " \"> "  + "link"
            var message = "<a href=https://youtu.be/" + node.id + " \"> " + node.label + "</a>";

            var popup = document.getElementById("myPopup");
            popup.innerHTML = message
            //popup.classList.toggle("show");
            //}



            s.refresh()


        });


        // ajustes finais do grafo

        // Carrega o grafo no sigma
        s.graph.read(graph);

        // Faz o sigma criar o grafo
        s.refresh();


        // noverlap
        // Configura o noverlap layout
        var noverlapListener = s.configNoverlap({
            nodeMargin: 0.1,
            scaleNodes: 1.05,
            gridSize: 70,
            easing: 'quadraticInOut', // transicao da animacao
            duration: 1100   // duracao da animacao
        });


        // Bind
        noverlapListener.bind('start stop interpolate', function(e) {
            console.log(e.type);
            if(e.type === 'start') {
                console.time('noverlap');
            }
            if(e.type === 'interpolate') {
                console.timeEnd('noverlap');
            }
        });

        // inicia o algoritmo de espacialização
        s.startForceAtlas2({worker: true, barnesHutOptimize: false});

        // para o algoritmo apos 10s
        window.setTimeout(function() {s.killForceAtlas2(), s.startNoverlap()}, 10000 );


    });


});
