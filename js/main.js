var nodes = new vis.DataSet([
    { id: 1, label: "Node 1"},
    { id: 2, label: "Node 2"},
    { id: 3, label: "Node 3"},
    { id: 4, label: "Node 4"},
    { id: 5, label: "Node 5"},
    { id: 6, label: "Node 6"},
    { id: 7, label: "Node 7"},
    { id: 8, label: "Node 8"},
    { id: 9, label: "Node 8"},
    { id: 10, label: "Node 8"},
]);

// create an array with edges
var edges = new vis.DataSet([
    { from: 1, to: 3, label: "23", length: 23},
    { from: 1, to: 2, label: "3", length: 3 },
    { from: 2, to: 4, label: "12", length: 12},
    { from: 2, to: 5, label: "1", length: 1},
    { from: 5, to: 4, label: "7", length: 7},
    { from: 5, to: 6, label: "8", length: 8},
    { from: 7, to: 4, label: "5", length: 5},
    { from: 5, to: 3, label: "4", length: 4},
    { from: 6, to: 7, label: "2", length: 2},
    { from: 1, to: 7, label: "5", length: 5},
    { from: 8, to: 9, label: "15", length: 15},
    { from: 9, to: 10, label: "3", length: 3},
    { from: 8, to: 10, label: "6", length: 6},
]);

// create a network
var container = document.getElementById("mynetwork");
var data = {
    nodes: nodes,
    edges: edges,
};

var options = {
    interaction: { hover: true },
    manipulation: {
        enabled: true,
    },
};

var network = new vis.Network(container, data, options);

network.on("selectEdge", function (params) {
    console.log("selectEdge Event:", params);
    startingNode = params.nodes[0]
    console.log(startingNode)
});

network.on("controlNodeDragging", function (params) {
    params.event = "[original event]";
    params.edges
    document.getElementById("eventSpanHeading").innerText =
        "control node dragging event:";
    document.getElementById("eventSpanContent").innerText = JSON.stringify(
        params,
        null,
        4
    );
});
network.on("click", function (params) {
    params.event = "[original event]";
    console.log(params)
});


let startingNode = 1
let endingNode = null
let visitedNodes = []
let visitedNodesPrevious = []
let visitedEdges = []
let cut = []

function minDistance()
{
    let min = Number.MAX_VALUE;
    let min_edge = -1;
    for(let v = 0; v < cut.length; v++)
    {
        console.log(getWeight(cut[v]), min)
        console.log((visitedNodes.includes(nodes.get(network.body.edges[cut[v]].options.to) && visitedNodes.includes(nodes.get(network.body.edges[cut[v]].options.from)))),network.body.edges[cut[v]].options.from,network.body.edges[cut[v]].options.to)
       if(getWeight(cut[v]) < min && !(visitedNodes.includes(nodes.get(network.body.edges[cut[v]].options.to) && visitedNodes.includes(nodes.get(network.body.edges[cut[v]].options.from))))){
           min_edge = cut[v];
           min = getWeight([cut[v]])

       }

    }
    return min_edge;
}


function updateVisitedEdge(edgeID){
    network.updateEdge(edgeID,{color: '#93c47d'});
    visitedEdges.push(edgeID)
    visitedNodes.forEach((n) =>{visitedNodesPrevious.push(n)})
    let node = visitedNodes.includes(nodes.get(edges.get(edgeID).to)) ? nodes.get(edges.get(edgeID).from) :  nodes.get(edges.get(edgeID).to)
    visitedNodes.push(node)
    edges.forEach((edge)=>{
        if(!visitedEdges.includes(edge.id))
            network.updateEdge(edge.id,{color: 'black'})
    })
    cut = []
    updateVisitedNode(node.id)
}

function updateVisitedNode(nodeID){
    network.updateClusteredNode(nodeID,{color: '#93c47d'})
}


function getWeight(edgeID){
    let label = network.body.edges[edgeID].options.label
    return label.split(' ').length < 3 ? parseInt(label) : parseInt(label.split(' ')[0]) + parseInt(label.split(' ')[2])

}



function getNewCut(){
    let previousWeight = 0

    visitedNodes.forEach((node)=> {
        network.getConnectedEdges(node.id).forEach((edgeConnected)=>{
            console.log(visitedNodes.includes(nodes.get(edges.get(edgeConnected).to)) && visitedNodes.includes(nodes.get(edges.get(edgeConnected).from)))
            if(!visitedEdges.includes(edgeConnected) && !(visitedNodes.includes(nodes.get(edges.get(edgeConnected).to)) && visitedNodes.includes(nodes.get(edges.get(edgeConnected).from)))){
                visitedEdges.forEach((edge)=>{
                    //if(edges.get(edge).to === edges.get(edgeID).from || edges.get(edge).to === edges.get(edgeID).to || edges.get(edge).from === edges.get(edgeID).from || edges.get(edge).from === edges.get(edgeID).to ){
                    //console.log(visitedNodesPrevious, " Non deve contenere "+ edges.get(edgeID).to + " o "+ edges.get(edgeID).from,(!visitedNodesPrevious.includes(edges.get(edgeID).to) && !visitedNodesPrevious.includes(edges.get(edgeID).from)))
                    if(!visitedNodesPrevious.includes(nodes.get(edges.get(edgeConnected).to)) && !visitedNodesPrevious.includes(nodes.get(edges.get(edgeConnected).from))){
                        previousWeight = getWeight([edge])
                        console.log(previousWeight, edge, network.body.edges[edge].options.label)
                    }
                    //}
                })
                if(previousWeight !== 0)
                    network.updateEdge(edgeConnected,{label: ( edges.get(edgeConnected).length) + " + " + previousWeight})
                //console.log("Nuovo peso = ", parseInt(edges.get(edgeConnected).length) + previousWeight, edges.get(edgeConnected).length + " + " +previousWeight)
                network.updateEdge(edgeConnected,{length: parseInt(edges.get(edgeConnected).length + previousWeight)})
                network.updateEdge(edgeConnected,{color: '#f44336'})
                cut.push(edgeConnected)
                console.log(network.body.data.edges.get(edgeConnected))
            }

        })
    })

}



async function dijkstra(){
    visitedNodes.push(nodes.get(startingNode))
    updateVisitedNode(startingNode)
    for (let i = 0; i < nodes.length - 1; i++) {

    console.log("####### Step ",i)
    console.log("Nodi visitati: ",visitedNodes)
    console.log("Archi visitati: ",visitedEdges)
    console.log("Cut: ",cut)

    getNewCut()
    await new Promise(r => setTimeout(r, 3000));
    console.log("Nuovo Cut: ",cut)
    let distance = minDistance()
        distance !== -1 ? updateVisitedEdge(distance) :

    await new Promise(r => setTimeout(r, 3000));

    if(distance === -1){
        console.log("stop")
        visitedNodesPrevious = []
        visitedEdges = []
        visitedNodes = []
        cut = []
        break;
    }


    if(endingNode !== null && visitedNodes.includes(nodes.get(endingNode)))
       break;

    }

}

