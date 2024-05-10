import Button from "antd/es/button"
import { Image } from 'antd';
import { useState } from 'react';

import { ThemeProvider } from "~theme"

function IndexPopup() {
  const [imgs, setImgs] = useState([]);
  const [attrs, setAttrs] = useState([]);
  const imgItems = imgs.map((person, i) =>
    <li key={i}><Image src={person} alt="" /></li>
  );
  const attrItems = attrs.map((person, i) =>
    <div key={i}>{person}</div>
  );
  const handleDownload = () => {
    
    var name = ''
    var text = '';
    for (var i = 0; i < attrs.length; i++) {
      text += attrs[i]+"\n";
      if(attrs[i].indexOf('货号：')>=0){
        name = `[${attrs[i].trim()}]`
        //attrs[i].split('货号：')[1].trim();
      }
    }
    // 创建一个新的Blob对象，用于保存文本内容
    var blob = new Blob([text], {type: 'text/plain'});
    var url = URL.createObjectURL(blob);
    
    // 创建一个下载链接并点击下载
    var a = document.createElement('a');
    a.href = url;
    a.download = name+'.txt';
    a.click();

    for (var i = 0; i < imgs.length; i++) {
      chrome.downloads.download({ url: imgs[i], filename: `${name}-详情-${i}.${/[^.]+$/.exec(imgs[i])}` });
    }
  }
  const getImgUrl = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          var images_detail = document.querySelectorAll(".desc-root img.lazyload");
          var images_detail = document.querySelectorAll(".desc-root img.lazyload");
          var product_info = document.querySelectorAll(".Attrs--attr--33ShB6X");
          let data = {
            img: [],
            attr: []
          }

          for (var i = 0; i < images_detail.length; i++) {
            data.img.push( images_detail[i].dataset.src || images_detail[i].src);
          }
          for (var i = 0; i < product_info.length; i++) {
            data.attr.push(product_info[i].title);
          }
          return data;
        }
      }).then(function (result) {
        console.log(result);
        setImgs(result[0].result.img);
        setAttrs(result[0].result.attr);
      });
    });
  }
  

  return (
    <ThemeProvider>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 16,
          width: 320,
        }}>
        <div>
          <Button type="primary" onClick={getImgUrl}>图片</Button>
          <Button type="primary" onClick={handleDownload}>下载</Button>
        </div>
        <div>
          {attrItems}
        </div>
        <ul>
          {imgItems}
        </ul>
      </div>
    </ThemeProvider>
  )
}

export default IndexPopup
