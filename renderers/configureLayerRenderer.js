const { ipcRenderer } = require('electron')

let layerType
let layerId

let activationOptions = [
    'elu',
    'hardSigmoid',
    'linear',
    'relu',
    'relu6',
    'selu',
    'sigmoid',
    'softmax',
    'softplus',
    'softsign',
    'tanh'
]

function processWindowArguments() {
    for (argvId in window.process.argv) {
        arg = window.process.argv[argvId]

        // Get layer type
        if (arg.length > 12 && arg.slice(0, 12) === '--layerType=') {
            layerType = arg.slice(12)

            // Get layer id
        } else if (arg.length > 10 && arg.slice(0, 10) === '--layerId=') {
            layerId = arg.slice(10)
        }
    }
}

function HTMLInputLayer(text, inputAttributes, breakLine) {

    let arrNodes = []

    arrNodes.push(document.createTextNode(text))

    let inputNode = document.createElement('input')
    for (key in inputAttributes) {
        inputNode.setAttribute(key, inputAttributes[key])
    }
    arrNodes.push(inputNode)

    if (breakLine) {
        arrNodes.push(document.createElement('br'))
    }

    return arrNodes
}

function addActivationInput(id, text) {
    let HTMLForm = document.getElementById('configureLayerForm')

    let activationNode = document.createElement('select')
    activationNode.setAttribute('name', 'activation')
    activationNode.setAttribute('id', id)

    for (activationOptionsIndex in activationOptions) {

        let activationOption = activationOptions[activationOptionsIndex]

        let optionNode = document.createElement('option')
        optionNode.setAttribute('value', activationOption)
        optionNode.innerHTML = activationOption

        activationNode.appendChild(optionNode)
    }

    HTMLForm.appendChild(document.createTextNode(text))
    HTMLForm.appendChild(activationNode)
    HTMLForm.appendChild(document.createElement('br'))

}

function addDropdownOptions(id, text, options) {
    let HTMLForm = document.getElementById('configureLayerForm')

    let node = document.createElement('select')
    node.setAttribute('name', 'activation')
    node.setAttribute('id', id)

    for (option of options) {

        let optionNode = document.createElement('option')
        optionNode.setAttribute('value', option)
        optionNode.innerHTML = option

        node.appendChild(optionNode)
    }

    HTMLForm.appendChild(document.createTextNode(text))
    HTMLForm.appendChild(node)
    HTMLForm.appendChild(document.createElement('br'))
}

function setUpLayerType() {
    document.getElementById('layerTypeTitle').innerHTML = "Configure layer: " + layerType

    let HTMLForm = document.getElementById('configureLayerForm')

    switch (layerType) {
        case 'Dense':
        case 'GRU':
        case 'LSTM':
            nodes = HTMLInputLayer("Units: ", { type: 'number', id: 'units', min: '1' }, true)
            for (nodeIndex in nodes) {
                HTMLForm.appendChild(nodes[nodeIndex])
            }

            if (layerType == 'GRU' || layerType == "LSTM") {
                addActivationInput('recurrentActivation', 'Recurrent activation: ')

                addDropdownOptions('returnSequences', 'Return sequences: ', [false, true]);
            }

            addActivationInput('activation', 'Activation: ');
            break;
        default:
            console.log("Layer not implemented!")
            break;
    }

    // Add Submit button
    let submitBtn = document.createElement('input')
    submitBtn.setAttribute('type', 'submit')
    submitBtn.setAttribute('id', 'submit')
    HTMLForm.appendChild(submitBtn)
}

processWindowArguments()
setUpLayerType()

let submitFormButton = document.querySelector('#configureLayerForm')

submitFormButton.addEventListener('submit', (event) => {
    event.preventDefault()
    let response = { layerId: layerId }

    let formNode = document.getElementById('configureLayerForm')
    for (nodeID in formNode.childNodes) {
        let node = formNode.childNodes[nodeID]

        if (node.value) {
            response[node.id] = node.value
        }
    }
    ipcRenderer.send('configureLayer', response)
    window.close()
})