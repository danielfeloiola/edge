//import { Request, Response } from 'express';

//class Main {
exports.main = function(req, res){
  //execute(req , res){
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
    res.sendFile('./dashboard.html', { root: "./views" });
  }



//}
//export {Main}
