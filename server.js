/**
author - Hovig Ohannessian
**/
const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');

code = fs.readFileSync('Voting.sol').toString()
compiledCode = solc.compile(code);
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:5000"));//("http://localhost:8545"));

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

abi = JSON.parse('[{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"totalVotesFor","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"validCandidate","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"votesReceived","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"x","type":"bytes32"}],"name":"bytes32ToString","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"candidateList","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"voteForCandidate","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"contractOwner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"inputs":[{"name":"candidateNames","type":"bytes32[]"}],"payable":false,"type":"constructor"}]')
VotingContract = web3.eth.contract(abi);

abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface),
VotingContract = web3.eth.contract(abiDefinition),
byteCode = compiledCode.contracts[':Voting'].bytecode,
deployedContract = VotingContract.new(['yes','no','maybe'],{data: byteCode, from: web3.eth.accounts[0], gas: 4700000}),
contractInstance = VotingContract.at(web3.eth.getTransactionReceipt(deployedContract.transactionHash).contractAddress)//'0xadd1f48de343ad84fbdef7f5d9b2a2ac58d94aef');

let name = "", candidateName = "", myData = "", yesCount = "", noCount = "", maybeCount = "";

app.get('/', function (req, res) {
  res.render('index', {poll: null, error: null});
})

app.post('/', function (req, res) {
  name = req.body.name;
  if(!name.toLowerCase())
    name.toLowerCase()
  if(name === undefined || name === null || name === "") {
    name = 'Error, please try again';
    res.render('index', {poll: null, error: name});
  } else {
    var candidate = processWeb3(name)
    res.render('index', {poll: candidate, error: null}, function(err, result) {
        res.send(result)
    });
  }
})

function processWeb3(val) {
  candidateName = val;
  contractInstance.voteForCandidate(candidateName, {from: web3.eth.accounts[0]}, function() {});
  if(candidateName === "yes") {
    yesCount =  'yes: ' + (parseInt(contractInstance.totalVotesFor.call(candidateName).toString())+1).toString()+'<br>'
    console.log("totalVotesFor -", yesCount.replace("<br>", ""))
  } else if(name === "no") {
    noCount =  'no: ' + (parseInt(contractInstance.totalVotesFor.call(candidateName).toString())+1).toString()+'<br>'
    console.log("totalVotesFor -", noCount.replace("<br>", ""))
  } else {
    maybeCount = 'maybe: ' + (parseInt(contractInstance.totalVotesFor.call(candidateName).toString())+1).toString()
    console.log("totalVotesFor -", maybeCount)
  }
  myData =  yesCount + noCount + maybeCount
  console.log("totalVotesFor: \n", yesCount.replace("<br>", ""), "\n", noCount.replace("<br>", ""), "\n", maybeCount)
  return myData
}

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
