import Button from "antd/es/button"
import { Image, Checkbox } from 'antd';
import { useState } from 'react';

import { ThemeProvider } from "~theme"

// import type { CheckboxProps } from 'antd'

function IndexPopup() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [mainPics, setMainPics] = useState([]);
  const [descImgs, setDescImgs] = useState([]);
  const [colorImgs, setColorImgs] = useState([]);
  const [attrs, setAttrs] = useState([]);

  // let showDetail = false;
  const [showDetail, setShowDetail] = useState(false);

  const checkedPic = (index, type) => {
    // console.log(person, index)
    if(type ==='mainPics'){
      const updatedMainPics = mainPics.map((c, i) => {
        if (i === index) {
          c.checked = !c.checked;
        }
        return c;
      });
      setMainPics(updatedMainPics);
    }else{
      const updatedDescImgs = descImgs.map((c, i) => {
        if (i === index) {
          c.checked = !c.checked;
        }
        return c;
      });
      setDescImgs(updatedDescImgs);
    }
    
  };
  const colorPicItems = colorImgs.map((person, i) =>
    <div key={i} style={{marginRight: 3,marginBottom: 3}} >
      {/* <Checkbox onChange={()=>checkedPic(i, 'mainPics')} checked={person.checked}  style={{position: 'absolute', top: 2, left: 2, zIndex: 1, height: 20, width: 20}}></Checkbox> */}
      <Image src={person.src} alt="" style={{width: 40, height: 40}} />
      <span style={{marginLeft: 5}}>{person.title}</span>
    </div>
  );
  const mainPicItems = mainPics.map((person, i) =>
    <div key={i} className="main-pic-item" style={{marginRight: 5,marginBottom: 5, position: 'relative'}} >
      <Checkbox onChange={()=>checkedPic(i, 'mainPics')} checked={person.checked}  style={{position: 'absolute', top: 5, left: 5, zIndex: 1, height: 20, width: 20}}></Checkbox>
      <Image src={person.src} alt="" style={{width: 60, height: 60}} />
    </div>
  );
  const imgItems = descImgs.map((person, i) =>
    <div key={i} className="desc-img-item" style={{position: 'relative', minHeight: 30, width: 400}} >
      <Checkbox onChange={()=>checkedPic(i, 'descImgs')} checked={person.checked} style={{position: 'absolute', top: 5, left: 5, zIndex: 1, height: 20, width: 20}}></Checkbox>
      {person.checked && <Image src={person.src} alt="" />}
    </div>
  );
  const attrItems = attrs.map((person, i) =>
    <div key={i}>{person}</div>
  );

  
  const handleDownload = () => {
    
    var name = ''
    var text = '';
    text += "标题："+title+"\n";
    text += "价格：¥"+price+"\n";
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

    for (var i = 0; i < mainPics.length; i++) {
      const item = mainPics[i];
      if(item.checked){
        chrome.downloads.download({ url: item.src, filename: `${name}-主图-${i}.${/[^.]+$/.exec(item.src)}` });
      }
    }
    for (var i = 0; i < colorImgs.length; i++) {
      const item = colorImgs[i];
      // if(colorImgs[i].checked){
        chrome.downloads.download({ url: item.src, filename: `${name}-颜色图-${item.title}.${/[^.]+$/.exec(item.src)}` });
      // }
    }
    for (var i = 0; i < descImgs.length; i++) {
      const item = descImgs[i];
      if(item.checked){
        chrome.downloads.download({ url: item.src, filename: `${name}-详情-${i}.${/[^.]+$/.exec(item.src)}` });
      }
    }
  }
  const getImgUrl = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: async () => {
          window.scrollTo(0, document.body.scrollHeight)
          window.scrollTo(0, 0)
          await new Promise(resolve => setTimeout(resolve, 400));
          var images = document.querySelectorAll("img[class^=PicGallery--thumbnailPic]");
          var images_detail = document.querySelectorAll(".desc-root img.lazyload");
          var product_info = document.querySelectorAll("[class^=Attrs--attr--]");
          var color_images = document.querySelectorAll("[class^=skuIcon]");
          
          let data = {
            title: document.querySelector("[class^=ItemHeader--mainTitle]").textContent.trim(),
            price: document.querySelector("[class^=Price--priceText]").textContent.trim(),
            mainPics: [],
            descImgs: [],
            attr: [],
            colorImgs: []
          }
          for (var i = 0; i < images.length; i++) {
            data.mainPics.push( { 
              checked: true,
              src: images[i].src.split('_110x10000Q75.jpg_.webp')[0]
            } );
          }
          for (var i = 0; i < images_detail.length; i++) {
            let src = (images_detail[i].dataset.src || images_detail[i].src).split('?')[0];
            data.descImgs.push({ 
              checked: true,
              src: src.split('//')[0]?src: ('https:'+src)
            });
          }
          for (var i = 0; i < color_images.length; i++) {
            data.colorImgs.push( { 
              checked: true,
              title: color_images[i].parentNode.title,
              src: color_images[i].src.split('_60x60q50.jpg_.webp')[0]
            } );
          }
          for (var i = 0; i < product_info.length; i++) {
            data.attr.push(product_info[i].title);
          }
          return data;
        }
      }).then(function (result) {
        
        let resultData = result[0].result;
        setTitle(resultData.title);
        setPrice(resultData.price);
        setMainPics(resultData.mainPics);
        setDescImgs(resultData.descImgs);
        setAttrs(resultData.attr);
        setColorImgs(resultData.colorImgs);
        setShowDetail(true);
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
          width: 400,
        }}>
        <div>
          <Button type="primary" onClick={getImgUrl}>查看详情</Button>

          {showDetail && <Button type="primary" onClick={handleDownload} style={{marginLeft:10}}>下载</Button>}
        </div>
        {showDetail && 
          (
            <>
              <h3>标题：{title}</h3>
              <h3>价格：<font color="#FF5722">¥{price}</font></h3>
              <div className="">
                {attrItems}
              </div>
              <h3>主图：</h3>
              <div className="main-pics" style={{display: 'flex', flexWrap: 'wrap'}}>{mainPicItems}</div>
              <h3>颜色图：</h3>
              <div className="color-imgs">{colorPicItems}</div>
              
              <h3>详情：</h3>
              <div className="desc-imgs" style={{display: 'flex', flexWrap: 'wrap'}}>
                {imgItems}
              </div>
            </>
          )
        }
      </div>
    </ThemeProvider>
  )
}

export default IndexPopup
