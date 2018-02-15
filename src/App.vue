<template>
  <div id="app">
      <div class="navigate_bt">
        <router-link :to="{ name: 'InvoiceRecords' }" class="createinvoicebt">Home</router-link>
        <router-link to="/Custominvoice" class="createinvoicebt">Custom Invoice</router-link>
        <router-view></router-view>
      </div>    
  </div>
</template>

<script>
  export default {
    name: 'app'
  }
</script>

<style>  
  {/*  @import './assets/styles/style.scss';
  @import './css/icons-codes.css';*/}

  @font-face {
    font-family: 'energicos-bold';
    src: url('assets/styles/fonts/gilroy-bold-webfont.woff2') format('woff2'),
         url('assets/styles/fonts/gilroy-bold-webfont.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
      font-family: 'energicos-semibold';
      src: url('assets/styles/fonts/gilroy-semibold-webfont.woff2') format('woff2'),
           url('assets/styles/fonts/gilroy-semibold-webfont.woff') format('woff');
      font-weight: normal;
      font-style: normal;
  }

  @font-face {
      font-family: 'energicos-medium';
      src: url('assets/styles/fonts/gilroy-medium-webfont.woff2') format('woff2'),
           url('assets/styles/fonts/gilroy-medium-webfont.woff') format('woff');
      font-weight: normal;
      font-style: normal;
  }

  @font-face {
    font-family: 'energicos-regular';
    src: url('assets/styles/fonts/gilroy-regular-webfont.woff2') format('woff2'),
         url('assets/styles/fonts/gilroy-regular-webfont.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
    font-family: 'energicos-icons';
    src: url'assets/styles/fonts/fontello.eot');
    src: url'assets/styles/fonts/fontello.eot') format('embedded-opentype'),
         url'assets/styles/fonts/fontello.woff2') format('woff2'),
         url'assets/styles/fonts/fontello.woff') format('woff'),
         url'assets/styles/fonts/fontello.ttf') format('truetype'),
         url'assets/styles/fonts/fontello.svg') format('svg');
    font-weight: normal;
    font-style: normal;
  }

  .icon-calendar[data-icon]:before {content: attr(data-icon);}
  .icon-calendar:before { content: '\e801'; }
  .icon-coins:before { content: '\e803'; }
  .icon-folder:before { content: '\e804'; }
  .icon-cabinet:before { content: '\e805'; }
  .icon-phone:before { content: '\e806'; }
  .icon-time:before { content: '\e807'; }
  .icon-users:before { content: '\e808'; }
  .icon-city:before { content: '\e809'; }

  #app {
    font-family: 'energicos-regular';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  ul {
    list-style-type: none;
  }

  .navigate_bt{
    margin-left:15px;
    margin-bottom:25px;
  }
  a.createinvoicebt {
    background-color: #6c757d;
    color: #fff;
    border-color: #6c757d;
    padding: 10px 15px;
    border-radius: 5px;
  }
</style>
