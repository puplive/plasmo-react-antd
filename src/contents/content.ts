window.addEventListener("load", () => {
  
    // document.body.style.background = "pink"
    document.querySelectorAll('.b_ad').forEach(ad => {
        ad.innerHTML = '';
        ad.style.cssText += 'position:fixed; left: 10000000px;'
    });
    document.querySelectorAll('.Pc-word').forEach(ad => {
        ad.style.display = 'none';
    })
      
  })