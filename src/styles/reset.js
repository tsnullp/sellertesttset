import theme from "./theme"

//https://github.com/UYEONG/NotoSans-subset
const resetStyles = `
  @import url('https://fonts.googleapis.com/css?family=Noto+Sans+KR:100,300,400,500,700,900');
  // @import url('https://fonts.googleapis.com/css?family=Nanum+Gothic:400,700,800&subset=korean');
  @import url('https://fonts.googleapis.com/css?family=Courgette&display=swap');

  /* nanum-gothic-regular - latin_korean */
@font-face {
  font-family: 'Nanum Gothic';
  font-style: normal;
  font-weight: 400;
  src: url('/fonts/nanum-gothic-v17-latin_korean-regular.eot'); /* IE9 Compat Modes */
  src: local('NanumGothic'),
       url('fonts/nanum-gothic-v17-latin_korean-regular.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('/fonts/nanum-gothic-v17-latin_korean-regular.woff2') format('woff2'), /* Super Modern Browsers */
       url('/fonts/nanum-gothic-v17-latin_korean-regular.woff') format('woff'), /* Modern Browsers */
       url('/fonts/nanum-gothic-v17-latin_korean-regular.ttf') format('truetype'), /* Safari, Android, iOS */
       url('/fonts/nanum-gothic-v17-latin_korean-regular.svg#NanumGothic') format('svg'); /* Legacy iOS */
}

/* nanum-gothic-700 - latin_korean */
@font-face {
  font-family: 'Nanum Gothic';
  font-style: normal;
  font-weight: 700;
  src: url('/fonts/nanum-gothic-v17-latin_korean-700.eot'); /* IE9 Compat Modes */
  src: local('NanumGothic Bold'), local('NanumGothic-Bold'),
       url('/fonts/nanum-gothic-v17-latin_korean-700.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('/fonts/nanum-gothic-v17-latin_korean-700.woff2') format('woff2'), /* Super Modern Browsers */
       url('/fonts/nanum-gothic-v17-latin_korean-700.woff') format('woff'), /* Modern Browsers */
       url('/fonts/nanum-gothic-v17-latin_korean-700.ttf') format('truetype'), /* Safari, Android, iOS */
       url('/fonts/nanum-gothic-v17-latin_korean-700.svg#NanumGothic') format('svg'); /* Legacy iOS */
}
/* nanum-gothic-800 - latin_korean */
@font-face {
  font-family: 'Nanum Gothic';
  font-style: normal;
  font-weight: 800;
  src: url('/fonts/nanum-gothic-v17-latin_korean-800.eot'); /* IE9 Compat Modes */
  src: local('NanumGothic ExtraBold'), local('NanumGothic-ExtraBold'),
       url('/fonts/nanum-gothic-v17-latin_korean-800.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('/fonts/nanum-gothic-v17-latin_korean-800.woff2') format('woff2'), /* Super Modern Browsers */
       url('/fonts/nanum-gothic-v17-latin_korean-800.woff') format('woff'), /* Modern Browsers */
       url('/fonts/nanum-gothic-v17-latin_korean-800.ttf') format('truetype'), /* Safari, Android, iOS */
       url('/fonts/nanum-gothic-v17-latin_korean-800.svg#NanumGothic') format('svg'); /* Legacy iOS */
}

/* noto-sans-kr-regular - latin_korean */
@font-face {
  font-family: 'Noto Sans KR';
  font-style: normal;
  font-weight: 400;
  src: url('/fonts/noto-sans-kr-v12-latin_korean-regular.eot'); /* IE9 Compat Modes */
  src: local('Noto Sans KR Regular'), local('NotoSansKR-Regular'),
       url('/fonts/noto-sans-kr-v12-latin_korean-regular.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('/fonts/noto-sans-kr-v12-latin_korean-regular.woff2') format('woff2'), /* Super Modern Browsers */
       url('/fonts/noto-sans-kr-v12-latin_korean-regular.woff') format('woff'), /* Modern Browsers */
       url('/fonts/noto-sans-kr-v12-latin_korean-regular.ttf') format('truetype'), /* Safari, Android, iOS */
       url('/fonts/noto-sans-kr-v12-latin_korean-regular.svg#NotoSansKR') format('svg'); /* Legacy iOS */
}
/* noto-sans-kr-700 - latin_korean */
@font-face {
  font-family: 'Noto Sans KR';
  font-style: normal;
  font-weight: 700;
  src: url('/fonts/noto-sans-kr-v12-latin_korean-700.eot'); /* IE9 Compat Modes */
  src: local('Noto Sans KR Bold'), local('NotoSansKR-Bold'),
       url('/fonts/noto-sans-kr-v12-latin_korean-700.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('/fonts/noto-sans-kr-v12-latin_korean-700.woff2') format('woff2'), /* Super Modern Browsers */
       url('/fonts/noto-sans-kr-v12-latin_korean-700.woff') format('woff'), /* Modern Browsers */
       url('/fonts/noto-sans-kr-v12-latin_korean-700.ttf') format('truetype'), /* Safari, Android, iOS */
       url('/fonts/noto-sans-kr-v12-latin_korean-700.svg#NotoSansKR') format('svg'); /* Legacy iOS */
}
/* noto-sans-kr-900 - latin_korean */
@font-face {
  font-family: 'Noto Sans KR';
  font-style: normal;
  font-weight: 900;
  src: url('/fonts/noto-sans-kr-v12-latin_korean-900.eot'); /* IE9 Compat Modes */
  src: local('Noto Sans KR Black'), local('NotoSansKR-Black'),
       url('/fonts/noto-sans-kr-v12-latin_korean-900.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
       url('/fonts/noto-sans-kr-v12-latin_korean-900.woff2') format('woff2'), /* Super Modern Browsers */
       url('/fonts/noto-sans-kr-v12-latin_korean-900.woff') format('woff'), /* Modern Browsers */
       url('/fonts/noto-sans-kr-v12-latin_korean-900.ttf') format('truetype'), /* Safari, Android, iOS */
       url('/fonts/noto-sans-kr-v12-latin_korean-900.svg#NotoSansKR') format('svg'); /* Legacy iOS */
}

// @font-face { 
//   font-family: 'S-CoreDream-8';
//   font-weight: 900;
//   font-style: normal;
//   src: url('/fonts/scdream8.woff');
//   src: local('SCDream8'),
//     url('/fonts/scdream8.woff') format('woff'),
//     url('/fonts/scdream8.woff2') format('woff2')
// }

@font-face { font-family: 
  'S-CoreDream-8Heavy'; 
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/S-CoreDream-8Heavy.woff') 
  format('woff'); 
  font-weight: normal; 
  font-style: normal; 
}

  html, body, div, span, applet, object, iframe,
  h1, h2, h3, h4, h5, h6, p, blockquote, pre,
  a, abbr, acronym, address, big, cite, code,
  del, dfn, em, img, ins, kbd, q, s, samp,
  small, strike, strong, sub, sup, tt, var,
  b, u, i, center, button,
  dl, dt, dd, ol, ul, li,
  fieldset, form, label, legend,
  table, caption, tbody, tfoot, thead, tr, th, td,
  article, aside, canvas, details, embed,
  figure, figcaption, footer, header, hgroup,
  menu, nav, output, ruby, section, summary,
  time, mark, audio, video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
    letter-spacing: -0.48px;
    -webkit-touch-callout: none !important;
    
  }
  /* HTML5 display-role reset for older browsers */
  article, aside, details, figcaption, figure,
  footer, header, hgroup, menu, nav, section {
    display: block;
  }
  body {
    
    
  }
  ol, ul {
    list-style: none;
  }
  blockquote, q {
    quotes: none;
  }
  blockquote:before, blockquote:after,
  q:before, q:after {
    content: '';
    content: none;
  }
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }
  html{
    /* @import 'variable'; */
    font-size: 10px;
    font-weight: 400;
    font-family: 'Noto Sans KR', sans-serif;
    //font-family: 'Spoqa Han Sans KR', 'Spoqa Han Sans', 'Sans-serif';
    // font-family: 'Nanum Gothic', sans-serif;
    
    color: ${theme.fontDefault};
    background: white;
    box-sizing: border-box;
    letter-spacing: -0.48px;
    line-height: 1;
  //   -ms-overflow-style: none; // IE에서 스크롤바 감춤
  // &::-webkit-scrollbar { 
  //   display: none !important; // 윈도우 크롬 등
  // }
  }
  a{
    color: inherit;
    text-decoration: none;
  }

  input{
    margin: 0;
    padding: 0;
  }

  overflow: hidden;
  // body {
  //   overflow: hidden;
  //   margin: 0;
  //   height: 100%;
  //   position: relative;
    
  // }

`

export default resetStyles
