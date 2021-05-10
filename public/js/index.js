// quando o conteudo da dom estiver carregado
document.addEventListener('DOMContentLoaded', () => {

    alert("hello");
    // Liga o websocket
    //var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port, {secure: true});


    const socket = io.connect('http://localhost:3000');
    //const socket = io();

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
    },

    step = 0; // This was added with the animate function

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
            drawLabels: false,
            animationsTime: 1000
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

        // VARIABLES ADDED TO THE ANIMATE PLUGIN
        var L = 10;
        var N = 100;
        var E = 500;
        var i = 0;

        for (let point of data)
        {
            
            //cria o node

            node = {
                id: point,
                label: "label",
                x: Math.random(),
                y: Math.random(),
                reg_x: Math.random(),
                reg_y: Math.random(),
                size: 1,
                reg_size: 1,
                color: "#000000",
                reg_color: "#000000",

                circular_x: L * Math.cos(Math.PI * 2 * i / N - Math.PI / 2),
                circular_y: L * Math.sin(Math.PI * 2 * i / N - Math.PI / 2),
                circular_size: Math.random(),
                circular_color: '#' + (
                Math.floor(Math.random() * 16777215).toString(16) + '000000'
                ).substr(0, 6),
                grid_x: i % L,
                grid_y: Math.floor(i / L),
                grid_size: 1,
                grid_color: '#ccc'
            }

            //node = point;

            // adiciona ao grafo

            s.graph.addNode(node);

            //s.graph.addNode(point);
            //console.log(node)
            //console.log("testing this")
            console.log(point);

            i++;
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

            // Antiga função que mostrava os dados de um node quando ele era clicado - refazer


            //console.log(node);
            //socket.emit('node_data');

            //socket.on('node_data', data =>
            //{
            //node.size = 10;
            //node.color = "red";

            //<a href=""> </a>
            //var message = node.label + " - " + "<a href=https://youtu.be/" + node.id + " \"> "  + "link"

            //var message = "<a href=https://youtu.be/" + node.id + " \"> " + node.label + "</a>";



            //var popup = document.getElementById("myPopup");
            //popup.innerHTML = message
            //popup.classList.toggle("show");
            //}



            //s.refresh()


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




        
        // Variable for the theme switcher
        var theme = "day"

        // Function to change background color        
        document.getElementById("background-color-btn").addEventListener("click", function() {

            if (theme == "day"){
                // CHANGES TO DARK THEME
                document.body.style.setProperty("--graph-backgorund-color", "#242424");
                document.body.style.setProperty("--sidebar-color", "#333333");
                document.body.style.setProperty("--hoover-btn-color", "#505050");
                document.body.style.setProperty("--active-btn-strip-color", "#ffffff");
                document.body.style.setProperty("--icon-btn-color", "#808080");
                theme = "night";
            } else if (theme == "night") {
                // CHANGES TO LIGHT THEME
                document.body.style.setProperty("--graph-backgorund-color", "#e9e9e6");
                document.body.style.setProperty("--sidebar-color", "#2e4ead");
                document.body.style.setProperty("--hoover-btn-color", "#4360b5");
                document.body.style.setProperty("--active-btn-strip-color", "#92a6e2");
                document.body.style.setProperty("--icon-btn-color", "#92a6e2");
                theme = "day";
            } 
            
        }); 
         





        // Initialize the dragNodes plugin:
        var dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);

        dragListener.bind('startdrag', function(event) {
        console.log(event);
        });
        dragListener.bind('drag', function(event) {
        console.log(event);
        });
        dragListener.bind('drop', function(event) {
        console.log(event);
        });
        dragListener.bind('dragend', function(event) {
        console.log(event);
        });


        // ANIMATE PLUGIN
        // DESCOBRIR COMO DESFAZER AS MUDANÇAS DESSE MODO E VOLTAR PARA A ESP DO FORCE ATLAS
        document.getElementById("animate-btn").addEventListener("click", function() {
            console.log("animatig graph")
            var prefix = ['grid_', 'reg_'][step = +!step]; //, 'circular_', ''
            console.log(step)
            console.log(prefix)
            sigma.plugins.animate(
              s,
              {
                x: prefix + 'x',
                y: prefix + 'y',
                size: prefix + 'size',
                color: prefix + 'color'
              }
            );
        }); 

        // NOVO ESPACIALIZADOR
        var force = false;
        document.getElementById("spacialize-btn").onclick = function() {
            if (!force) {
                // inicia o algoritmo de espacialização
                s.startForceAtlas2({worker: true, barnesHutOptimize: false});
            }
            else {
                s.stopForceAtlas2();
                force = !force;
            };

            // para o algoritmo apos 10s
            window.setTimeout(function() {s.killForceAtlas2(), s.startNoverlap()}, 10000 );
            
        }; 

        document.getElementById('export').onclick = function() {
            console.log('exporting...');
            var output = s.toSVG({download: true, filename: 'mygraph.svg', size: 1000});
            // console.log(output);
          };

    });




});
