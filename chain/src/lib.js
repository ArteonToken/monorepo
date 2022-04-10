import ContractMessage from './messages/contract'
import TransactionMessage from './messages/transaction'
import BlockMessage from './messages/block'
import BWMessage from './messages/bw'
import BWRequestMessage from './messages/bw-request'

const contractFactory = '5xdacidibzi36j2fom7rlygrehnw24743biu4plamvrrvd3p2ymllfson4'
const nativeToken = '5xdacieaoi2akig2ql4ax6k7jwhrdo3fhzgdzom2322pde3qdp3mgjd5xm'
const nameService = '5xdacifrabypzoz2r5vhhnqsuyiwjsjh6ykkwflcqym7nie5pyzma75iq4'
const validators = '5xdacidvkt26jy6k6izimrktbqq4ncrpqxvrykkk2vxzm34b7zr7kvtsfq'

const contractFactoryMessage = 'edc6010a3633437a5634784d417142475263696d695665714c715133617856426f7453664c705333466354374c4e6e56665a5054474e335673467912e20472657475726e20636c61737320466163746f72797b23743d224172744f6e6c696e65436f6e7472616374466163746f7279223b23723d303b23613d5b5d3b676574206e616d6528297b72657475726e20746869732e23747d67657420636f6e74726163747328297b72657475726e5b2e2e2e746869732e23615d7d67657420746f74616c436f6e74726163747328297b72657475726e20746869732e23727d697376616c696428742c722c612c6f3d5b5d297b636f6e737420633d6e657720436f6e74726163744d657373616765287b63726561746f723a722c636f6e74726163743a612c636f6e7374727563746f72506172616d65746572733a6f7d293b72657475726e20426f6f6c65616e28632e686173683d3d3d74297d6173796e63206465706c6f79436f6e747261637428742c722c612c6f3d5b5d297b696628612e63726561746f72213d3d6d73672e73656e646572297468726f77206e6577204572726f7228226f6e6c79206120636f6e74726163742063726561746f722063616e206465706c6f79206120636f6e747261637422293b696628617761697420636f6e747261637453746f72652e686173286861736829297468726f77206e6577204572726f7228226475706c696361746520636f6e747261637422293b69662821746869732e697356616c696428742c722c612c6f29297468726f77206e6577204572726f722822696e76616c696420636f6e747261637422293b617761697420636f6e747261637453746f72652e70757428686173682c656e636f646564292c746869732e23722b3d312c746869732e23612e707573682868617368297d7d3b0a'
const nativeTokenMessage = 'edc6010a3633437a5634784d417142475263696d695665714c715133617856426f7453664c705333466354374c4e6e56665a5054474e335673467912f80b72657475726e20636c617373204172744f6e6c696e6520657874656e647320636c61737320546f6b656e7b23653b23733b23613d303b23723d7b7d3b23743d7b7d3b236c3d31383b236e3d4269674e756d6265722e66726f6d2830293b236f3d7b4f574e45523a5b5d2c4d494e543a5b5d2c4255524e3a5b5d7d3b636f6e7374727563746f7228652c732c613d3138297b6966282165297468726f77206e6577204572726f7228226e616d6520756e646566696e656422293b6966282173297468726f77206e6577204572726f72282273796d626f6c20756e646566696e656422293b746869732e23653d652c746869732e23733d732c746869732e236c3d612c746869732e2369286d73672e73656e6465722c224f574e455222297d676574206e616d6528297b72657475726e20746869732e23657d6765742073796d626f6c28297b72657475726e20746869732e23737d67657420686f6c6465727328297b72657475726e20746869732e23617d6765742062616c616e63657328297b72657475726e7b2e2e2e746869732e23727d7d67657420726f6c657328297b72657475726e7b2e2e2e746869732e236f7d7d686173526f6c6528652c73297b72657475726e2121746869732e236f5b735d26262d31213d3d746869732e236f5b735d2e696e6465784f662865297d236928652c73297b696628746869732e686173526f6c6528652c7329297468726f77206e6577204572726f722860247b737d20726f6c6520616c7265616479206772616e74656420666f7220247b657d60293b746869732e236f5b735d2e707573682865297d6772616e74526f6c6528652c73297b69662821746869732e686173526f6c6528652c224f574e45522229297468726f77206e6577204572726f7228224e6f7420616c6c6f77656422293b746869732e236928652c73297d6d696e7428652c73297b69662821746869732e686173526f6c65286d73672e73656e6465722c224d494e542229297468726f77206e6577204572726f7228226e6f7420616c6c6f77656422293b746869732e236e3d746869732e236e2e6164642873292c746869732e236828652c73297d6275726e28652c73297b69662821746869732e686173526f6c65286d73672e73656e6465722c224255524e2229297468726f77206e6577204572726f7228226e6f7420616c6c6f77656422293b746869732e236e3d746869732e236e2e7375622873292c746869732e236328652c73297d236428652c732c61297b69662821746869732e23725b655d7c7c746869732e23725b655d3c61297468726f77206e6577204572726f722822616d6f756e7420657863656564732062616c616e636522297d236228652c73297b303d3d3d746869732e23725b655d262628746869732e23612d3d31292c746869732e23725b655d3e302626303d3d3d73262628746869732e23612b3d31297d236828652c73297b636f6e737420613d746869732e23725b655d3b746869732e23725b655d7c7c28746869732e23725b655d3d4269674e756d6265722e66726f6d283029292c746869732e23725b655d3d746869732e23725b655d2e6164642873292c746869732e236228652c61297d236328652c73297b636f6e737420613d746869732e23725b655d3b746869732e23725b655d3d746869732e23725b655d2e7375622873292c746869732e236228652c61297d62616c616e63654f662865297b72657475726e20746869732e23725b655d7d736574417070726f76616c28652c73297b636f6e737420613d676c6f62616c546869732e6d73672e73656e6465723b746869732e23745b615d7c7c28746869732e23745b615d3d7b7d292c746869732e23745b615d5b655d3d737d617070726f76656428652c732c61297b72657475726e20746869732e23745b655d5b735d3d3d3d617d7472616e7366657228652c732c61297b613d4269674e756d6265722e66726f6d2861292c746869732e236428652c732c61292c746869732e236328652c61292c746869732e236828732c61297d7d7b636f6e7374727563746f7228297b737570657228224172744f6e6c696e65222c22415254222c3138297d7d3b0a'
const nameServiceMessage = 'edc6010a3633437a5634784d417142475263696d695665714c715133617856426f7453664c705333466354374c4e6e56665a5054474e335673467912aa0872657475726e20636c617373204e616d65536572766963657b23723d224172744f6e6c696e654e616d6553657276696365223b23653b23733d303b236e3d7b7d3b23743b676574206e616d6528297b72657475726e20746869732e23727d67657420726567697374727928297b72657475726e7b2e2e2e746869732e236e7d7d636f6e7374727563746f7228722c652c73297b746869732e23653d6d73672e73656e6465722c746869732e236e2e4172744f6e6c696e65436f6e7472616374466163746f72793d7b6f776e65723a6d73672e73656e6465722c616464726573733a727d2c746869732e236e2e4172744f6e6c696e65546f6b656e3d7b6f776e65723a6d73672e73656e6465722c616464726573733a657d2c746869732e236e2e4172744f6e6c696e6556616c696461746f72733d7b6f776e65723a6d73672e73656e6465722c616464726573733a737d2c746869732e23743d657d6368616e67654f776e65722872297b6966286d73672e73656e646572213d3d746869732e2365297468726f77206e6577204572726f7228226e6f206f776e657222293b746869732e23653d727d6368616e676550726963652872297b6966286d73672e73656e646572213d3d746869732e2365297468726f77206e6577204572726f7228226e6f206f776e657222293b746869732e23733d727d6368616e676543757272656e63792872297b6966286d73672e73656e646572213d3d746869732e2365297468726f77206e6577204572726f7228226e6f206f776e657222293b746869732e23743d727d6173796e632070757263686173654e616d6528722c65297b6966286177616974206d73672e63616c6c28746869732e23742c2262616c616e63654f66222c5b6d73672e73656e6465725d293c746869732e2373297468726f77206e6577204572726f722822707269636520657863656564732062616c616e636522293b7472797b6177616974206d73672e63616c6c28746869732e23742c227472616e73666572222c5b6d73672e73656e6465722c746869732e23652c746869732e23735d297d63617463682872297b7468726f7720727d746869732e236e5b725d3d7b6f776e65723a6d73672e73656e6465722c616464726573733a657d7d6c6f6f6b75702872297b72657475726e20746869732e236e5b725d7d7472616e736665724f776e65727368697028722c65297b6966286d73672e73656e646572213d3d746869732e236e2e6f776e6572297468726f77206e6577204572726f7228226e6f742061206f776e657222293b746869732e236e5b725d2e6f776e65723d657d6368616e67654164647265737328722c65297b6966286d73672e73656e646572213d3d746869732e236e2e6f776e6572297468726f77206e6577204572726f7228226e6f742061206f776e657222293b746869732e236e5b725d2e616464726573733d657d7d3b0a1a3a3578646163696469627a6933366a32666f6d37726c79677265686e77323437343362697534706c616d7672727664337032796d6c6c66736f6e341a3a35786461636965616f6932616b696732716c346178366b376a776872646f3366687a67647a6f6d3233323270646533716470336d676a6435786d1a3a35786461636964766b7432366a79366b36697a696d726b74627171346e63727071787672796b6b6b3276787a6d333462377a72376b7674736671'
const validatorsMessage = 'edc6010a3633437a5634784d417142475263696d695665714c715133617856426f7453664c705333466354374c4e6e56665a5054474e3356734679129f0a72657475726e20636c6173732056616c696461746f72737b23743d224172744f6e6c696e6556616c696461746f7273223b23613d303b23723d7b7d3b23653b23693b236e3b636f6e7374727563746f722874297b746869732e23653d6d73672e73656e6465722c746869732e236e3d3565342c746869732e23693d742c746869732e23612b3d312c746869732e23725b6d73672e73656e6465725d3d7b66697273745365656e3a286e65772044617465292e67657454696d6528292c6163746976653a21307d7d676574206e616d6528297b72657475726e20746869732e23747d676574206f776e657228297b72657475726e20746869732e23657d6765742063757272656e637928297b72657475726e20746869732e23697d6765742076616c696461746f727328297b72657475726e7b2e2e2e746869732e23727d7d67657420746f74616c56616c696461746f727328297b72657475726e20746869732e23617d676574206d696e696d756d42616c616e636528297b72657475726e20746869732e236e7d6368616e67654f776e65722874297b6966286d73672e73656e646572213d3d746869732e2365297468726f77206e6577204572726f7228226e6f7420616e206f776e657222297d6368616e676543757272656e63792874297b6966286d73672e73656e646572213d3d746869732e2365297468726f77206e6577204572726f7228226e6f7420616e206f776e657222293b746869732e23693d747d6861732874297b72657475726e20426f6f6c65616e28766f69642030213d3d746869732e23725b745d297d6173796e632061646456616c696461746f722874297b696628746869732e686173287429297468726f77206e6577204572726f722822616c726561647920612076616c696461746f7222293b636f6e737420613d6177616974206d73672e73746174696343616c6c28746869732e63757272656e63792c2262616c616e63654f66222c6d73672e73656e646572293b696628613c746869732e6d696e696d756d42616c616e6365297468726f77206e6577204572726f72286062616c616e636520746f206c6f772120676f743a20247b617d206e6565643a20247b746869732e236e7d60293b746869732e23612b3d312c746869732e23725b745d3d7b66697273745365656e3a286e65772044617465292e67657454696d6528292c6163746976653a21307d7d72656d6f766556616c696461746f722874297b69662821746869732e686173287429297468726f77206e6577204572726f72282276616c696461746f72206e6f7420666f756e6422293b746869732e23612d3d312c64656c65746520746869732e23725b745d7d6173796e632075706461746556616c696461746f7228742c61297b69662821746869732e686173287429297468726f77206e6577204572726f72282276616c696461746f72206e6f7420666f756e6422293b636f6e737420723d6177616974206d73672e73746174696343616c6c28746869732e63757272656e63792c2262616c616e63654f66222c6d73672e73656e646572293b696628723c746869732e6d696e696d756d42616c616e63652626746869732e23725b745d2e616374697665262628746869732e23725b745d2e6163746976653d2131292c723c746869732e6d696e696d756d42616c616e6365297468726f77206e6577204572726f72286062616c616e636520746f206c6f772120676f743a20247b727d206e6565643a20247b746869732e236e7d60293b746869732e23725b745d2e6163746976653d617d7d3b0a1a3a35786461636965616f6932616b696732716c346178366b376a776872646f3366687a67647a6f6d3233323270646533716470336d676a6435786d'

const calculateFee = transaction => {
  // excluded from fees
  if (transaction.decoded.to === validators) return 0
  // fee per gb
  let fee = transaction.encoded.length
  fee = fee / 1024
  fee = fee / 1000000
  const parts = String(fee).split('.')
  let decimals = 0
  if (parts[1]) {
    const potentional = parts[1].split('e')
    parts[1] = potentional[0]
    decimals = Number(potentional[1].replace(/\-|\+/g, '')) + Number(potentional[0].length)
  }

  return Number.parseFloat(fee.toString()).toFixed(decimals)
}

const calculateTransactionFee = transaction => {
  transaction = new TransactionMessage(transaction)
  return calculateFee(transaction)
}

const calculateReward = (validators, fees) => {
  validators = Object.keys(validators).reduce((set, key) => {
    if (validators[key].active) set.push({
      address: key,
      reward: 0
    })

  }, [])
}

export default {
  nativeToken,
  nameService,
  contractFactory,
  validators,
  contractFactoryMessage,
  nativeTokenMessage,
  nameServiceMessage,
  validatorsMessage,
  TransactionMessage,
  ContractMessage,
  BlockMessage,
  BWMessage,
  BWRequestMessage,
  calculateFee,
  calculateTransactionFee
}