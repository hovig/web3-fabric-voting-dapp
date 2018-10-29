#!/bin/bash
#Hovig Ohannessian
set -e

# Cleanup any existing local docker images, volumes & containers
echo "Removing existing containers"
docker stop $(docker ps -q)
docker rm $(docker ps -aq)
docker rmi $(docker images -q) -f
docker volume prune

# export path to go folder
export GOPATH=$HOME/go
GOROOT="/src/github.com/hyperledger/"
DIR_FABRIC="fabric-samples"
DIR_APP="web3-voting-dapp"
DIR_CHAINCODE_EVM="fabric-chaincode-evm"

if [ -d $GOPATH$GOROOT ]; then
  echo "$GOPATH$GOROOT directory exists"
else
  #create new folder
  sudo mkdir -p $GOPATH$GOROOT
  chmod +x $GOPATH$GOROOT
fi
cd $GOPATH$GOROOT
echo "$GOPATH$GOROOT"

if [ ! -d "$DIR_FABRIC" ]; then
  # clone fabric samples version 1.3
  git clone https://github.com/hyperledger/fabric-samples.git -b release-1.3
fi
echo "fabric-samples exists"

if [ ! -d "$DIR_APP" ]; then
  # clone the voting repo
  git clone https://github.com/hovig/web3-fabric-voting-dapp.git
fi
echo "web3-fabric-voting-dapp exists"
chmod 777 fabric-samples
cd fabric-samples

# install/run the latest docker images for Hyperledger Fabric
./scripts/bootstrap.sh
cd first-network
rm -rf docker-compose-cli.yaml
cd ${GOPATH}/src/github.com/hyperledger/fabric-samples/first-network

# copy this modified yaml file that includes chaincode evm volume
cp ${GOPATH}/src/github.com/hyperledger/web3-voting-dapp/scripts/docker-compose-cli.yaml .

# fabric network execution
./byfn.sh -m down
./byfn.sh -m up

cd ${GOPATH}/src/github.com/hyperledger/
if [ ! -d "$DIR_CHAINCODE_EVM" ]; then
  # clone fabric chaincode evm
  git clone https://github.com/hyperledger/fabric-chaincode-evm.git
fi
chmod 777 fabric-chaincode-evm
echo "fabric-chaincode-evm exists"

# export fabric proxy settings
export FABPROXY_CONFIG=/Users/oohanne@us.ibm.com/go/src/github.com/hyperledger/fabric-chaincode-evm/examples/first-network-sdk-config.yaml
export FABPROXY_USER=User1
export FABPROXY_ORG=Org1
export FABPROXY_CHANNEL=mychannel
export FABPROXY_CCID=evmcc
export PORT=5000
docker exec -it cli bash
