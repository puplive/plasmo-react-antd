import Button from "antd/es/button"
import { Image, Checkbox } from 'antd';
import { useState } from 'react';

import { ThemeProvider } from "~theme"

// import type { CheckboxProps } from 'antd'

function IndexSidePanel() {
  const [filename, setFilename] = useState('');
  const [attrContent, setAttrContent] = useState('');
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
    // 创建一个新的Blob对象，用于保存文本内容
    var blob = new Blob([attrContent], {type: 'text/plain'});
    var url = URL.createObjectURL(blob);
    
    chrome.downloads.download({ url: url, filename: `${filename}/属性.txt` });
    for (var i = 0; i < mainPics.length; i++) {
      const item = mainPics[i];
      if(item.checked){
        chrome.downloads.download({ url: item.src, filename: `${filename}/主图-${i}.${/[^.]+$/.exec(item.src)}` });
      }
    }
    for (var i = 0; i < colorImgs.length; i++) {
      const item = colorImgs[i];
      // if(colorImgs[i].checked){
        chrome.downloads.download({ url: item.src, filename: `${filename}/颜色图-${item.title.replace(/\/|\\|\:|\*|\?|\"|\<|\>|\|/g, '-')}.${/[^.]+$/.exec(item.src)}` });
      // }
    }
    for (var i = 0; i < descImgs.length; i++) {
      const item = descImgs[i];
      if(item.checked){
        chrome.downloads.download({ url: item.src, filename: `${filename}/详情图-${i}.${/[^.]+$/.exec(item.src)}` });
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
          var images = document.querySelectorAll("img[class^=PicGallery--thumbnailPic]") || [];
          var images_detail = document.querySelectorAll(".desc-root img.lazyload") || [];
          var product_info = document.querySelectorAll("[class^=Attrs--attr--]") || [];
          var color_images = document.querySelectorAll("[class^=skuIcon]") || [];
          let title = document.querySelector("[class^=ItemHeader--mainTitle]");
          let price = document.querySelector("[class^=Price--priceText]");
          
          let data = {
            title: title?title.textContent.trim():'',
            price: price?price.textContent.trim():'',
            mainPics: [],
            descImgs: [],
            attrs: [],
            colorImgs: []
          }
          const changeImgUrlWebp = (src)=>{
            let arr = src.split('_');
            if(arr.length>1 &&arr[arr.length-1] === '.webp') {
              return  arr.slice(0, -2).join('_');
            } else {
              return src;
            }
          }
          // console.log(images)
          for (var i = 0; i < images.length; i++) {
            console.log(images[i].src)
            data.mainPics.push( { 
              checked: true,
              src: changeImgUrlWebp(images[i].src)
            } );
          }
          for (var i = 0; i < images_detail.length; i++) {
            let src = (images_detail[i].dataset.src || images_detail[i].src).split('?')[0];
            data.descImgs.push({ 
              checked: true,
              src: changeImgUrlWebp(src.split('//')[0]?src: ('https:'+src))
            });
          }
          for (var i = 0; i < color_images.length; i++) {
            data.colorImgs.push( { 
              checked: true,
              title: color_images[i].parentNode.title,
              src: changeImgUrlWebp(color_images[i].src)
            } );
          }
          for (var i = 0; i < product_info.length; i++) {
            data.attrs.push(product_info[i].title);
          }
          return data;
        }
      }).then(function (result) {
        
        let resultData = result[0].result;
        // console.log(resultData)
        setTitle(resultData.title);
        setPrice(resultData.price);
        setMainPics(resultData.mainPics);
        setDescImgs(resultData.descImgs);
        setAttrs(resultData.attrs);
        setColorImgs(resultData.colorImgs);

        var brandName = ''; // 品牌名
        var name = ''; // 货号或品名
        var text = '';
        text += "标题："+resultData.title+"\n";
        text += "价格：¥"+resultData.price+"\n";
        for (var i = 0; i < resultData.attrs.length; i++) {
          let attr = resultData.attrs[i].trim();
          text += attr+"\n";
          if(attr.indexOf('品牌：')>=0){
            brandName = attr.split('：')[1].trim();
          }else if(attr.indexOf('货号：')>=0 || attr.indexOf('款号：')>=0 || attr.indexOf('型号：')>=0 || attr.indexOf('品名：')>=0 || attr.indexOf('系列：')>=0){
            if(!name) {
              name = `[${attr.split('：')[1].trim()}]`
            }
          }
        }
        if(!brandName && resultData.attrs.length > 0) {
          brandName = resultData.attrs[0].trim()? resultData.attrs[0].trim().split('：')[1].trim() : '未知品牌'
        }
        if(!name) {
          name = '未知货号'
        }
        setFilename(`${brandName.replace(/\/|\\|\:|\*|\?|\"|\<|\>|\|/g, '-')}-${name.replace(/\/|\\|\:|\*|\?|\"|\<|\>|\|/g, '-')}`);
        setAttrContent(text);

        setShowDetail(true);
      });
    });
  }

  const handStart = () => {
    document.querySelector('button').click();
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
              {colorImgs.length > 0 && 
              <>
              <h3>颜色图：</h3>
              <div className="color-imgs">{colorPicItems}</div>
              </>
              }
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

export default IndexSidePanel
