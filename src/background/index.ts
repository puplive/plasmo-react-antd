chrome.action.onClicked.addListener(() => {
  // console.log(`action clicked: `)
})
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));