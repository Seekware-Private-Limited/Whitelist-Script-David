const ethers = require('ethers');
const fs = require("fs");
const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK('fe3be5488486abd1ef3d', '93f1a3269ff3c3df7e7c7528a8a9447e52cf8942ba4ee76aff22e0dafe9aa518');
const PRIVATE_KEY = '23e8e0b6b802a5d4b6035fca7922d6b75b3bcdaa461919241e4436879b4818b9'
const CONTRACT_ADDRESS = '0x8b88bb4a9e0b59b7128ddb69ae04f280d6a568a9'
const CONTRACT_ADDRESS_MATIC = '0xAf86B321f112Efc701846e5EF90A529d5E3A9386'
const ABI = require('./abi.json');
const MATIC_ABI = require('./matic_abi.json');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/vientoairdrop');


const tokenSchema = mongoose.model('Token', { address:  String,
    txnHash: String,
    uri: String,
    status: Boolean,
    date: { type: Date, default: Date.now },
});

/* GET home page. */

const addUserToWhitelist = async () => {
  const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = await new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
  for (let index = 1; index < 156; index++) {
    const element =  await contract.ownerOf(index.toString())
    console.log(element);
    let token = new tokenSchema({
        address: element,
        txnHash: null,
        status: false,
    });
    await token.save();
  }
}

const uploadImage = async (filename) => {
  // var stream = await fs.createReadStream(__dirname + '/nft/Alejandra Sieder_Un1ty_' + filename)
  await fs.writeFileSync(__dirname + '/foo.json', JSON.stringify(filename));

  var stream = await fs.createReadStream(__dirname + '/foo.json')
  const resp = await pinata.pinFileToIPFS(stream)
  console.log('daata', resp.IpfsHash);
  return resp.IpfsHash;

  
}

const formatIndex = async (index) => {
  if (index.toString().length === 1) {
    return '00'+index.toString()
  } else if (index.toString().length === 2) {
    return '0'+index.toString()
  } else {
    return index.toString();
  }
}

const airDropImage = async () => {
  const addresses = await tokenSchema.find().sort({_id:1});
  for (let index = 104; index < addresses.length; index++) {
    const element = addresses[index];
    let indexName = await formatIndex(index + 1);
    console.log('indexName', indexName);
    let imagee;
    if (index === 0) {
      imagee = await uploadImage(`${indexName}.gif`)
      console.log(imagee);
    } else {
      imagee = await uploadImage(`${indexName}.png`)
      console.log(imagee);
    }

    await tokenSchema.findByIdAndUpdate(element.id, { uri: 'https://gateway.pinata.cloud/ipfs/'+imagee});

  }
}

const transferFrom = async () => {
  
  const addresses = await tokenSchema.find().sort({ _id: 1 });
  const provider = new ethers.providers.JsonRpcProvider('https://matic-mainnet-full-rpc.bwarelabs.com');
    const wallet = new ethers.Wallet('23e8e0b6b802a5d4b6035fca7922d6b75b3bcdaa461919241e4436879b4818b9', provider);
    const contract = await new ethers.Contract(CONTRACT_ADDRESS_MATIC, MATIC_ABI, wallet);
    for (let index = 0; index < addresses.length; index++) {
      const element = addresses[index];
      // const txn = await contract.transferFrom('0x4fa32Cd7b1E4499500912D43b93Eb1428a121744', element.address, index+1, {
      //   gasPrice:70000000000,
      //   gasLimit:300000,
      //   nonce:index + 158
      // });
      // console.log('txn ',index+1, txn.hash);

      const newURI = await uploadImage({image: element.uri})
      console.log('uri ',`https://gateway.pinata.cloud/ipfs/${newURI}`);
      const resp = await contract.setTokenURi(index + 1, `https://gateway.pinata.cloud/ipfs/${newURI}`, {
        gasPrice:70000000000,
        gasLimit:300000,
        nonce:index + 313
      })

      console.log('resp ',index+1, resp.hash);
    }

}


// const addUserToWhitelist = async () => {
//   const data = xlsx.readFile('./new.xlsx');
  
//   let finalData = xlsx.utils.sheet_to_json(data.Sheets.Sheet1)
//   finalData = JSON.parse(JSON.stringify(finalData));

//   console.log(finalData);
//   let data1 = {}
//   for (let index = 0; index < finalData.length; index++) {

//     data1[index] = 0.01
    
//   }

//   console.log(data1);
// }

// router.get('/', async function(req, res, next) {
 
// });

transferFrom();
