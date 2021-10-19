var xlsx = require('xlsx');
const ethers = require('ethers');
const PRIVATE_KEY = ''
const CONTRACT_ADDRESS = ''
const ABI = require('./abi.json');
/* GET home page. */

const addUserToWhitelist = async () => {
  const data = xlsx.readFile('./final.xlsx');
  // for mainnet use this url https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
  const provider = new ethers.providers.JsonRpcProvider('https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = await new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
  let finalData = xlsx.utils.sheet_to_json(data.Sheets.Sheet1)
  finalData = JSON.parse(JSON.stringify(finalData));
  let nonce = 189
  for (let index = 0; index < finalData.length; index++) {
    const element = finalData[index];
    let resp = await contract.addUserToWhitelist(element.address, {
      nonce : nonce,
      gasLimit: 70000,
      gasPrice: ethers.utils.parseUnits('55.0', 'gwei')
    });
    if (resp && resp.hash) {
      nonce = nonce + 1;
      console.log('nonce', nonce);
    }
    if (finalData.length - 1 === index) {
      console.log(finalData);
    }
  }
}
// router.get('/', async function(req, res, next) {
 
// });

addUserToWhitelist();
