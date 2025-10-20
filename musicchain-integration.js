// Client snippet for musicchain.netlify.app to integrate with the wallet popup
// Usage (on your site):
//   const popup = openWalletPopup();                 // opens wallet UI in a popup
//   sendReceiveToWallet(popup, userAddress, chainId); // tells wallet which address/chain the site wants to send to
//   optionally: sendStartMonitor(popup, siteAddress, [chainIds]); // ask wallet to monitor for incoming txs

(function(){
  // Change this to where the wallet index.html is hosted (the wallet you pushed)
  const WALLET_URL = 'https://evm1est.github.io/evmt/index.html'; // e.g. https://your-domain.com/index.html or the deployed url of evm1est/evmt

  function openWalletPopup(width = 480, height = 780) {
    const left = (screen.width / 2) - (width / 2);
    const top = (screen.height / 2) - (height / 2);
    const opts = `width=${width},height=${height},top=${top},left=${left}`;
    const popup = window.open(WALLET_URL, 'MusicChainWallet', opts);
    return popup;
  }

  // Send the receive address and chain to the wallet popup.
  // popup: the returned window from openWalletPopup()
  // receiveAddress: string (user's receiving address), chainId: number|string
  function sendReceiveToWallet(popup, receiveAddress, chainId) {
    if(!popup) return console.warn('Wallet popup not opened');
    const msg = {
      action: 'set_receive',
      address: receiveAddress,
      chainId: String(chainId)
    };
    // Post messages repeatedly while popup is loading. The wallet will accept the message when ready.
    const interval = setInterval(()=>{
      try {
        popup.postMessage(msg, '*');
      } catch(e){}
    }, 300);
    // Stop after 6 seconds
    setTimeout(()=>clearInterval(interval), 6000);
  }

  // Ask the wallet to start monitoring incoming txs from your site address on the given chains.
  // siteAddress: the address on your site that will be sending tokens (payout address)
  // chains: array of chainIds to monitor (optional — if omitted wallet monitors all configured chains)
  function sendStartMonitor(popup, siteAddress, chains) {
    if(!popup) return console.warn('Wallet popup not opened');
    const msg = {
      action: 'start_monitor',
      siteAddress: siteAddress,
      chains: Array.isArray(chains) ? chains.map(c=>Number(c)) : undefined
    };
    // send repeatedly while popup loads
    const interval = setInterval(()=>{
      try { popup.postMessage(msg, '*'); } catch(e){}
    }, 300);
    setTimeout(()=>clearInterval(interval), 6000);
  }

  // Optionally request the wallet to add a custom/unknown chain (so users can accept tokens on that chain).
  // chainId: number or string, rpc: string (RPC URL), name: optional string
  function requestAddChain(popup, chainId, rpc, name) {
    if(!popup) return console.warn('Wallet popup not opened');
    const msg = {
      action: 'add_chain',
      chainId: String(chainId),
      rpc: rpc || '',
      name: name || ''
    };
    popup.postMessage(msg, '*');
  }

  // Export helper functions to the site namespace
  window.MusicChainIntegration = {
    openWalletPopup,
    sendReceiveToWallet,
    sendStartMonitor,
    requestAddChain
  };
})();
